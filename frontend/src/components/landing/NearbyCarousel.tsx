import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const CARD_SIZE_LG = 450;
const CARD_SIZE_SM = 340;
const CORNER_CLIP = 50;
const SECTION_HEIGHT = 500;
const CARD_GAP = 24;

// Fallback images for when Google Maps API fails
const FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80',
  'https://images.unsplash.com/photo-1506929562872-bb421503ef21?w=800&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80',
  'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80',
  'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=800&q=80',
];

interface Place {
  id?: string;
  name: string;
  image: string;
  state?: string;
  description?: string;
  rating?: number;
  types?: string[];
  tempId: number;
}

interface NearbyCarouselProps {
  places: Omit<Place, 'tempId'>[];
}

export const NearbyCarousel = ({ places }: NearbyCarouselProps) => {
  const [cardSize, setCardSize] = useState(CARD_SIZE_LG);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  const [displayPlaces, setDisplayPlaces] = useState<Place[]>([]);

  useEffect(() => {
    // Create infinite loop by triplicating the places array
    const basePlaces = places.map((place, idx) => ({ ...place, tempId: idx }));
    const triplePlaces = [
      ...basePlaces.map((p, i) => ({ ...p, tempId: i })),
      ...basePlaces.map((p, i) => ({ ...p, tempId: i + places.length })),
      ...basePlaces.map((p, i) => ({ ...p, tempId: i + places.length * 2 })),
    ];
    setDisplayPlaces(triplePlaces);
    
    // Start at middle section
    if (scrollContainerRef.current && places.length > 0) {
      const cardWidth = cardSize + CARD_GAP;
      scrollContainerRef.current.scrollLeft = cardWidth * places.length;
    }
  }, [places, cardSize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Handle infinite scroll loop
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || places.length === 0) return;
    
    const handleScroll = () => {
      const cardWidth = cardSize + CARD_GAP;
      const sectionWidth = cardWidth * places.length;
      const scrollPos = container.scrollLeft;
      
      // If scrolled past the right copy, jump back to middle
      if (scrollPos >= sectionWidth * 2) {
        container.scrollLeft = scrollPos - sectionWidth;
      }
      // If scrolled before the left copy, jump forward to middle
      else if (scrollPos <= 0) {
        container.scrollLeft = scrollPos + sectionWidth;
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [places.length, cardSize]);

  // Handle wheel scroll
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      container.scrollLeft += e.deltaY;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, []);

  // Lock vertical scroll when hovering
  useEffect(() => {
    if (isHovering) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isHovering]);

  useEffect(() => {
    const { matches } = window.matchMedia("(min-width: 640px)");

    if (matches) {
      setCardSize(CARD_SIZE_LG);
    } else {
      setCardSize(CARD_SIZE_SM);
    }

    const handleSetCardSize = () => {
      const { matches } = window.matchMedia("(min-width: 640px)");

      if (matches) {
        setCardSize(CARD_SIZE_LG);
      } else {
        setCardSize(CARD_SIZE_SM);
      }
    };

    window.addEventListener("resize", handleSetCardSize);

    return () => window.removeEventListener("resize", handleSetCardSize);
  }, []);

  return (
    <div
      className="relative w-full bg-gradient-to-b from-white to-gray-50 py-8"
      style={{
        height: SECTION_HEIGHT,
      }}
    >
      <div
        ref={scrollContainerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsDragging(false);
          setIsHovering(false);
        }}
        className="flex gap-6 overflow-x-auto overflow-y-hidden h-full px-8 scrollbar-hide cursor-grab active:cursor-grabbing"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {displayPlaces.map((place, idx) => (
          <PlaceCard
            key={place.tempId}
            place={place}
            cardSize={cardSize}
            index={idx}
          />
        ))}
      </div>
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

const PlaceCard = ({ place, cardSize, index }: {
  place: Place;
  cardSize: number;
  index: number;
}) => {
  const navigate = useNavigate();
  
  // Check if the image URL is valid/exists, otherwise use fallback immediately
  const getInitialImage = () => {
    if (!place.image || place.image.trim() === '' || place.image.includes('maps.googleapis.com')) {
      // If no image or it's a Google Maps URL (which is failing), use fallback
      return FALLBACK_IMAGES[index % FALLBACK_IMAGES.length];
    }
    return place.image;
  };
  
  const [imgSrc, setImgSrc] = useState(getInitialImage());
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    if (!imgError) {
      setImgError(true);
      // Use index to deterministically select a fallback image
      setImgSrc(FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]);
    }
  };

  const handleCardClick = () => {
    // Navigate to home page with destination as query param
    const params = new URLSearchParams();
    params.set('destination', place.name);
    navigate(`/?${params.toString()}`);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <motion.div
      onClick={handleCardClick}
      className="flex-shrink-0 cursor-pointer overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-shadow duration-300"
      style={{
        width: cardSize,
        height: cardSize,
        clipPath: `polygon(${CORNER_CLIP}px 0%, calc(100% - ${CORNER_CLIP}px) 0%, 100% ${CORNER_CLIP}px, 100% 100%, calc(100% - ${CORNER_CLIP}px) 100%, ${CORNER_CLIP}px 100%, 0 100%, 0 0)`,
      }}
      whileHover={{ scale: 1.02 }}
      transition={{
        type: "spring",
        stiffness: 300,
        damping: 20,
      }}
    >
      {/* Large image taking most of the card */}
      <div className="relative w-full h-full">
        <img
          src={imgSrc}
          alt={place.name}
          onError={handleImageError}
          className="w-full h-full object-cover"
        />
        
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
        
        {/* Place name at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h3 className="text-white font-bold text-xl sm:text-2xl leading-tight">
            {place.name}
          </h3>
          {place.state && (
            <p className="text-white/90 text-sm sm:text-base mt-1">
              {place.state}
            </p>
          )}
          {place.rating && (
            <div className="flex items-center gap-1 mt-2">
              <span className="text-yellow-400 text-lg">★</span>
              <span className="text-white font-semibold">{place.rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};