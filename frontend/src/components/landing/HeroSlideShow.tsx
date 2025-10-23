import { useState, useEffect, useMemo } from 'react';

export const HeroSlideShow = () => {
  const images = useMemo(() => [
    'https://plus.unsplash.com/premium_photo-1661919589683-f11880119fb7?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1592639296346-560c37a0f711?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1660145416818-b9a2b1a1f193?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1595658658481-d53d3f999875?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1566552881560-0be862a7c445?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1592555793101-4735dfe82341?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1585135497273-1a86b09fe70e?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1597735881932-d9664c9bbcea?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1589983846997-04788035bc83?w=1200&h=800&fit=crop',
    'https://images.unsplash.com/photo-1624554305378-0f440dd3a8c1?w=1200&h=800&fit=crop',
    'https://plus.unsplash.com/premium_photo-1673240845266-2f2c432cf194?w=1200&h=800&fit=crop',
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
      }, 1000); 
    }, 5000);

    return () => clearInterval(interval);
  }, [images, currentIndex]);

  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <img
        src={displaySrc}
        className={`absolute inset-0 w-full h-[60vh] md:h-[70vh] object-cover transition-opacity duration-1000 ${
          isFading ? 'opacity-0' : 'opacity-100'
        }`}
        style={{
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
          transform: 'scale(1.1)',
          transformOrigin: 'center center'
        }}
        alt="Travel Background"
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black opacity-50"></div>
    </div>
  );
};

