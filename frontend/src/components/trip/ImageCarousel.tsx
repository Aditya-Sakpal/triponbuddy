import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { ImageData } from "@/constants";

interface ImageCarouselProps {
  images: ImageData[];
  isLoading: boolean;
}

export const ImageCarousel = ({ images, isLoading }: ImageCarouselProps) => {
  const [api, setApi] = useState<CarouselApi>();

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
    <div className="w-full mt-6">
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
        className="relative w-full"
      >
        <CarouselContent className="ml-0">
          {images.map((image, index) => (
            <CarouselItem key={index} className="pl-0">
              <div className="relative overflow-hidden rounded-lg shadow-lg aspect-[16/9] sm:aspect-[16/8]">
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    // Hide broken images
                    (e.target as HTMLImageElement).style.display = 'none';
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
