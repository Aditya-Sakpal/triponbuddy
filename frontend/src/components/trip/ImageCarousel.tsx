import { useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
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
      <div className="w-full max-w-4xl mx-auto mt-6">
        <div className="bg-gray-200 rounded-lg h-64 animate-pulse"></div>
      </div>
    );
  }

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl mx-auto mt-6 px-4">
      <Carousel
        setApi={setApi}
        opts={{
          align: "start",
          loop: true,
        }}
        plugins={[
          Autoplay({
            delay: 1100,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent>
          {images.map((image, index) => (
            <CarouselItem key={index}>
              <div className="p-2">
                <div className="relative overflow-hidden rounded-lg shadow-lg">
                  <img
                    src={image.url}
                    alt={image.title}
                    className="w-full h-64 md:h-80 lg:h-96 object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                    onError={(e) => {
                      // Hide broken images
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
};;