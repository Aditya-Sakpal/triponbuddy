import { useState, useEffect } from 'react';

export const HeroSlideShow = () => {
  const imageModules = import.meta.glob('/src/assets/destinations/*.jpg', { eager: true });
  const images: string[] = Object.values(imageModules).map((mod) => (mod as { default: string }).default);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [displaySrc, setDisplaySrc] = useState(images[0]);
  const [nextDisplaySrc, setNextDisplaySrc] = useState(images.length > 1 ? images[1] : images[0]);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      const nextIndex = (currentIndex + 1) % images.length;
      setNextDisplaySrc(images[nextIndex]);
      setIsFading(true);

      setTimeout(() => {
        setDisplaySrc(images[nextIndex]);
        setCurrentIndex(nextIndex);
        setIsFading(false);
      }, 1000); 
    }, 5000);

    return () => clearInterval(interval);
  }, [images, currentIndex]);

  return (
    <div className="absolute inset-0 overflow-x-hidden">
      <img
        src={displaySrc}
        className={`absolute inset-0 w-full h-[70vh] object-cover transition-opacity duration-1000 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transform: 'scale(1.2)',
          transformOrigin: 'center center'
        }}
        alt="Travel Background"
      />
      <img
        src={nextDisplaySrc}
        className={`absolute inset-0 w-full h-[70vh] object-cover transition-opacity duration-1000 ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transform: 'scale(1.2)',
          transformOrigin: 'center center'
        }}
        alt="Travel Background"
      />

      {/* Overlay */}
    </div>
  );
};

