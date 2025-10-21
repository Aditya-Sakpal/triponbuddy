import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { LuX, LuMenu } from "react-icons/lu";
import tripBuddyLogo from "@/assets/triponbuddylogo.png";
import { AuthButtons } from "./AuthButtons";
import { MobileMenu } from "./MobileMenu";
import { navLinks } from "@/constants/nav";

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className="fixed -top-4 left-0 right-0 z-[70] bg-white shadow-md h-20">
      <div className="container mx-auto px-6 md:px-24 bg-white md:bg-transparent">
        <div className="flex items-center justify-center my-2 md:my-0">
          {/* Left side: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <img 
                src={tripBuddyLogo} 
                alt="TripBuddy" 
                className="h-20 md:h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>

          {/* Center: Navigation Links */}
          <div className="flex justify-center pl-36 flex-1">
            <div className="hidden sm:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className={`relative transition-all duration-300 hover:text-bula after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-bula after:transition-transform after:duration-300 after:origin-left after:content-[''] hover:after:scale-x-100 whitespace-nowrap font-semibold ${
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

          {/* Right side: Auth buttons and mobile menu button */}
          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex">
              <div className="flex space-x-4">
                <AuthButtons />
              </div>
            </div>
            <Button
              variant="ghost"
              className="sm:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <LuX className="h-20 w-20" /> : <LuMenu className="h-20 w-20" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <MobileMenu isOpen={isMenuOpen} onClose={closeMenu} />
      </div>
    </nav>
  );
};

