import { useState } from "react";
import { Image, Download, ExternalLink, Copy, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrapedData } from "@/pages/Dashboard";
import { toast } from "@/hooks/use-toast";

interface ImagePreviewProps {
  data: ScrapedData[];
  onExport?: (selectedIds: string[]) => void;
}

const IMAGES_PER_PAGE = 12;

export function ImagePreview({ data, onExport }: ImagePreviewProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedImages, setSelectedImages] = useState<Set<string>>(new Set());

  const imageItems = data.filter((item) => item.dataType === "Image");
  const totalPages = Math.ceil(imageItems.length / IMAGES_PER_PAGE);
  const startIndex = (currentPage - 1) * IMAGES_PER_PAGE;
  const endIndex = startIndex + IMAGES_PER_PAGE;
  const paginatedImages = imageItems.slice(startIndex, endIndex);

  const toggleImageSelection = (id: string) => {
    const newSelected = new Set(selectedImages);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedImages(newSelected);
  };

  const selectAllOnPage = () => {
    const newSelected = new Set(selectedImages);
    paginatedImages.forEach((item) => newSelected.add(item.id));
    setSelectedImages(newSelected);
  };

  const deselectAllOnPage = () => {
    const newSelected = new Set(selectedImages);
    paginatedImages.forEach((item) => newSelected.delete(item.id));
    setSelectedImages(newSelected);
  };

  const selectAll = () => {
    const newSelected = new Set<string>();
    imageItems.forEach((item) => newSelected.add(item.id));
    setSelectedImages(newSelected);
  };

  const deselectAll = () => {
    setSelectedImages(new Set());
  };

  const handleExport = () => {
    if (selectedImages.size === 0) {
      toast({
        title: "No images selected",
        description: "Please select at least one image to export.",
        variant: "destructive",
      });
      return;
    }
    onExport?.(Array.from(selectedImages));
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied to clipboard",
      description: "Image URL copied successfully",
    });
  };

  const openImage = (url: string) => {
    window.open(url, "_blank");
  };

  if (imageItems.length === 0) {
    return (
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Images</h2>
            <p className="text-sm text-muted-foreground">
              {imageItems.length} images extracted
            </p>
          </div>
        </div>
        <div className="text-center py-12 text-muted-foreground">
          <Image className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">No images found. Scrape a website with images to see them here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-rose-500 to-rose-400 flex items-center justify-center">
            <Image className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="font-display font-semibold text-lg">Images</h2>
            <p className="text-sm text-muted-foreground">
              {imageItems.length} images extracted {selectedImages.size > 0 && `• ${selectedImages.size} selected`}
            </p>
          </div>
        </div>
        {onExport && (
          <Button
            variant="default"
            size="sm"
            onClick={handleExport}
            className="gap-2"
            disabled={selectedImages.size === 0}
          >
            <Download className="w-4 h-4" />
            Export ({selectedImages.size})
          </Button>
        )}
      </div>

      {/* Selection Controls */}
      <div className="flex gap-2 mb-4 pb-4 border-b border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={selectAll}
          className="text-xs"
        >
          Select All
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={selectAllOnPage}
          className="text-xs"
        >
          Select Page
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAllOnPage}
          className="text-xs"
          disabled={selectedImages.size === 0}
        >
          Deselect Page
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={deselectAll}
          className="text-xs"
          disabled={selectedImages.size === 0}
        >
          Deselect All
        </Button>
      </div>

      {/* Image Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
        {paginatedImages.map((item) => {
          const imageUrl = item.content.split(" | alt:")[0].trim();
          const altText = item.content.includes(" | alt:") 
            ? item.content.split(" | alt:")[1] 
            : "Image";

          return (
            <div
              key={item.id}
              className={`group relative rounded-xl overflow-hidden bg-muted/50 border-2 transition-all duration-300 cursor-pointer ${
                selectedImages.has(item.id)
                  ? "border-primary bg-primary/5"
                  : "border-border/50 hover:border-primary/50"
              }`}
              onClick={() => toggleImageSelection(item.id)}
            >
              {/* Checkbox Overlay */}
              <div className="absolute top-2 left-2 z-10">
                <div
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                    selectedImages.has(item.id)
                      ? "bg-primary border-primary"
                      : "border-white/50 bg-black/20 hover:bg-black/40"
                  }`}
                >
                  {selectedImages.has(item.id) && (
                    <svg
                      className="w-3 h-3 text-primary-foreground"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="3"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  )}
                </div>
              </div>

              {/* Image Container */}
              <div className="aspect-square overflow-hidden bg-muted flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={altText}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect fill='%23f3f4f6' width='100' height='100'/%3E%3Ctext x='50' y='50' font-size='14' fill='%239ca3af' text-anchor='middle' dominant-baseline='middle'%3EImage not found%3C/text%3E%3C/svg%3E";
                  }}
                />
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2 p-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(imageUrl, item.id);
                  }}
                  title="Copy URL"
                >
                  {copiedId === item.id ? (
                    <Check className="w-4 h-4" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-white hover:bg-white/20"
                  onClick={(e) => {
                    e.stopPropagation();
                    openImage(imageUrl);
                  }}
                  title="Open in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>

              {/* Alt text tooltip */}
              <div className="p-2 text-xs text-muted-foreground truncate" title={altText}>
                {altText}
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Showing {startIndex + 1} to {Math.min(endIndex, imageItems.length)} of {imageItems.length} images
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            <div className="flex items-center gap-1">
              <span className="text-sm font-medium px-3 py-1">
                Page {currentPage} / {totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="gap-2"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
