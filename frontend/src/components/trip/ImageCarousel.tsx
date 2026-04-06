import { useEffect, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { ImageData } from "@/constants";

interface ImageCarouselProps {
  images: ImageData[];
  isLoading: boolean;
}

export const ImageCarousel = ({ images, isLoading }: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    setLoadedCount(0);
  }, [images]);

  useEffect(() => {
    if (!api) return;

    const reInit = () => {
      api.reInit();
      api.scrollTo(api.selectedScrollSnap(), true);
    };

    const raf = window.requestAnimationFrame(reInit);
    window.addEventListener("resize", reInit);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", reInit);
    };
  }, [api, images.length, loadedCount]);

  if (isLoading) {
    return (
      <div className="w-full mt-6">
        <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 min-w-0">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 2400,
          }),
        ]}
        className="relative w-full overflow-hidden"
      >
        <CarouselContent className="ml-0 w-full">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0 basis-full min-w-full">
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[16/9] sm:aspect-[16/8]">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onLoad={() => {
                    setLoadedCount((count) => count + 1);
                  }}
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
                    setLoadedCount((count) => count + 1);
                  }}
                />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="border-none absolute left-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors" />
        <CarouselNext className="border-none absolute right-3 top-1/2 -translate-y-1/2 z-10 bg-black/30 text-white rounded-full p-2 hover:bg-black/50 transition-colors" />
      </Carousel>
    </div>
  );
};
