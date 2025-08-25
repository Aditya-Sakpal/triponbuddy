import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import tripBuddyLogo from "@/assets/tripbuddy-logo-light.png";

const Navigation = () => {
  const location = useLocation();
  const [isDarkText, setIsDarkText] = useState(false);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          // Get the navbar height to check what's behind it
          const navHeight = 80; // Approximate height of the navbar
          
          // Check the element at the position just below the navbar
          const elementBelow = document.elementFromPoint(window.innerWidth / 2, navHeight);
          
          if (elementBelow) {
            // Get the computed background color of the element and its parents
            let currentElement = elementBelow;
            let backgroundColor = '';
            
            // Traverse up the DOM tree to find the actual background color
            while (currentElement && currentElement !== document.body) {
              const style = window.getComputedStyle(currentElement);
              const bgColor = style.backgroundColor;
              
              // Check if the background color is not transparent
              if (bgColor && bgColor !== 'rgba(0, 0, 0, 0)' && bgColor !== 'transparent') {
                backgroundColor = bgColor;
                break;
              }
              currentElement = currentElement.parentElement;
            }
            
            // Check if the background is white or very light
            const isLightBackground = isBackgroundLight(backgroundColor);
            setIsDarkText(isLightBackground);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    // Function to determine if a background color is light
    const isBackgroundLight = (bgColor: string): boolean => {
      if (!bgColor || bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)') {
        return false;
      }

      // Parse RGB values from the background color
      const rgb = bgColor.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        const r = parseInt(rgb[0]);
        const g = parseInt(rgb[1]);
        const b = parseInt(rgb[2]);
        
        // Calculate luminance
        const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        
        // Return true if luminance is high (light background)
        return luminance > 0.7;
      }
      
      return false;
    };

    // Add scroll event listener
    window.addEventListener('scroll', handleScroll);
    
    // Check initial state
    handleScroll();
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Dynamic classes based on background
  const textColorClass = isDarkText ? 'text-gray-800' : 'text-white';
  const textColorClassSecondary = isDarkText ? 'text-gray-600' : 'text-white/80';
  const avatarTextClass = isDarkText ? 'text-gray-800' : 'text-white';
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20 transition-all duration-300">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-center gap-24">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img 
              src={tripBuddyLogo} 
              alt="TripBuddy" 
              className="h-12 w-auto"
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              to="/" 
              className={`hover:text-primary transition-all duration-300 pb-1 font-latin ${
                location.pathname === "/" 
                  ? `${textColorClass} border-b-2 border-primary` 
                  : textColorClassSecondary
              }`}
            >
              Home
            </Link>
            <Link 
              to="/explore-destinations" 
              className={`hover:text-primary transition-all duration-300 pb-1 font-latin ${
                location.pathname === "/explore-destinations" 
                  ? `${textColorClass} border-b-2 border-primary` 
                  : textColorClassSecondary
              }`}
            >
              Destinations
            </Link>
            <Link 
              to="/seasonal" 
              className={`hover:text-primary transition-all duration-300 pb-1 font-latin ${
                location.pathname === "/seasonal" 
                  ? `${textColorClass} border-b-2 border-primary` 
                  : textColorClassSecondary
              }`}
            >
              Seasonal
            </Link>
            <a href="#" className={`${textColorClassSecondary} hover:text-primary transition-all duration-300 pb-1 font-latin`}>
              My Trips
            </a>
            <Link 
              to="/contact" 
              className={`hover:text-primary transition-all duration-300 pb-1 font-latin ${
                location.pathname === "/contact" 
                  ? `${textColorClass} border-b-2 border-primary` 
                  : textColorClassSecondary
              }`}
            >
              Contact
            </Link>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className={`hidden md:flex items-center space-x-2 transition-all duration-300 ${avatarTextClass}`}>
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback className="bg-primary text-white text-sm">A</AvatarFallback>
              </Avatar>
              <span className="text-sm font-latin">Aditya Sakpal</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-primary border-primary text-white hover:bg-primary/90 hover:text-white font-latin"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;