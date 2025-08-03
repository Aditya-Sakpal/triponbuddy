import Navigation from "@/components/Navigation";
import BackgroundCarousel from "@/components/BackgroundCarousel";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background Carousel */}
      <BackgroundCarousel />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
    </div>
  );
};

export default Index;
