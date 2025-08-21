import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link } from "react-router-dom";
import tripBuddyLogo from "@/assets/tripbuddy-logo-light.png";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
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
            <Link to="/" className="text-white hover:text-primary transition-colors border-b-2 border-primary pb-1">
              Home
            </Link>
            <Link to="/explore-destinations" className="text-white/80 hover:text-white transition-colors">
              Destinations
            </Link>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Seasonal
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              My Trips
            </a>
            <a href="#" className="text-white/80 hover:text-white transition-colors">
              Contact
            </a>
          </div>

          {/* User Profile */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 text-white">
              <Avatar className="w-8 h-8 bg-primary">
                <AvatarFallback className="bg-primary text-white text-sm">A</AvatarFallback>
              </Avatar>
              <span className="text-sm">Aditya Sakpal</span>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              className="bg-primary border-primary text-white hover:bg-primary/90 hover:text-white"
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