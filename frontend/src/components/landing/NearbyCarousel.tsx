import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";
import { useNavigate } from "react-router-dom";

const CARD_SIZE_LG = 450;
const CARD_SIZE_SM = 340;

const BORDER_SIZE = 2;
const CORNER_CLIP = 50;
const CORNER_LINE_LEN = Math.sqrt(
  CORNER_CLIP * CORNER_CLIP + CORNER_CLIP * CORNER_CLIP
);

const ROTATE_DEG = 2.5;

const STAGGER = 15;
const CENTER_STAGGER = -65;

const SECTION_HEIGHT = 600;

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

  const [displayPlaces, setDisplayPlaces] = useState<Place[]>(
    places.map((place, idx) => ({ ...place, tempId: idx }))
  );

  useEffect(() => {
    setDisplayPlaces(places.map((place, idx) => ({ ...place, tempId: idx })));
  }, [places]);

  const handleMove = (position: number) => {
    const copy = [...displayPlaces];

    if (position > 0) {
      for (let i = position; i > 0; i--) {
        const firstEl = copy.shift();

        if (!firstEl) return;

        copy.push({ ...firstEl, tempId: Math.random() });
      }
    } else {
      for (let i = position; i < 0; i++) {
        const lastEl = copy.pop();

        if (!lastEl) return;

        copy.unshift({ ...lastEl, tempId: Math.random() });
      }
    }

    setDisplayPlaces(copy);
  };

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
      className="relative w-full overflow-hidden bg-gradient-to-b from-white to-gray-50"
      style={{
        height: SECTION_HEIGHT,
      }}
    >
      {displayPlaces.map((place, idx) => {
        let position = 0;

        if (displayPlaces.length % 2) {
          position = idx - (displayPlaces.length + 1) / 2;
        } else {
          position = idx - displayPlaces.length / 2;
        }

        return (
          <PlaceCard
            key={place.tempId}
            place={place}
            handleMove={handleMove}
            position={position}
            cardSize={cardSize}
          />
        );
      })}
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-8">
        <button
          onClick={() => handleMove(-1)}
          className="grid h-14 w-14 place-content-center text-3xl transition-colors hover:bg-black hover:text-white"
        >
          <GoArrowLeft />
        </button>
        <button
          onClick={() => handleMove(1)}
          className="grid h-14 w-14 place-content-center text-3xl transition-colors hover:bg-black hover:text-white"
        >
          <GoArrowRight />
        </button>
      </div>
    </div>
  );
};

const PlaceCard = ({ position, place, handleMove, cardSize }: {
  position: number;
  place: Place;
  handleMove: (position: number) => void;
  cardSize: number;
}) => {
  const navigate = useNavigate();
  const isActive = position === 0;

  const handleCardClick = () => {
    if (isActive) {
      // Navigate to home page with destination as query param
      const params = new URLSearchParams();
      params.set('destination', place.name);
      navigate(`/?${params.toString()}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      handleMove(position);
    }
  };

  return (
    <motion.div
      initial={false}
      onClick={handleCardClick}
      className={`
      absolute left-1/2 top-1/2 cursor-pointer border-black overflow-hidden transition-colors duration-500 ${
        isActive ? "z-10 bg-white shadow-2xl" : "z-0 bg-white"
      }
      `}
      style={{
        borderWidth: BORDER_SIZE,
        clipPath: `polygon(${CORNER_CLIP}px 0%, calc(100% - ${CORNER_CLIP}px) 0%, 100% ${CORNER_CLIP}px, 100% 100%, calc(100% - ${CORNER_CLIP}px) 100%, ${CORNER_CLIP}px 100%, 0 100%, 0 0)`,
      }}
      animate={{
        width: cardSize,
        height: cardSize,
        x: `calc(-50% + ${position * (cardSize / 1.5)}px)`,
        y: `calc(-50% + ${
          isActive ? CENTER_STAGGER : position % 2 ? STAGGER : -STAGGER
        }px)`,
        rotate: isActive ? 0 : position % 2 ? ROTATE_DEG : -ROTATE_DEG,
        boxShadow: isActive ? "0px 8px 0px 4px black" : "0px 0px 0px 0px black",
      }}
      transition={{
        type: "spring",
        mass: 3,
        stiffness: 400,
        damping: 50,
      }}
    >
      <span
        className="absolute block origin-top-right rotate-45 bg-black object-cover z-10"
        style={{
          right: -BORDER_SIZE,
          top: CORNER_CLIP - BORDER_SIZE,
          width: CORNER_LINE_LEN,
          height: BORDER_SIZE,
        }}
      />
      
      {/* Large image taking most of the card */}
      <div className="relative w-full h-full">
        <img
          src={place.image}
          alt={place.name}
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