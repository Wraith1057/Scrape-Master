import { 
  Globe, 
  FileText, 
  Image, 
  Link2, 
  Table2, 
  Download, 
  Shield, 
  Zap,
  Search,
  Settings
} from "lucide-react";

const features = [
  {
    icon: Globe,
    title: "Any Website",
    description: "Extract data from virtually any public website with our intelligent scraping engine.",
    color: "from-primary to-primary/70",
  },
  {
    icon: FileText,
    title: "Text Extraction",
    description: "Pull headings, paragraphs, and structured text content automatically.",
    color: "from-secondary to-secondary/70",
  },
  {
    icon: Image,
    title: "Image Scraping",
    description: "Download all images with a single click, organized and ready to use.",
    color: "from-emerald-500 to-emerald-400",
  },
  {
    icon: Link2,
    title: "Link Discovery",
    description: "Find and extract all hyperlinks, internal and external, from any page.",
    color: "from-blue-500 to-blue-400",
  },
  {
    icon: Table2,
    title: "Table Parsing",
    description: "Automatically detect and extract tabular data into structured formats.",
    color: "from-amber-500 to-amber-400",
  },
  {
    icon: Download,
    title: "Multiple Exports",
    description: "Export your data as CSV, JSON, TXT, or download images as ZIP.",
    color: "from-rose-500 to-rose-400",
  },
  {
    icon: Search,
    title: "Deep Crawling",
    description: "Crawl multiple pages with configurable depth and domain restrictions.",
    color: "from-cyan-500 to-cyan-400",
  },
  {
    icon: Shield,
    title: "Ethical Scraping",
    description: "Built-in respect for robots.txt and responsible data collection.",
    color: "from-violet-500 to-violet-400",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
            <Settings className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Powerful Features</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold mb-6">
            Everything You Need to{" "}
            <span className="gradient-text">Extract Data</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            A complete toolkit for web scraping, designed for simplicity and power.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="glass-card rounded-2xl p-6 tilt-card group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="glass-card rounded-2xl p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-4 mb-4">
              <Zap className="w-8 h-8 text-primary" />
              <h3 className="font-display text-2xl font-bold">Ready to get started?</h3>
            </div>
            <p className="text-muted-foreground mb-6">
              Join thousands of users extracting data effortlessly every day.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
