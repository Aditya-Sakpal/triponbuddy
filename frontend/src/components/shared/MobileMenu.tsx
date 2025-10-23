import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { AuthButtons } from "./AuthButtons";
import { navLinks } from "@/constants/nav";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const MobileMenu = ({ isOpen, onClose }: MobileMenuProps) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
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
                  onClick={onClose}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
