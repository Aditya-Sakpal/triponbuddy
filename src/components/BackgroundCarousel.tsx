import { useState, useEffect } from 'react';

const BackgroundCarousel = () => {
  const backgrounds = [
    // Beach scenes
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=3945&q=80',
    
    // Mountain views
    'https://images.unsplash.com/photo-1482938289607-e9573fc25ebb?auto=format&fit=crop&w=3648&q=80',
    'https://images.unsplash.com/photo-1469474968028-56623f02e425?auto=format&fit=crop&w=3506&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=7372&q=80',
    'https://images.unsplash.com/photo-1458668383970-8ddd3927deed?auto=format&fit=crop&w=3872&q=80',
    'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=2600&q=80',
    
    // City/Architecture
    'https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=5389&q=80',
    'https://images.unsplash.com/photo-1431576901776-e539bd916ba2?auto=format&fit=crop&w=5657&q=80',
    'https://images.unsplash.com/photo-1459767129954-1b1c1f9b9ace?auto=format&fit=crop&w=5760&q=80',
    
    // Scenic waterfalls and bridges
    'https://images.unsplash.com/photo-1433086966358-54859d0ed716?auto=format&fit=crop&w=4000&q=80',
    
    // Nature/Forest
    'https://images.unsplash.com/photo-1523712999610-f77fbcfc3843?auto=format&fit=crop&w=4368&q=80',
    'https://images.unsplash.com/photo-1500673922987-e212871fec22?auto=format&fit=crop&w=6000&q=80',
    
    // Wildlife/Ocean
    'https://images.unsplash.com/photo-1518877593221-1f28583780b4?auto=format&fit=crop&w=5103&q=80',
    
    // Additional scenic views
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=7360&q=80',
    'https://images.unsplash.com/photo-1615729947596-a598e5de0ab3?auto=format&fit=crop&w=3456&q=80'
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState(1);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex(nextIndex);
        setNextIndex((nextIndex + 1) % backgrounds.length);
        setIsTransitioning(false);
      }, 500); // Half of transition duration
      
    }, 3000); // Change every 3 seconds

    return () => clearInterval(interval);
  }, [nextIndex, backgrounds.length]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Current Background */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          backgroundImage: `url(${backgrounds[currentIndex]})`
        }}
      />
      
      {/* Next Background (for smooth transition) */}
      <div 
        className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000 ${
          isTransitioning ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          backgroundImage: `url(${backgrounds[nextIndex]})`
        }}
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
    </div>
  );
};

export default BackgroundCarousel;