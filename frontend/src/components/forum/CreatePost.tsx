/**
 * Create Post Component
 * Form for creating new posts with optional images and trip sharing
 */

import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { PostImage, SharedTrip } from "@/types/forum";
import { useCreatePost } from "@/hooks/useForum";
import { FORUM_CONSTANTS, FORUM_PLACEHOLDERS } from "@/constants/forum";
import { API_BASE_URL } from "@/constants/api";
import { useToast } from "@/hooks/use-toast";

interface CreatePostProps {
  onPostCreated?: () => void;
  initialSharedTrip?: SharedTrip;
  initialContent?: string;
}

const CreatePost = ({ onPostCreated, initialSharedTrip, initialContent }: CreatePostProps) => {
  const { user } = useUser();
  const { toast } = useToast();
  const [content, setContent] = useState(initialContent || "");
  const [images, setImages] = useState<PostImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { createPost, isSubmitting } = useCreatePost(() => {
    setContent("");
    setImages([]);
    onPostCreated?.();
  });

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  /**
   * Handle file upload to Cloudflare R2
   */
  const handleFileUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate file count
    if (files.length + images.length > 10) {
      toast({
        title: "Too many images",
        description: "You can upload a maximum of 10 images per post.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      
      // Add all files to FormData
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }

      // Upload to backend
      const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const result = await response.json();

      // Add successfully uploaded images
      if (result.uploaded && result.uploaded.length > 0) {
        const newImages: PostImage[] = result.uploaded.map((item: { url: string; filename: string }) => ({
          url: item.url,
          alt: item.filename,
        }));
        setImages([...images, ...newImages]);

        toast({
          title: "Images uploaded",
          description: `${result.uploaded.length} image(s) uploaded successfully.`,
        });
      }

      // Show errors for failed uploads
      if (result.failed && result.failed.length > 0) {
        const errorMessages = result.failed.map((item: { filename: string; error: string }) => 
          `${item.filename}: ${item.error}`
        ).join('\n');
        
        toast({
          title: "Some uploads failed",
          description: errorMessages,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createPost({
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      shared_trip: initialSharedTrip || undefined,
    });
  };

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Please sign in to create posts
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Post Content */}
          <div>
            <Textarea
              placeholder={FORUM_PLACEHOLDERS.POST}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              maxLength={FORUM_CONSTANTS.POST_CONTENT_MAX_LENGTH}
              className="resize-none"
            />
            <div className="flex items-center justify-between mt-4">
              <Button
                type="button"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading || images.length >= 10}
                title="Upload images"
              >
                {isUploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <ImagePlus className="h-5 w-5" />
                )}
              </Button>
              <p className="text-xs text-muted-foreground">
                {content.length}/{FORUM_CONSTANTS.POST_CONTENT_MAX_LENGTH}
              </p>
            </div>
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            multiple
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files)}
          />

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={image.alt || `Preview ${index + 1}`}
                    className="w-full h-32 object-cover rounded-md"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveImage(index)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Shared Trip Preview */}
          {initialSharedTrip && (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-md">
              <p className="text-sm font-medium text-primary">
                📍 Sharing trip: {initialSharedTrip.destination}
              </p>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting || isUploading || !content.trim()}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Posting...
                </>
              ) : (
                "Post to Community"
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;

