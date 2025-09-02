import Footer from "@/components/global/Footer";
import Navigation from "@/components/global/Navigation";
import { DestHero } from "@/components/destination/DestHero";
import { FilterSection } from "@/components/destination/FIlterSection";
import { DestList } from "@/components/destination/DestList";

const Destinations = () => {
    return (
      <div className="min-h-screen bg-background">
          <Navigation />
          
          {/* Hero Section */}
          <DestHero />

          {/* Filter Section */}
          <FilterSection />

          {/* Destinations Section */}
          <DestList />
          
          <Footer />
      </div>
  );
};

export default Destinations;