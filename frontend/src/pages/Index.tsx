import Navigation from "@/components/global/Navigation";
import HeroSlideShow from "@/components/landing/HeroSlideShow";
import HeroSection from "@/components/landing/HeroSection";
import TripPlanningSection from "@/components/landing/TripPlanningSection";
import ExploreDestinationsSection from "@/components/landing/ExploreDestinationsSection";
import WhyPlanSection from "@/components/landing/WhyPlanSection";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FeedbackSection from "@/components/landing/FeedbackSection";
import WhyTriponBuddySection from "@/components/landing/WhyTriponBuddySection";
import Footer from "@/components/global/Footer";

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
