/**
 * Create Post Component
 * Form for creating new posts with optional images and trip sharing
 */

import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { PostImage, SharedTrip } from "@/types/forum";
import { useCreatePost } from "@/hooks/useForum";
import { FORUM_CONSTANTS, FORUM_PLACEHOLDERS } from "@/constants/forum";

interface CreatePostProps {
  onPostCreated?: () => void;
  initialSharedTrip?: SharedTrip;
  initialContent?: string;
}

const CreatePost = ({ onPostCreated, initialSharedTrip, initialContent }: CreatePostProps) => {
  const { user } = useUser();
  const [content, setContent] = useState(initialContent || "");
  const [images, setImages] = useState<PostImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState("");

  const { createPost, isSubmitting } = useCreatePost(() => {
    setContent("");
    setImages([]);
    onPostCreated?.();
  });

  const handleAddImage = () => {
    if (newImageUrl.trim()) {
      setImages([...images, { url: newImageUrl.trim() }]);
      setNewImageUrl("");
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
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
            <p className="text-xs text-muted-foreground mt-1 text-right">
              {content.length}/{FORUM_CONSTANTS.POST_CONTENT_MAX_LENGTH}
            </p>
          </div>

          {/* Image Input */}
          <div className="space-y-2">
            <Label>Add Images (Optional)</Label>
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder={FORUM_PLACEHOLDERS.IMAGE_URL}
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddImage();
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={handleAddImage}
                disabled={!newImageUrl.trim()}
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Preview ${index + 1}`}
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
          <Button type="submit" className="w-full" disabled={isSubmitting || !content.trim()}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Posting...
              </>
            ) : (
              "Post to Community"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CreatePost;
