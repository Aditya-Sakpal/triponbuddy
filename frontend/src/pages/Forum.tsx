/**
 * Forum/Community Page
 * Social feed for travel posts with infinite scroll
 */

import { useState } from "react";
import { CreatePost, PostCard, CommentThread, ForumHeroSection } from "@/components/forum";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usePosts } from "@/hooks/useForum";
import { FORUM_MESSAGES } from "@/constants/forum";

const Forum = () => {
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, refresh, refreshPost } = usePosts();

  const handlePostCreated = () => {
    refresh();
  };

  const handlePostDeleted = () => {
    refresh();
  };

  const handleCommentClick = (postId: string) => {
    setSelectedPostId(postId);
  };

  const handleCommentAdded = (postId: string) => {
    refreshPost(postId);
  };

  return (
    <>
      {/* Hero Section */}
      <ForumHeroSection />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-200 py-8">
        <div className="container mx-auto max-w-3xl px-4 space-y-6">
          {/* Create Post */}
          <CreatePost onPostCreated={handlePostCreated} />

          {/* Posts Feed */}
          <div className="space-y-6">
            {isLoading && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            )}

          {!isLoading && posts.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No posts yet</h3>
              <p className="text-muted-foreground">
                {FORUM_MESSAGES.EMPTY_STATE.NO_POSTS}
              </p>
            </div>
          )}

          {posts.map((post) => (
            <PostCard
              key={post.post_id}
              post={post}
              onDelete={handlePostDeleted}
              onCommentClick={handleCommentClick}
              onCommentAdded={handleCommentAdded}
            />
          ))}

          {/* Load More Button */}
          {hasMore && posts.length > 0 && (
            <div className="flex justify-center">
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
        </div>
      </div>

      {/* Comments Dialog */}
      <Dialog open={!!selectedPostId} onOpenChange={() => setSelectedPostId(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Comments</DialogTitle>
          </DialogHeader>
          {selectedPostId && (
            <CommentThread
              postId={selectedPostId}
              onCommentAdded={() => handleCommentAdded(selectedPostId)}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Forum;
