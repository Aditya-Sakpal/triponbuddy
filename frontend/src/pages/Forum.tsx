/**
 * Forum/Community Page
 * Social feed for travel posts with infinite scroll
 */

import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { CreatePost, PostCard, ForumHeroSection, FloatingActionButton } from "@/components/forum";
import { Button } from "@/components/ui/button";
import { Loader2, MessageSquare } from "lucide-react";
import { usePosts } from "@/hooks/useForum";
import { FORUM_MESSAGES } from "@/constants/forum";

const Forum = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedPostId = searchParams.get("post");
  const { posts, isLoading, isLoadingMore, hasMore, loadMore, refresh, refreshPost } = usePosts();
  const [showCreatePost, setShowCreatePost] = useState(false);

  // Scroll to post if URL has post parameter
  useEffect(() => {
    if (selectedPostId && posts.length > 0) {
      const postElement = document.getElementById(`post-${selectedPostId}`);
      if (postElement) {
        postElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, [selectedPostId, posts]);

  const handlePostCreated = () => {
    refresh();
    setShowCreatePost(false); // Hide panel after posting
  };

  const handlePostDeleted = () => {
    refresh();
  };

  const handleCommentAdded = (postId: string) => {
    refreshPost(postId);
  };

  const handleWritePost = () => {
    setShowCreatePost(true);
    // Scroll to create post panel smoothly
    setTimeout(() => {
      const createPostElement = document.getElementById("create-post-panel");
      if (createPostElement) {
        createPostElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <>
      {/* Hero Section */}
      <ForumHeroSection />

      {/* Main Content */}
      <div className="min-h-screen bg-gray-200 py-8">
        <div className="container mx-auto max-w-3xl px-4 space-y-6">
          {/* Create Post - Conditionally Rendered */}
          {showCreatePost && (
            <div id="create-post-panel">
              <CreatePost onPostCreated={handlePostCreated} />
            </div>
          )}

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
            <div key={post.post_id} id={`post-${post.post_id}`}>
              <PostCard
                post={post}
                onDelete={handlePostDeleted}
                onCommentAdded={handleCommentAdded}
                initialShowComments={selectedPostId === post.post_id}
              />
            </div>
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

      {/* Floating Action Button */}
      <FloatingActionButton onWritePost={handleWritePost} />
    </>
  );
};

export default Forum;
