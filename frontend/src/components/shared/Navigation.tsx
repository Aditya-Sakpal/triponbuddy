import { Button } from "@/components/ui/button";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import tripBuddyLogo from "@/assets/triponbuddylogo.png";
import { AuthButtons } from "./AuthButtons";
import { navLinks } from "@/constants/nav";

export const Navigation = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: {
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }
    }
  };

  return (
    <nav className="fixed -top-4 left-0 right-0 z-[70] bg-white shadow-md h-20">
      <div className="container mx-auto px-6 md:px-24 bg-white md:bg-transparent">
        <div className="flex items-center justify-center ">
          {/* Left side: Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center" onClick={closeMenu}>
              <img 
                src={tripBuddyLogo} 
                alt="TripBuddy" 
                className="h-24 w-auto hover:scale-105 transition-transform duration-300"
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
              size="icon"
              className="sm:hidden"
              onClick={toggleMenu}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              // @ts-expect-error: Framer-motion Variants type mismatch with ease property
              variants={menuVariants}
              className="sm:hidden overflow-hidden"
            >
              <div className="mt-4 pb-4 border-t border-gray-200">
                <div className="flex flex-col space-y-4 pt-4">
                  <div className="flex space-x-4 pb-4">
                    <AuthButtons />
                  </div>
                  {navLinks.map((link) => (
                    <Link 
                      key={link.to}
                      to={link.to} 
                      className={`relative transition-all duration-300 hover:text-bula after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-bula after:transition-transform after:duration-300 after:origin-left after:content-[''] hover:after:scale-x-100 ${
                        location.pathname === link.to 
                          ? 'text-bula after:scale-x-100' 
                          : 'text-gray-600 after:scale-x-0'
                      }`}
                      onClick={closeMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

