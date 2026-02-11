// Simple Node/Express scraper backend for Scrape Master
// - Fetches target URL server-side (no browser CORS issues)
// - Returns raw HTML to the React dashboard

import express from "express";
import cors from "cors";

const app = express();
const PORT = process.env.SCRAPER_PORT || 4000;

// Allow frontend dev origins; you can adjust this list if needed.
const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:8080",
  "http://127.0.0.1:8080",
  "http://localhost:8081",
  "http://127.0.0.1:8081",
];

app.use(
  cors({
    origin(origin, callback) {
      // Allow non-browser tools (no origin) and our known dev origins
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, false);
      }
    },
  })
);

app.get("/scrape", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
  }

  try {
    // Basic validation to only allow http/https
    let url;
    try {
      url = new URL(targetUrl);
      if (!/^https?:$/.test(url.protocol)) {
        return res.status(400).json({ error: "Only http/https URLs are allowed" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000); // 15s timeout

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        // Some sites require a User-Agent
        "User-Agent":
          "ScrapeMasterBot/1.0 (+https://example.com; for educational/demo use only)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Target responded with ${response.status} ${response.statusText}` });
    }

    const html = await response.text();

    return res.json({
      html,
      finalUrl: response.url || url.toString(),
    });
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Request to target site timed out" });
    }
    console.error("Scraper error:", err);
    return res.status(500).json({ error: "Failed to fetch target URL" });
  }
});

// Proxy endpoint for images so the frontend can download them without CORS issues
app.get("/image", async (req, res) => {
  const targetUrl = req.query.url;

  if (!targetUrl || typeof targetUrl !== "string") {
    return res.status(400).json({ error: "Missing or invalid 'url' query parameter" });
  }

  try {
    let url;
    try {
      url = new URL(targetUrl);
      if (!/^https?:$/.test(url.protocol)) {
        return res.status(400).json({ error: "Only http/https URLs are allowed" });
      }
    } catch {
      return res.status(400).json({ error: "Invalid URL" });
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(url.toString(), {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "ScrapeMasterBot/1.0 (+https://example.com; for educational/demo use only)",
        Accept: "image/*,*/*;q=0.8",
      },
    });

    clearTimeout(timeout);

    if (!response.ok) {
      return res
        .status(response.status)
        .json({ error: `Image responded with ${response.status} ${response.statusText}` });
    }

    // Pipe content-type from remote response if available
    const contentType = response.headers.get("content-type") || "application/octet-stream";
    res.setHeader("Content-Type", contentType);

    // Stream the image back
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return res.send(buffer);
  } catch (err) {
    if (err.name === "AbortError") {
      return res.status(504).json({ error: "Image request timed out" });
    }
    console.error("Image proxy error:", err);
    return res.status(500).json({ error: "Failed to fetch image URL" });
  }
});

app.get("/", (_req, res) => {
  res.json({ status: "ok", message: "Scrape Master backend is running" });
});

app.listen(PORT, () => {
  console.log(`Scraper server running on http://localhost:${PORT}`);
});

