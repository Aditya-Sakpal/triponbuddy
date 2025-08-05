import { MapPin, Phone, Mail, Instagram, Facebook, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-muted/20 border-t">
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold text-foreground mb-4">TriponBuddy</h3>
            <p className="text-muted-foreground text-sm mb-4">
              India's #1 Trip Planner & Travel Package Aggregator Platform. Your trusted trip buddy for perfect travel experiences.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Home</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Destinations</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Seasonal</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">My Trips</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Contact</a></li>
            </ul>
          </div>

          {/* Popular Destinations */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Popular Destinations</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Kerala</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Goa</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Rajasthan</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Himachal Pradesh</a></li>
              <li><a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Kashmir</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground text-sm">24/7 Support</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground text-sm">support@triponbuddy.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-muted-foreground text-sm">India</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-muted mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-muted-foreground text-sm">
            © 2024 TriponBuddy. All rights reserved. Your Trip Buddy for Perfect Travel.
          </p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Privacy Policy</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Terms of Service</a>
            <a href="#" className="text-muted-foreground hover:text-primary transition-colors text-sm">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;