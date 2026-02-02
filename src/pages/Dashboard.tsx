import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { ScrapingPanel } from "@/components/dashboard/ScrapingPanel";
import { StatusPanel } from "@/components/dashboard/StatusPanel";
import { DataPreview } from "@/components/dashboard/DataPreview";
import { ImagePreview } from "@/components/dashboard/ImagePreview";
import { ExportPanel } from "@/components/dashboard/ExportPanel";
import { HistoryPanel } from "@/components/dashboard/HistoryPanel";
import { useScrapingHistory } from "@/hooks/useScrapingHistory"; 

export interface ScrapedData {
  id: string;
  content: string;
  sourceUrl: string;
  dataType: string;
  timestamp: Date;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { addHistoryItem, history, loading: historyLoading, deleteHistoryItem, clearHistory } = useScrapingHistory();
  const imageExportRef = useRef<(selectedIds: string[]) => void>(async () => {});
  
  const [isScrapin, setIsScraping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([]);



  const performScraping = async (startUrl: string, options: any) => {
    setIsScraping(true);
    setProgress(0);
    setLogs([]);
    setScrapedData([]);

    const maxPages = options.maxPages || 10;
    const pageDepth = options.pageDepth || 1;
    const sameDomainOnly = options.sameDomainOnly ?? true;

    const visited = new Set<string>();
    type QueueItem = { url: string; depth: number };
    const queue: QueueItem[] = [{ url: startUrl, depth: 1 }];

    let pagesScraped = 0;
    const results: ScrapedData[] = [];

    const addLog = (text: string) => setLogs(prev => [...prev, text]);

    addLog(`🌐 Starting scraping of ${startUrl}`);

    // Helper: fetch via multiple proxies with retries
    const fetchWithRetries = async (targetUrl: string) => {
      const proxies = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://r.jina.ai/http://${u.replace(/^https?:\/\//, "")}`,
      ];

      for (const proxyFn of proxies) {
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            const proxyUrl = proxyFn(targetUrl);
            addLog(`🌐 Fetch attempt ${attempt} via proxy: ${proxyUrl}`);
            console.debug(`Fetching ${targetUrl} via ${proxyUrl} (attempt ${attempt})`);
            const r = await fetch(proxyUrl);
            if (!r.ok) throw new Error(`Proxy responded ${r.status} ${r.statusText}`);
            return r;
          } catch (err: any) {
            console.error(`Fetch attempt ${attempt} failed for ${targetUrl}:`, err);
            addLog(`⚠️ Fetch attempt ${attempt} failed: ${err.message || err}`);
            // small backoff
            await new Promise((res) => setTimeout(res, 300 * attempt));
          }
        }
      }
      return null;
    };

    try {
      const startOrigin = new URL(startUrl).origin;

      while (queue.length > 0 && pagesScraped < maxPages) {
        const { url, depth } = queue.shift() as QueueItem;
        if (visited.has(url)) continue;
        visited.add(url);

        addLog(`📡 Fetching ${url}`);
        setProgress((pagesScraped / maxPages) * 100);

        try {
          const res = await fetchWithRetries(url);
          if (!res) {
            addLog(`❌ All fetch attempts failed for ${url}`);
            continue;
          }

          const html = await res.text();
          addLog(`🔍 Parsing response from ${url}`);

          // If the response isn't HTML (e.g., plain text or markdown from a proxy), handle gracefully
          if (!/<!doctype\s+html|<html\b/i.test(html)) {
            addLog(`ℹ️ Response appears to be plain text/markdown; treating as text`);
            const textSample = html.trim().slice(0, 200);
            if (textSample) {
              const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
              results.push({ id, content: textSample, sourceUrl: url, dataType: "Text", timestamp: new Date() });
            }
            pagesScraped++;
            setProgress(Math.min(100, (pagesScraped / maxPages) * 100));
            continue;
          }

          // DOMParser may throw if response is not valid HTML
          let doc: Document | null = null;
          try {
            const parser = new DOMParser();
            doc = parser.parseFromString(html, "text/html");
          } catch (parseErr: any) {
            console.error(`Error parsing HTML from ${url}:`, parseErr);
            addLog(`❌ Error parsing HTML from ${url}: ${parseErr.message || parseErr}`);
            continue;
          }

          if (!doc) {
            addLog(`❌ Unable to parse document for ${url}`);
            continue;
          }

          // Helper to push found items
          let found = 0;
          const pushItem = (content: string, dataType: string) => {
            const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
            results.push({ id, content, sourceUrl: url, dataType, timestamp: new Date() });
            found++;
          };

          // Extract based on options
          if (options.headings) {
            const headings = Array.from(doc.querySelectorAll("h1,h2,h3,h4,h5,h6"));
            headings.forEach(h => pushItem(h.textContent?.trim() || "", "Heading"));
          }

          if (options.paragraphs) {
            const paragraphs = Array.from(doc.querySelectorAll("p"));
            paragraphs.forEach(p => pushItem(p.textContent?.trim() || "", "Paragraph"));
          }

          if (options.images || options.dataType === "images") {
            const imgs = Array.from(doc.querySelectorAll("img[src]"));
            imgs.forEach(img => {
              let imgSrc = img.getAttribute("src") || "";
              // Convert relative URLs to absolute
              if (imgSrc && !imgSrc.startsWith("http")) {
                try {
                  imgSrc = new URL(imgSrc, url).href;
                } catch {
                  // If conversion fails, keep original
                }
              }
              pushItem(imgSrc + (img.getAttribute("alt") ? ` | alt: ${img.getAttribute("alt")}` : ""), "Image");
            });
          }

          if (options.links || options.dataType === "links") {
            const anchors = Array.from(doc.querySelectorAll("a[href]"));
            anchors.forEach(a => {
              const href = a.getAttribute("href") || "";
              try {
                const absolute = new URL(href, url).href;
                pushItem(absolute + (a.textContent ? ` | text: ${a.textContent.trim()}` : ""), "Link");
              } catch {
                // ignore invalid urls
              }
            });
          }

          if (options.dataType === "tables" || options.dataType === "all" || options.dataType === "text") {
            const tables = Array.from(doc.querySelectorAll("table"));
            tables.forEach(table => {
              const rows = Array.from(table.querySelectorAll("tr")).map(r =>
                Array.from(r.querySelectorAll("th,td")).map(c => c.textContent?.trim() || "").join(" | ")
              ).join("\n");
              if (rows) pushItem(rows, "Table");
            });
          }

          pagesScraped++;
          addLog(`✅ Parsed ${url} — found ${found} items`);
          setProgress(Math.min(100, (pagesScraped / maxPages) * 100));

          // Enqueue links for next depth
          if (depth < pageDepth) {
            const anchors = Array.from(doc.querySelectorAll("a[href]")).map(a => a.getAttribute("href") || "");
            for (const href of anchors) {
              try {
                const absolute = new URL(href, url).href;
                if (visited.has(absolute)) continue;
                if (sameDomainOnly && new URL(absolute).origin !== startOrigin) continue;
                queue.push({ url: absolute, depth: depth + 1 });
              } catch {
                // ignore invalid urls
              }
            }
          }

        } catch (e: any) {
          addLog(`❌ Error processing ${url}: ${e.message}`);
        }
      }

      setScrapedData(results);
      setIsScraping(false);
      setProgress(100);

      // Save to history (best-effort)
      try {
        addHistoryItem(
          startUrl,
          options.dataType || "mixed",
          options || {},
          pagesScraped,
          results.length
        );
      } catch (historyErr: any) {
        console.error("Failed to save scraping history:", historyErr);
        addLog(`⚠️ Could not save history: ${historyErr.message || historyErr}`);
      }

      addLog(`🏁 Scraping finished: ${pagesScraped} page(s), ${results.length} item(s) collected`);

    } catch (err: any) {
      addLog(`❌ Unexpected error: ${err.message || String(err)}`);
      setIsScraping(false);
    }
  };

  const clearAll = () => {
    setProgress(0);
    setLogs([]);
    setScrapedData([]);
    setIsScraping(false);
  };





  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      <main className="pt-20 pb-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-display text-3xl sm:text-4xl font-bold mb-2">
              Scraping <span className="gradient-text">Dashboard</span>
            </h1>
            <p className="text-muted-foreground">
              Configure and start your web scraping tasks
            </p>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Input & Status */}
            <div className="lg:col-span-1 space-y-6">
              <ScrapingPanel 
                onStartScraping={performScraping}
                onClear={clearAll}
                isScrapin={isScrapin}
              />
              <StatusPanel 
                isScrapin={isScrapin}
                progress={progress}
                logs={logs}
              />
              <HistoryPanel 
                history={history}
                loading={historyLoading}
                onDelete={deleteHistoryItem}
                onClearAll={clearHistory}
              />
            </div>

            {/* Right Column - Data Preview & Export */}
            <div className="lg:col-span-2 space-y-6">
              <DataPreview data={scrapedData} />
              <ImagePreview 
                data={scrapedData}
                onExport={(selectedIds) => imageExportRef.current(selectedIds)}
              />
              <ExportPanel 
                data={scrapedData}
                setImageExportFn={(fn) => { imageExportRef.current = fn; }}
              />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
