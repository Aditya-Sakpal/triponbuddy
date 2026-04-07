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
        <div className="h-[220px] sm:h-[360px] lg:h-[420px] rounded-3xl bg-gray-200 animate-pulse" />
      </div>
    );
  }

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full mt-6 min-w-0 max-w-full">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 3200,
          }),
        ]}
        className="relative w-full max-w-full overflow-hidden rounded-3xl shadow-xl"
      >
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0 basis-full">
              <div className="relative w-full h-[220px] sm:h-[360px] lg:h-[420px] overflow-hidden rounded-3xl">
                <img
                  src={image.url}
                  alt={image.title}
                  className="block w-full h-full object-cover object-center transition-transform duration-500 hover:scale-105"
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
        <CarouselPrevious className="!left-3 sm:!left-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 border-none bg-white/35 text-black/65 backdrop-blur-sm hover:bg-white/55 transition-colors" />
        <CarouselNext className="!right-3 sm:!right-5 top-1/2 -translate-y-1/2 z-10 h-9 w-9 sm:h-11 sm:w-11 border-none bg-white/35 text-black/65 backdrop-blur-sm hover:bg-white/55 transition-colors" />
      </Carousel>
    </div>
  );
};
