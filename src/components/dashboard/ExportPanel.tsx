import { Download, FileJson, FileText, FileSpreadsheet, Image } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ScrapedData } from "@/pages/Dashboard";
import { toast } from "@/hooks/use-toast";

interface ExportPanelProps {
  data: ScrapedData[];
  setImageExportFn?: (fn: (selectedIds: string[]) => Promise<void>) => void;
}

export function ExportPanel({ data, setImageExportFn }: ExportPanelProps) {
  useEffect(() => {
    // Set the downloadImages function for ImagePreview to call
    if (setImageExportFn) {
      setImageExportFn((selectedIds: string[]) => downloadImages(selectedIds));
    }
  }, [data, setImageExportFn]);

  const exportAsCSV = () => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "Please scrape some data first.",
        variant: "destructive",
      });
      return;
    }

    const headers = ["ID", "Content", "Data Type", "Source URL", "Timestamp"];
    const rows = data.map((item) => [
      item.id,
      `"${item.content.replace(/"/g, '""')}"`,
      item.dataType,
      item.sourceUrl,
      item.timestamp.toISOString(),
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
    downloadFile(csv, "scraped-data.csv", "text/csv");

    toast({
      title: "Export successful",
      description: "Your data has been exported as CSV.",
    });
  };

  const exportAsJSON = () => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "Please scrape some data first.",
        variant: "destructive",
      });
      return;
    }

    const json = JSON.stringify(data, null, 2);
    downloadFile(json, "scraped-data.json", "application/json");

    toast({
      title: "Export successful",
      description: "Your data has been exported as JSON.",
    });
  };

  const exportAsTXT = () => {
    if (data.length === 0) {
      toast({
        title: "No data to export",
        description: "Please scrape some data first.",
        variant: "destructive",
      });
      return;
    }

    const txt = data
      .map(
        (item) =>
          `[${item.dataType}]\n${item.content}\nSource: ${item.sourceUrl}\n`
      )
      .join("\n---\n\n");
    downloadFile(txt, "scraped-data.txt", "text/plain");

    toast({
      title: "Export successful",
      description: "Your data has been exported as TXT.",
    });
  };

  const downloadImages = async (selectedImageIds: string[] = []) => {
    let imageItems = data.filter((item) => item.dataType === "Image");

    // Filter to only selected images if any were selected
    if (selectedImageIds.length > 0) {
      imageItems = imageItems.filter((item) => selectedImageIds.includes(item.id));
    }

    if (imageItems.length === 0) {
      toast({
        title: "No images found",
        description: "Please scrape images first.",
        variant: "destructive",
      });
      return;
    }

    try {
      const loadingToast = toast({
        title: "Exporting images...",
        description: `Downloading ${imageItems.length} images, this may take a moment.`,
      });

      // Dynamically import jszip
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();
      let downloadedCount = 0;
      let failedCount = 0;

      // Create a folder for images
      const imagesFolder = zip.folder("images");
      if (!imagesFolder) throw new Error("Failed to create images folder");

      // Download each image with improved error handling
      for (let i = 0; i < imageItems.length; i++) {
        const item = imageItems[i];
        try {
          // Extract image URL (remove alt text if present)
          let imageUrl = item.content.split(" | alt:")[0].trim();

          if (!imageUrl) {
            failedCount++;
            continue;
          }

          // Convert relative URLs to absolute
          if (!imageUrl.startsWith("http")) {
            try {
              const baseUrl = new URL(item.sourceUrl);
              imageUrl = new URL(imageUrl, baseUrl.origin).href;
            } catch {
              failedCount++;
              continue;
            }
          }

          if (!isValidUrl(imageUrl)) {
            failedCount++;
            continue;
          }

          // Try to fetch the image with multiple strategies
          let blob: Blob | null = null;

          // Strategy 1: Direct fetch
          try {
            const response = await Promise.race([
              fetch(imageUrl, { 
                mode: 'cors',
                credentials: 'omit'
              }),
              new Promise((_, reject) => 
                setTimeout(() => reject(new Error('Fetch timeout')), 5000)
              ),
            ]) as Response;

            if (response.ok) {
              blob = await response.blob();
            }
          } catch (directError) {
            console.log(`Direct fetch failed for ${imageUrl}, trying proxy...`, directError);
          }

          // Strategy 2: Use CORS proxy if direct fetch fails
          if (!blob) {
            try {
              const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(imageUrl)}`;
              const response = await Promise.race([
                fetch(proxyUrl),
                new Promise((_, reject) => 
                  setTimeout(() => reject(new Error('Proxy timeout')), 5000)
                ),
              ]) as Response;

              if (response.ok) {
                blob = await response.blob();
              }
            } catch (proxyError) {
              console.log(`Proxy fetch failed for ${imageUrl}`, proxyError);
            }
          }

          // Skip if we couldn't fetch the image
          if (!blob || blob.size === 0) {
            failedCount++;
            continue;
          }

          // Generate filename from URL
          const filename = generateImageFilename(imageUrl, downloadedCount);
          imagesFolder.file(filename, blob);
          downloadedCount++;
        } catch (error) {
          console.error(`Failed to download image ${i}:`, error);
          failedCount++;
        }
      }

      if (downloadedCount === 0) {
        toast({
          title: "Failed to download images",
          description: "Could not download any images. This may be due to CORS restrictions on the website.",
          variant: "destructive",
        });
        return;
      }

      // Generate ZIP file
      const zipBlob = await zip.generateAsync({ type: "blob" });
      
      if (zipBlob.size === 0) {
        throw new Error("Generated ZIP file is empty");
      }

      // Create download link and trigger download
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `scraped-images-${Date.now()}.zip`;
      document.body.appendChild(link);
      
      // Use setTimeout to ensure the link is properly added
      setTimeout(() => {
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 100);

      toast({
        title: "Images exported successfully",
        description: `Downloaded ${downloadedCount} image${downloadedCount !== 1 ? 's' : ''}${failedCount > 0 ? ` (${failedCount} failed due to CORS)` : ""}`,
      });
    } catch (error) {
      console.error("Error creating ZIP:", error);
      toast({
        title: "Export failed",
        description: error instanceof Error ? error.message : "Could not create ZIP file. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isValidUrl = (urlString: string): boolean => {
    try {
      new URL(urlString);
      return true;
    } catch {
      return false;
    }
  };

  const generateImageFilename = (url: string, index: number): string => {
    try {
      const urlObj = new URL(url);
      let pathname = urlObj.pathname;
      
      // Remove query parameters
      pathname = pathname.split('?')[0];
      
      // Get filename from pathname
      const filename = pathname.split("/").pop();
      
      if (filename && filename.length > 0 && /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename)) {
        return filename;
      }
      
      // Default fallback with proper extension
      return `image-${index}.jpg`;
    } catch {
      return `image-${index}.jpg`;
    }
  };

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportButtons = [
    {
      icon: FileSpreadsheet,
      label: "CSV",
      onClick: exportAsCSV,
      color: "from-emerald-500 to-emerald-400",
    },
    {
      icon: FileJson,
      label: "JSON",
      onClick: exportAsJSON,
      color: "from-amber-500 to-amber-400",
    },
    {
      icon: FileText,
      label: "TXT",
      onClick: exportAsTXT,
      color: "from-blue-500 to-blue-400",
    },
    {
      icon: Image,
      label: "Images (ZIP)",
      onClick: downloadImages,
      color: "from-rose-500 to-rose-400",
    },
  ];

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-400 flex items-center justify-center">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Export Data</h2>
          <p className="text-sm text-muted-foreground">Download in your preferred format</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {exportButtons.map((btn) => (
          <Button
            key={btn.label}
            variant="outline"
            className="h-auto py-4 flex flex-col gap-2 group hover:shadow-lg transition-shadow duration-300"
            onClick={btn.onClick}
            disabled={data.length === 0}
          >
            <div
              className={`w-10 h-10 rounded-xl bg-gradient-to-br ${btn.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
            >
              <btn.icon className="w-5 h-5 text-white" />
            </div>
            <span className="font-medium">{btn.label}</span>
          </Button>
        ))}
      </div>

      {data.length === 0 && (
        <p className="text-sm text-muted-foreground text-center mt-4">
          Export options will be available after scraping data.
        </p>
      )}
    </div>
  );
}
