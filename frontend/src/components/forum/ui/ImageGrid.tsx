interface ImageGridProps {
  images: Array<{ url: string; alt?: string }>;
  onRemove?: (index: number) => void;
  editable?: boolean;
}

export const ImageGrid = ({ images, onRemove, editable = false }: ImageGridProps) => {
  if (images.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {images.map((image, index) => (
        <div key={index} className="relative group">
          <img
            src={image.url}
            alt={image.alt || `Image ${index + 1}`}
            className="w-full h-64 object-cover rounded-md"
          />
          {editable && onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="absolute top-1 right-1 h-6 w-6 bg-destructive text-destructive-foreground rounded-md opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              aria-label={`Remove image ${index + 1}`}
            >
              <span className="text-sm">×</span>
            </button>
          )}
        </div>
      ))}
    </div>
  );
};

