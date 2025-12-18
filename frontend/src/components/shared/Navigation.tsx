import { Link, useLocation, useNavigate } from "react-router-dom";
import { Compass, Map, User, MessageCircle } from "lucide-react";
import tripBuddyLogo from "@/assets/triponbuddylogo.png";
import { AuthButtons } from "./AuthButtons";
import { NotificationBell } from "./NotificationBell";
import { navLinks } from "@/constants/nav";
import { useUser } from "@clerk/clerk-react";
import Dock, { type DockItemData } from "./MobileDock";

export const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();

  // Filter nav links based on authentication state
  const filteredNavLinks = navLinks.filter(link => !link.requiresAuth || isSignedIn);

  // Mobile dock items in specific order: Destinations, Explore, Home (logo), MySpace, Profile
  const mobileDockItems: DockItemData[] = [
    {
      icon: <Compass className="h-5 w-5 text-white" />,
      label: "Destinations",
      onClick: () => navigate("/explore"),
      className: location.pathname === "/explore" ? "ring-2 ring-white" : "",
    },
    {
      icon: <Map className="h-5 w-5 text-white" />,
      label: "Explore",
      onClick: () => navigate("/hosted-trips"),
      className: location.pathname === "/hosted-trips" ? "ring-2 ring-white" : "",
    },
    {
      icon: <img src={tripBuddyLogo} alt="Home" className="h-16 w-16 object-contain" />,
      label: "Home",
      onClick: () => navigate("/"),
      className: location.pathname === "/" ? "ring-2 ring-white" : "",
      isCenter: true,
    },
    {
      icon: <MessageCircle className="h-5 w-5 text-white" />,
      label: "MySpace",
      onClick: () => navigate("/forum"),
      className: location.pathname === "/forum" ? "ring-2 ring-white" : "",
    },
    {
      icon: <User className="h-5 w-5 text-white" />,
      label: "Profile",
      onClick: () => navigate("/profile"),
      className: location.pathname === "/profile" ? "ring-2 ring-white" : "",
    },
  ].filter(item => {
    // Filter MySpace based on auth
    if (item.label === "MySpace" || item.label === "Profile") {
      return isSignedIn;
    }
    return true;
  });

  return (
    <>
    {/* Top Navigation - hidden on mobile */}
    <nav className="hidden lg:block fixed -top-4 left-0 right-0 z-[70] bg-white shadow-md h-20">
      <div className="container mx-auto px-3 md:px-6 bg-white md:bg-transparent">
        <div className="flex items-center justify-between my-2 md:my-0 gap-2">
          {/* Left side: Logo */}
          <div className="flex items-center flex-shrink-0 lg:flex-1">
            <Link to="/" className="flex items-center">
              <img 
                src={tripBuddyLogo} 
                alt="TripBuddy" 
                className="h-16 md:h-20 lg:h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2">
            <div className="flex items-center space-x-3 xl:space-x-6">
              {filteredNavLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`text-xs xl:text-sm relative transition-all duration-300 hover:text-bula after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-bula after:transition-transform after:duration-300 after:origin-left after:content-[''] hover:after:scale-x-100 whitespace-nowrap ${
                    location.pathname === link.to 
                      ? 'text-bula after:scale-x-100' 
                      : 'text-gray-600 after:scale-x-0'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

            </div>
          </div>

          {/* Right side: Notifications, Auth buttons */}
          <div className="flex items-center space-x-1 md:space-x-2 flex-shrink-0 lg:flex-1 lg:justify-end">
            <div className="hidden lg:flex items-center space-x-1 xl:space-x-2">
              <NotificationBell />
              <div className="flex space-x-2 xl:space-x-3">
                <AuthButtons size="sm" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>

    {/* Mobile Dock Navigation - fixed at bottom for mobile only */}
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[80]">
      <Dock
        items={mobileDockItems}
        className="bg-blue-900 backdrop-blur-md"
        baseItemSize={44}
        magnification={60}
        centerItemSize={60}
        distance={150}
        panelHeight={72}
      />
    </div>
    </>
  );
};

