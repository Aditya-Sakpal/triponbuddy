import { Navigation, Footer } from "@/components/shared";
import { HeroSection, 
        TripPlanningSection, 
        ExploreDestinationsSection, 
        WhyPlanSection, 
        TestimonialsSection, 
        FeedbackSection, 
        WhyTriponBuddySection, 
        HeroSlideShow } from "@/components/landing";

const Index = () => {
  return (
    <div className="relative">
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
        <ExploreDestinationsSection />
        
        <WhyPlanSection />
        
        <TestimonialsSection />
        
        <FeedbackSection />
        
        <WhyTriponBuddySection />
        
        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Index;
