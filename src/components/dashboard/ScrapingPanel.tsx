import { useState } from "react";
import { Globe, ChevronDown, Play, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ScrapingPanelProps {
  onStartScraping: (url: string, options: any) => void;
  onClear: () => void;
  isScrapin: boolean;
}

export function ScrapingPanel({ onStartScraping, onClear, isScrapin }: ScrapingPanelProps) {
  const [url, setUrl] = useState("");
  const [dataType, setDataType] = useState("text");
  const [urlError, setUrlError] = useState("");
  const [options, setOptions] = useState({
    headings: true,
    paragraphs: true,
    images: false,
    links: false,
    pageDepth: 1,
    maxPages: 10,
    sameDomainOnly: true,
  });

  const validateUrl = (value: string) => {
    if (!value) {
      setUrlError("URL is required");
      return false;
    }

    // Auto-prefix protocol if missing
    let normalized = value.trim();
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = `https://${normalized}`;
    }

    try {
      new URL(normalized);
      setUrlError("");
      // update the input to the normalized URL so users see the full URL
      setUrl(normalized);
      return true;
    } catch {
      setUrlError("Please enter a valid URL");
      return false;
    }
  };

  const handleSubmit = () => {
    if (validateUrl(url)) {
      onStartScraping(url, { dataType, ...options });
    }
  }; 

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center">
          <Globe className="w-5 h-5 text-primary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Input Panel</h2>
          <p className="text-sm text-muted-foreground">Configure your scraping task</p>
        </div>
      </div>

      <div className="space-y-5">
        {/* URL Input */}
        <div className="space-y-2">
          <Label htmlFor="url">Target URL</Label>
          <div className="relative">
            <Input
              id="url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                if (urlError) validateUrl(e.target.value);
              }}
              onBlur={() => url && validateUrl(url)}
              className={`pl-4 pr-4 h-12 ${urlError ? 'border-destructive' : ''}`}
            />
          </div>
          {urlError && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertCircle className="w-4 h-4" />
              {urlError}
            </div>
          )}
        </div>

        {/* Data Type Select */}
        <div className="space-y-2">
          <Label>Data Type</Label>
          <Select value={dataType} onValueChange={setDataType}>
            <SelectTrigger className="h-12">
              <SelectValue placeholder="Select data type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Text Content</SelectItem>
              <SelectItem value="images">Images</SelectItem>
              <SelectItem value="links">Links</SelectItem>
              <SelectItem value="tables">Tables</SelectItem>
              <SelectItem value="all">All Data</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Content Filters */}
        <div className="space-y-3">
          <Label>Content Filters</Label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "headings", label: "Headings (H1-H6)" },
              { key: "paragraphs", label: "Paragraphs" },
              { key: "images", label: "Images" },
              { key: "links", label: "Anchor Links" },
            ].map((item) => (
              <div key={item.key} className="flex items-center gap-2">
                <Checkbox
                  id={item.key}
                  checked={options[item.key as keyof typeof options] as boolean}
                  onCheckedChange={(checked) =>
                    setOptions({ ...options, [item.key]: checked })
                  }
                />
                <Label htmlFor={item.key} className="text-sm cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Advanced Options */}
        <div className="space-y-4 pt-4 border-t border-border">
          <div className="flex items-center justify-between">
            <Label htmlFor="depth" className="text-sm">Page Depth</Label>
            <Select
              value={String(options.pageDepth)}
              onValueChange={(val) => setOptions({ ...options, pageDepth: Number(val) })}
            >
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="pages" className="text-sm">Max Pages</Label>
            <Select
              value={String(options.maxPages)}
              onValueChange={(val) => setOptions({ ...options, maxPages: Number(val) })}
            >
              <SelectTrigger className="w-24 h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[5, 10, 25, 50, 100].map((n) => (
                  <SelectItem key={n} value={String(n)}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="sameDomain" className="text-sm">Same Domain Only</Label>
            <Switch
              id="sameDomain"
              checked={options.sameDomainOnly}
              onCheckedChange={(checked) =>
                setOptions({ ...options, sameDomainOnly: checked })
              }
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="hero"
            className="flex-1"
            onClick={handleSubmit}
            disabled={isScrapin}
          >
            {isScrapin ? (
              <>
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Scraping...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" />
                Start Scraping
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClear} disabled={isScrapin}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
