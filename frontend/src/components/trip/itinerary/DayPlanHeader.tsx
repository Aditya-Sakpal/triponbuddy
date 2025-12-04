import { ChevronDown, ChevronUp } from "lucide-react";
import { CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useRef } from "react";

interface DayPlanHeaderProps {
  day: number;
  theme: string;
  isExpanded: boolean;
  onToggle: () => void;
}

export const DayPlanHeader = ({ day, theme, isExpanded, onToggle }: DayPlanHeaderProps) => {
  const headerRef = useRef<HTMLDivElement>(null);

  const handleToggle = () => {
    if (!isExpanded && headerRef.current) {

      requestAnimationFrame(() => {
        const headerElement = headerRef.current;
        if (headerElement) {
          const headerTop = headerElement.getBoundingClientRect().top + window.scrollY;
          const offset = 80; // Offset for navbar height
          window.scrollTo({ 
            top: headerTop - offset, 
            behavior: 'smooth' 
          });
        }
      });
    }
    onToggle();
  };

  return (
    <CardHeader
      ref={headerRef}
      className="cursor-pointer hover:bg-blue-800 transition-colors duration-300 bg-bula rounded-md"
      onClick={handleToggle}
    >
      <div className="flex items-center justify-between text-white">
        <CardTitle className="text-md md:text-2xl font-bold">
          Day {day}
        </CardTitle>
        <CardDescription className="text-md md:text-lg font-medium text-center text-white">
          {theme}
        </CardDescription>
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5" />
          ) : (
            <ChevronDown className="w-5 h-5" />
          )}
        </div>
      </div>
    </CardHeader>
  );
};
