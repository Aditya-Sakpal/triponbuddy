import { useState, useRef } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { PostImage, SharedTrip } from "@/types/forum";
import { useCreatePost } from "@/hooks/useForum";
import { FORUM_CONSTANTS, FORUM_PLACEHOLDERS } from "@/constants/forum";
import { useToast } from "@/hooks/use-toast";
import { uploadImages, validatePostContent } from "./helpers";
import {ImageGrid} from "./ui";

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

    setIsUploading(true);

    const result = await uploadImages(files, images.length);

    if (result.images.length > 0) {
      setImages([...images, ...result.images]);
      toast({
        title: "Images uploaded",
        description: `${result.images.length} image(s) uploaded successfully.`,
      });
    }

    if (result.errors.length > 0) {
      toast({
        title: result.success ? "Some uploads failed" : "Upload failed",
        description: result.errors.join("\n"),
        variant: "destructive",
      });
    }

    setIsUploading(false);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validatePostContent(content);
    if (!validation.isValid) {
      toast({
        title: "Validation Error",
        description: validation.error,
        variant: "destructive",
      });
      return;
    }

    await createPost({
      content: content.trim(),
      images: images.length > 0 ? images : undefined,
      shared_trip: initialSharedTrip || undefined,
    });
  };

  const canUploadMoreImages = images.length < 10;
  const isFormValid = content.trim().length > 0;

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
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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
                disabled={isUploading || !canUploadMoreImages}
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
            <ImageGrid 
              images={images} 
              onRemove={handleRemoveImage} 
              editable 
            />
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
              disabled={isSubmitting || isUploading || !isFormValid}
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

