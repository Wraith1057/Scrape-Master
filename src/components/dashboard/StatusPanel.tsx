import { Activity, Terminal } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";

interface StatusPanelProps {
  isScrapin: boolean;
  progress: number;
  logs: string[];
}

export function StatusPanel({ isScrapin, progress, logs }: StatusPanelProps) {
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center">
          <Activity className="w-5 h-5 text-secondary-foreground" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-lg">Status & Logs</h2>
          <p className="text-sm text-muted-foreground">Real-time progress updates</p>
        </div>
      </div>

      {/* Progress Section */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Progress</span>
          <span className="text-sm text-muted-foreground">{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {isScrapin && (
          <div className="flex items-center gap-2 mt-3">
            <div className="relative">
              <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-primary rounded-full animate-pulse-ring" />
            </div>
            <span className="text-sm text-primary font-medium">Scraping in progress...</span>
          </div>
        )}
      </div>

      {/* Logs Section */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Terminal className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium">Activity Log</span>
        </div>
        <ScrollArea className="h-48 rounded-xl bg-muted/50 p-4">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity yet. Start a scraping task to see logs.
            </p>
          ) : (
            <div className="space-y-2">
              {logs.map((log, index) => (
                <div
                  key={index}
                  className="text-sm font-mono animate-fade-in"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <span className="text-muted-foreground mr-2">
                    [{new Date().toLocaleTimeString()}]
                  </span>
                  {log}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
