import { Footer, Navigation } from "@/components/shared";
import { HeroSection, FilterSection, DestList } from "@/components/destination";

const Destinations = () => {
    return (
      <div className="min-h-screen bg-background">
          <Navigation />
          
          <HeroSection />

          <FilterSection />

          <DestList />
          
          <Footer />
      </div>
  );
};

export default Destinations;