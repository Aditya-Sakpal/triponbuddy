import { Facebook, Twitter, Instagram } from "lucide-react";
import tripBuddyLogoDark from "@/assets/tripbuddy-logo-dark.png";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Logo and Description */}
          <div>
            <div className="mb-4">
              <img 
                src={tripBuddyLogoDark} 
                alt="TriponBuddy" 
                className="h-16 w-auto"
              />
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
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Destinations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Seasonal</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">My Trips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Contact</a></li>
            </ul>
          </div>

          {/* Right Section - Popular Destinations */}
          <div>
            <h3 className="text-white font-semibold font-latin text-lg mb-4 underline">Popular Destinations</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Mayapur,</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Varanasi Ghats</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Golden Temple, Amritsar</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Kerala Backwaters</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors font-latin">Goa Beaches</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright and Links */}
        <div className="border-t border-gray-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 font-latin text-sm mb-4 md:mb-0">
            © 2025 TriponBuddy. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm font-latin transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm font-latin transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;