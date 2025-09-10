import { Navigation, Footer } from "@/components/shared";
import { HeroSection, SeasonalTabs } from "@/components/seasonal";

const Seasonal = () => {

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <HeroSection />

      <SeasonalTabs />

      <Footer />
    </div>
  );
};

export default Seasonal;
