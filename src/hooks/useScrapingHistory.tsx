import { useState, useEffect } from "react";

export interface ScrapingHistoryItem {
  id: string;
  url: string;
  data_type: string;
  content_filters: Record<string, boolean> | null;
  pages_scraped: number;
  items_found: number;
  status: string;
  created_at: string;
}

const STORAGE_KEY = "scraping_history";
const MAX_HISTORY = 20;

export function useScrapingHistory() {
  const [history, setHistory] = useState<ScrapingHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setHistory(parsed);
      }
    } catch (error) {
      console.error("Failed to load history:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const addHistoryItem = (
    url: string,
    dataType: string,
    contentFilters: Record<string, boolean>,
    pagesScraped: number,
    itemsFound: number
  ) => {
    try {
      const newItem: ScrapingHistoryItem = {
        id: Date.now().toString(),
        url,
        data_type: dataType,
        content_filters: contentFilters,
        pages_scraped: pagesScraped,
        items_found: itemsFound,
        status: "completed",
        created_at: new Date().toISOString(),
      };

      setHistory((prev) => {
        const updated = [newItem, ...prev];
        // Keep only the most recent MAX_HISTORY items
        const limited = updated.slice(0, MAX_HISTORY);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(limited));
        return limited;
      });
    } catch (error) {
      console.error("Failed to add history item:", error);
    }
  };

  const deleteHistoryItem = (id: string) => {
    try {
      setHistory((prev) => {
        const updated = prev.filter((item) => item.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });
    } catch (error) {
      console.error("Failed to delete history item:", error);
    }
  };

  const clearHistory = () => {
    try {
      setHistory([]);
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("Failed to clear history:", error);
    }
  };

  return { history, loading, addHistoryItem, deleteHistoryItem, clearHistory, refetch: loadHistory };
}
