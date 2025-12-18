import { Navigation, Footer } from "@/components/shared";
import { useState, useEffect } from 'react';
import { ChevronUp } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
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
    <div className="min-h-screen bg-background overflow-hidden">
      <Navigation />
      {children}
      <Footer />
      
      <button
        onClick={scrollToTop}
        className={`fixed bottom-24 left-4 lg:bottom-4 lg:left-auto lg:right-4 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-3 shadow-lg transition-opacity duration-700 z-50 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
        aria-label="Scroll to top"
      >
        <ChevronUp size={24} />
      </button>
    </div>
  );
};