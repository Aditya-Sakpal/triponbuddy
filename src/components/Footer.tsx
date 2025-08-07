import { Facebook, Twitter, Instagram } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-slate-800 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Left Section - Logo and Description */}
          <div>
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded mr-2 flex items-center justify-center">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <span className="text-white font-semibold">TriponBuddy</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed mb-6">
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
            <h3 className="text-white font-semibold text-lg mb-4 underline">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Destinations</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Seasonal</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">My Trips</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Right Section - Popular Destinations */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-4 underline">Popular Destinations</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Mayapur,</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Varanasi Ghats</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Golden Temple, Amritsar</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Kerala Backwaters</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors">Goa Beaches</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Section - Copyright and Links */}
        <div className="border-t border-gray-600 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © 2025 TriponBuddy. All rights reserved.
          </p>
          <div className="flex space-x-6">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;