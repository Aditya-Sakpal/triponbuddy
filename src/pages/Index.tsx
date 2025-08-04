import Navigation from "@/components/Navigation";
import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/HeroSection";
import TripPlanningSection from "@/components/TripPlanningSection";

const Index = () => {
  return (
    <div className="relative">
      {/* Hero Section with Video Background */}
      <div className="relative min-h-screen overflow-hidden">
        <VideoBackground />
        <Navigation />
        <HeroSection />
      </div>
      
      {/* Trip Planning Section */}
      <TripPlanningSection />
    </div>
  );
};

export default Index;
