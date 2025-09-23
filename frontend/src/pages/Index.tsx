import { Navigation, Footer } from "@/components/shared";
import { HeroSection, 
        TripPlanningSection, 
        ExploreDestinationsSection, 
        WhyPlanSection, 
        TestimonialsSection, 
        FeedbackSection, 
        WhyTriponBuddySection, 
        HeroSlideShow } from "@/components/landing";
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > window.innerHeight * 0.1) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <div className="relative overflow-hidden">
      <div className="relative min-h-screen">
        <HeroSlideShow />
        <Navigation />
        <HeroSection />
      </div>
      
      {/* Trip Planning Section - Overlapping the hero section */}
      <div className="relative -mt-80 md:-mt-64 z-10">
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

      <button
        onClick={scrollToTop}
        className={`fixed bottom-4 right-4 bg-blue-500 hover:bg-blue-700 text-white rounded-full p-3 shadow-lg transition-opacity duration-700 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};

export default Index;
