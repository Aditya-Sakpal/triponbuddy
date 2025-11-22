import { useUser } from "@clerk/clerk-react";
import { useUserPosts } from "@/hooks/useForum";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MessageSquare, Heart, Calendar, Trash2, ExternalLink } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { forumApi } from "@/services/forumApi";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const MyPostsTab = () => {
  const { user } = useUser();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, refresh } = useUserPosts(user?.id || "");
  const [deletingPostId, setDeletingPostId] = useState<string | null>(null);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleViewPost = (postId: string) => {
    navigate(`/forum?post=${postId}`);
  };

  const handleDeleteClick = (postId: string) => {
    setPostToDelete(postId);
  };

  const handleDeleteConfirm = async () => {
    if (!postToDelete || !user) return;

    setDeletingPostId(postToDelete);
    try {
      await forumApi.deletePost(postToDelete, user.id);
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
      refresh();
    } catch (error) {
      console.error("Error deleting post:", error);
      toast({
        title: "Error",
        description: "Failed to delete post",
        variant: "destructive",
      });
    } finally {
      setDeletingPostId(null);
      setPostToDelete(null);
    }
  };

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  if (!user) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">Sign in required</h3>
        <p className="text-muted-foreground">Please sign in to view your posts</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isLoading && posts.length === 0) {
    return (
      <div className="text-center py-12">
        <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
        <p className="text-muted-foreground mb-4">
          You haven't created any posts on the forum yet
        </p>
        <Button onClick={() => navigate("/forum")} variant="default">
          Go to Forum
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">My Posts ({posts.length})</h3>
          <Button onClick={() => navigate("/forum")} variant="outline" size="sm">
            View Forum
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {posts.map((post) => (
            <Card
              key={post.post_id}
              className="hover:shadow-md transition-shadow relative group"
            >
              <CardContent className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewPost(post.post_id)}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClick(post.post_id)}
                      disabled={deletingPostId === post.post_id}
                      className="h-8 w-8 p-0 hover:text-destructive"
                    >
                      {deletingPostId === post.post_id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="mb-3">
                  <p className="text-sm text-gray-700 line-clamp-3">
                    {truncateText(post.content, 150)}
                  </p>
                </div>

                {/* Images */}
                {post.images && post.images.length > 0 && (
                  <div className="mb-3">
                    <div className="grid grid-cols-3 gap-2">
                      {post.images.slice(0, 3).map((img, idx) => (
                        <div key={idx} className="aspect-square rounded overflow-hidden">
                          <img
                            src={img.url}
                            alt={img.alt || "Post image"}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    {post.images.length > 3 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        +{post.images.length - 3} more images
                      </p>
                    )}
                  </div>
                )}

                {/* Shared Trip */}
                {post.shared_trip && (
                  <div className="mb-3 p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-xs font-semibold text-blue-700">Shared Trip</p>
                    <p className="text-sm font-medium text-blue-900">
                      {post.shared_trip.destination}
                    </p>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Heart className="h-4 w-4" />
                    <span>{post.likes_count}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    <span>{post.comments_count}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Load More Button */}
        {hasMore && posts.length > 0 && (
          <div className="flex justify-center pt-4">
            <Button
              onClick={loadMore}
              disabled={isLoadingMore}
              variant="outline"
              size="lg"
            >
              {isLoadingMore ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!postToDelete} onOpenChange={(open) => !open && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your post and all its comments.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
