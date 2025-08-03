import Navigation from "@/components/Navigation";
import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/HeroSection";

const Index = () => {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Video Background */}
      <VideoBackground />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Hero Section */}
      <HeroSection />
    </div>
  );
};

export default Index;
