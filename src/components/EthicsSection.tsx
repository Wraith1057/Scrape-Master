import { Shield, BookOpen, Lock, Heart } from "lucide-react";

const ethicsPoints = [
  {
    icon: Shield,
    title: "Respects robots.txt",
    description: "Our tool automatically checks and respects website robots.txt directives.",
  },
  {
    icon: BookOpen,
    title: "Educational Purpose",
    description: "Designed for learning, research, and legitimate data collection needs.",
  },
  {
    icon: Lock,
    title: "No Private Data",
    description: "We don't access password-protected or restricted content.",
  },
  {
    icon: Heart,
    title: "Responsible Use",
    description: "Rate limiting and respectful crawling to minimize server impact.",
  },
];

export function EthicsSection() {
  return (
    <section id="ethics" className="py-24 relative">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card mb-6">
              <Shield className="w-4 h-4 text-secondary" />
              <span className="text-sm font-medium">Ethical Standards</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
              Committed to <span className="gradient-text">Responsible Scraping</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We believe in ethical data collection. Our tool is built with responsibility at its core.
            </p>
          </div>

          {/* Ethics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ethicsPoints.map((point, index) => (
              <div
                key={index}
                className="glass-card rounded-2xl p-6 flex gap-4 items-start tilt-card"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-secondary to-secondary/70 flex items-center justify-center flex-shrink-0 shadow-glow-secondary">
                  <point.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-2">{point.title}</h3>
                  <p className="text-sm text-muted-foreground">{point.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 glass-card rounded-2xl p-6 border-l-4 border-warning">
            <h4 className="font-semibold text-warning-foreground bg-warning/20 inline-block px-2 py-1 rounded mb-2">
              ⚠️ Disclaimer
            </h4>
            <p className="text-sm text-muted-foreground">
              This tool is provided for educational and legitimate research purposes only. 
              Users are responsible for ensuring their use complies with applicable laws, 
              terms of service, and ethical guidelines. Always obtain proper authorization 
              before scraping any website.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
