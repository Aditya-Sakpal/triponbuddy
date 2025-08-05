import Navigation from "@/components/Navigation";
import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/HeroSection";
import TripPlanningSection from "@/components/TripPlanningSection";
import TripDemoSection from "@/components/TripDemoSection";
import ExploreDestinationsSection from "@/components/ExploreDestinationsSection";
import WhyPlanSection from "@/components/WhyPlanSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeedbackSection from "@/components/FeedbackSection";
import EnhancedFeaturesSection from "@/components/EnhancedFeaturesSection";
import CommunitySection from "@/components/CommunitySection";
import Footer from "@/components/Footer";

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
      
      {/* Trip Demo Section */}
      <TripDemoSection />
      
      {/* Explore Destinations Section */}
      <ExploreDestinationsSection />
      
      {/* Why Plan Section */}
      <WhyPlanSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Feedback Section */}
      <FeedbackSection />
      
      {/* Enhanced Features Section */}
      <EnhancedFeaturesSection />
      
      {/* Community Section */}
      <CommunitySection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
