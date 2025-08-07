import Navigation from "@/components/Navigation";
import VideoBackground from "@/components/VideoBackground";
import HeroSection from "@/components/HeroSection";
import TripPlanningSection from "@/components/TripPlanningSection";
import ExploreDestinationsSection from "@/components/ExploreDestinationsSection";
import WhyPlanSection from "@/components/WhyPlanSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeedbackSection from "@/components/FeedbackSection";
import WhyTriponBuddySection from "@/components/WhyTriponBuddySection";
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
      
      {/* Explore Destinations Section */}
      <ExploreDestinationsSection />
      
      {/* Why Plan Section */}
      <WhyPlanSection />
      
      {/* Testimonials Section */}
      <TestimonialsSection />
      
      {/* Feedback Section */}
      <FeedbackSection />
      
      {/* Why TriponBuddy Section */}
      <WhyTriponBuddySection />
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
