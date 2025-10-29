import { useState, useEffect, useMemo } from 'react';

export const HeroSlideShow = () => {
  const images = useMemo(() => [
    'https://images.unsplash.com/photo-1760943055882-1dc68e4f7440?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1717329162563-2f93e83cc717?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1586618761884-a062d527523f?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1589983846997-04788035bc83?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1600&h=900&fit=crop',
    'https://plus.unsplash.com/premium_photo-1673240845266-2f2c432cf194?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1712319432079-06cca77ccb90?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1603262110263-fb0112e7cc33?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1593693411515-c20261bcad6e?w=1600&h=900&fit=crop',
    'https://images.unsplash.com/photo-1570168007204-dfb528c6958f?w=1600&h=900&fit=crop',
  ], []);

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
      }, 1100); 
    }, 4500);

    return () => clearInterval(interval);
  }, [images, currentIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <img
        src={displaySrc}
        className={`absolute inset-0 w-full h-[60vh] md:h-[90vh] transition-opacity duration-1000 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
          transformOrigin: 'center center',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        alt="Travel Background"
      />
      <img
        src={nextDisplaySrc}
        className={`absolute inset-0 w-full h-[60vh] md:h-[90vh] transition-opacity duration-1000 ${
          isFading ? 'opacity-100' : 'opacity-0'
        }`}
        style={{
          transformOrigin: 'center center',
          objectFit: 'cover',
          objectPosition: 'center',
        }}
        alt="Travel Background"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  );
};

