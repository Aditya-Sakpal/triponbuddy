import { Facebook, Twitter, Instagram } from "lucide-react";
import { Link } from "react-router-dom";

import tripBuddyLogo from "@/assets/triponbuddylogo.png";

const Footer = () => {
  const quickLinks = [
    { to: "/", label: "Home" },
    { to: "/explore-destinations", label: "Destinations" },
    { to: "/seasonal", label: "Seasonal" },
    { to: "/trips", label: "My Trips" },
    { to: "/contact", label: "Contact" },
  ];

  const popularDestinations = [
    { to: "/explore-destinations", label: "Mayapur" },
    { to: "/explore-destinations", label: "Varanasi Ghats" },
    { to: "/explore-destinations", label: "Golden Temple, Amritsar" },
    { to: "/explore-destinations", label: "Kerala Backwaters" },
    { to: "/explore-destinations", label: "Goa Beaches" },
  ];

  return (
    <footer className="bg-slate-800 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Logo and Description */}
          <div>
            <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <img 
                src={tripBuddyLogo} 
                alt="TripBuddy" 
                className="h-24 w-auto hover:scale-105 transition-transform duration-300"
              />
            </Link>
          </div>
            <p className="text-gray-300 font-latin text-sm leading-relaxed mb-6">
              TriponBuddy (Trip on Buddy) - India's #1 trip planner & travel aggregator. Your trusted trip buddy for comparing packages, booking tours & creating perfect itineraries.
            </p>
            <div className="flex space-x-3">
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Facebook className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Twitter className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <Instagram className="w-4 h-4" />
              </div>
              <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer">
                <span className="text-xs font-bold">P</span>
              </div>
            </div>
          </div>

          {/* Middle Section - Quick Links */}
          <div>
            <h3 className="text-white font-semibold font-latin text-lg mb-4 underline">Quick Links</h3>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 font-latin inline-block">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Section - Popular Destinations */}
          <div>
            <h3 className="text-white font-semibold font-latin text-lg mb-4 underline">Popular Destinations</h3>
            <ul className="space-y-2">
              {popularDestinations.map((dest) => (
                <li key={dest.label}>
                  <Link to={dest.to} className="text-gray-300 hover:text-white transition-all duration-300 hover:translate-x-1 font-latin inline-block">
                    {dest.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright and Links */}
        <div className="border-t border-gray-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 font-latin text-sm mb-4 md:mb-0">
            © 2025 TriponBuddy. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <Link to="/privacy" className="text-gray-400 hover:text-white text-sm font-latin transition-all duration-300 hover:translate-x-1 inline-block">Privacy Policy</Link>
            <Link to="/terms" className="text-gray-400 hover:text-white text-sm font-latin transition-all duration-300 hover:translate-x-1 inline-block">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;