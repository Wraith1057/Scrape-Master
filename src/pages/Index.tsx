import { Navbar } from "@/components/Navbar";
import { HeroSection } from "@/components/HeroSection";
import { FeaturesSection } from "@/components/FeaturesSection";
import { EthicsSection } from "@/components/EthicsSection";
import { Footer } from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background theme-transition">
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <EthicsSection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
