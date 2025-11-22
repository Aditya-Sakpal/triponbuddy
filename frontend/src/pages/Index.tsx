import { HeroSection, 
        TripPlanningSection, 
        ExploreDestinationsSection, 
        WhyPlanSection, 
        TestimonialsSection, 
        FeedbackSection, 
        WhyTriponBuddySection, 
        HeroSlideShow,
        NearbyPlacesSection } from "@/components/landing";

const Index = () => {

  return (
    <div className="relative overflow-hidden bg-white">
      <div className="relative bg-white">
        <HeroSlideShow />
        <HeroSection />
      </div>
      
      {/* Trip Planning Section - Overlapping the hero section */}
      <div className="relative -mt-16 z-10">
        <TripPlanningSection />
      </div> 
      
      {/* Main content area with white background */}
      <div>
        <NearbyPlacesSection />
        
        <ExploreDestinationsSection />
        
        <WhyPlanSection />
        
        <TestimonialsSection />
        
        <FeedbackSection />
        
        <WhyTriponBuddySection />
      </div>
    </div>
  );
};

export default Index;
