import Navigation from "@/components/global/Navigation";
import HeroSlideShow from "@/components/HeroSlideShow";
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
        <HeroSlideShow />
        <Navigation />
        <HeroSection />
      </div>
      
      {/* Trip Planning Section - Overlapping the hero section */}
      <div className="relative -mt-56 z-10">
        <TripPlanningSection />
      </div>
      
      {/* Main content area with white background */}
      <div className="bg-white pt-16">
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
    </div>
  );
};

export default Index;
