"""
Forum/Social Feed service layer
Handles business logic for posts, comments, likes, and trip sharing
"""

import logging
from typing import List, Optional, Dict, Any, Tuple

from database import mongodb
from models.forum import (
    Post, PostResponse, CreatePostRequest,
    Comment, CommentResponse, CreateCommentRequest,
    Like
)
from services.helpers.forum_helper import (
    check_user_liked_target,
    build_comment_tree,
    enrich_comments_with_likes
)
from utils.forum_utils import (
    verify_post_ownership,
    verify_comment_ownership,
    verify_post_exists,
    verify_comment_exists,
    increment_post_comment_count,
    decrement_post_comment_count,
    increment_comment_reply_count,
    decrement_comment_reply_count,
    increment_like_count,
    decrement_like_count,
    delete_post_cascade,
    delete_comment_cascade
)

logger = logging.getLogger(__name__)


class ForumService:
    """Service for forum operations"""

    @staticmethod
    async def create_post(
        user_id: str,
        username: str,
        post_data: CreatePostRequest
    ) -> Post:
        """
        Create a new post
        
        Args:
            user_id: User ID from Clerk
            username: Username of the post creator
            post_data: Post data from request
            
        Returns:
            Created post object
        """
        post = Post(
            user_id=user_id,
            username=username,
            content=post_data.content,
            images=post_data.images,
            shared_trip=post_data.shared_trip
        )
        
        # Convert to dict for database
        post_dict = post.model_dump()
        
        # Insert into database
        await mongodb.insert_one("posts", post_dict)
        
        logger.info(f"Created post {post.post_id} by user {user_id}")
        return post

    @staticmethod
    async def get_post_feed(
        page: int = 1,
        page_size: int = 20,
        current_user_id: Optional[str] = None,
        exclude_user_id: Optional[str] = None
    ) -> Tuple[List[PostResponse], int]:
        """
        Get paginated feed of posts
        
        Args:
            page: Page number (1-indexed)
            page_size: Number of posts per page
            current_user_id: Current user ID to check likes
            exclude_user_id: User ID to exclude posts from
            
        Returns:
            Tuple of (list of posts, total count)
        """
        skip = (page - 1) * page_size
        
        query = {}
        if exclude_user_id:
            query["user_id"] = {"$ne": exclude_user_id}
        
        # Get posts from database
        posts = await mongodb.find_many(
            "posts",
            query,
            limit=page_size,
            skip=skip,
            sort=[("created_at", -1)]
        )
        
        # Get total count
        total_count = await mongodb.count_documents("posts", query)
        
        # Convert to response models with like status
        post_responses = []
        for post_data in posts:
            is_liked = await check_user_liked_target(
                current_user_id,
                post_data["post_id"],
                "post"
            ) if current_user_id else False
            
            post_response = PostResponse(
                **post_data,
                is_liked_by_user=is_liked
            )
            post_responses.append(post_response)
        
        return post_responses, total_count

    @staticmethod
    async def get_post_by_id(
        post_id: str,
        current_user_id: Optional[str] = None
    ) -> Optional[PostResponse]:
        """
        Get a single post by ID
        
        Args:
            post_id: Post ID
            current_user_id: Current user ID to check likes
            
        Returns:
            Post response or None if not found
        """
        post_data = await mongodb.find_one("posts", {"post_id": post_id})
        
        if not post_data:
            return None
        
        is_liked = await check_user_liked_target(
            current_user_id,
            post_id,
            "post"
        ) if current_user_id else False
        
        return PostResponse(**post_data, is_liked_by_user=is_liked)

    @staticmethod
    async def delete_post(post_id: str, user_id: str) -> bool:
        """
        Delete a post (only by the post creator)
        
        Args:
            post_id: Post ID
            user_id: User ID (must match post creator)
            
        Returns:
            True if deleted, False otherwise
        """
        # Verify ownership
        if not await verify_post_ownership(post_id, user_id):
            return False
        
        # Delete post
        deleted = await mongodb.delete_one("posts", {"post_id": post_id})
        
        if deleted:
            # Delete all comments and likes associated with the post
            await delete_post_cascade(post_id)
            logger.info(f"Deleted post {post_id} and associated data")
        
        return deleted

    @staticmethod
    async def create_comment(
        post_id: str,
        user_id: str,
        username: str,
        comment_data: CreateCommentRequest
    ) -> Optional[Comment]:
        """
        Create a new comment on a post
        
        Args:
            post_id: Post ID
            user_id: User ID from Clerk
            username: Username of the commenter
            comment_data: Comment data from request
            
        Returns:
            Created comment object or None if post doesn't exist
        """
        # Verify post exists
        if not await verify_post_exists(post_id):
            return None
        
        # If replying to a comment, verify parent exists
        if comment_data.parent_comment_id:
            if not await verify_comment_exists(comment_data.parent_comment_id):
                return None
        
        comment = Comment(
            post_id=post_id,
            user_id=user_id,
            username=username,
            content=comment_data.content,
            parent_comment_id=comment_data.parent_comment_id
        )
        
        # Insert into database
        comment_dict = comment.model_dump()
        await mongodb.insert_one("comments", comment_dict)
        
        # Only increment post's comment count for top-level comments (not replies)
        if not comment_data.parent_comment_id:
            await increment_post_comment_count(post_id)
        
        # If this is a reply, update parent comment's reply count
        if comment_data.parent_comment_id:
            await increment_comment_reply_count(comment_data.parent_comment_id)
        
        logger.info(f"Created comment {comment.comment_id} on post {post_id}")
        return comment

    @staticmethod
    async def get_post_comments(
        post_id: str,
        current_user_id: Optional[str] = None
    ) -> List[CommentResponse]:
        """
        Get all comments for a post with nested replies
        
        Args:
            post_id: Post ID
            current_user_id: Current user ID to check likes
            
        Returns:
            List of top-level comments with nested replies
        """
        # Get all comments for the post
        all_comments = await mongodb.find_many(
            "comments",
            {"post_id": post_id},
            sort=[("created_at", 1)]
        )
        
        # Build the tree structure
        top_level_comments = build_comment_tree(all_comments, current_user_id)
        
        # Enrich with like status if user is logged in
        if current_user_id:
            await enrich_comments_with_likes(top_level_comments, current_user_id)
        
        return top_level_comments

    @staticmethod
    async def delete_comment(comment_id: str, user_id: str) -> bool:
        """
        Delete a comment (only by the comment creator)
        
        Args:
            comment_id: Comment ID
            user_id: User ID (must match comment creator)
            
        Returns:
            True if deleted, False otherwise
        """
        # Verify ownership
        if not await verify_comment_ownership(comment_id, user_id):
            return False
        
        # Get comment details before deletion
        comment = await mongodb.find_one("comments", {"comment_id": comment_id})
        post_id = comment["post_id"]
        parent_comment_id = comment.get("parent_comment_id")
        
        # Delete comment
        deleted = await mongodb.delete_one("comments", {"comment_id": comment_id})
        
        if deleted:
            # Delete all replies and likes
            await delete_comment_cascade(comment_id)
            
            # Only decrement post's comment count if this was a top-level comment
            if not parent_comment_id:
                await decrement_post_comment_count(post_id)
            
            # Update parent comment's reply count if this was a reply
            if parent_comment_id:
                await decrement_comment_reply_count(parent_comment_id)
            
            logger.info(f"Deleted comment {comment_id}")
        
        return deleted

    @staticmethod
    async def toggle_like(
        user_id: str,
        target_id: str,
        target_type: str
    ) -> bool:
        """
        Toggle like on a post or comment
        
        Args:
            user_id: User ID
            target_id: Post or comment ID
            target_type: "post" or "comment"
            
        Returns:
            True if liked (added), False if unliked (removed)
        """
        # Check if already liked
        existing_like = await mongodb.find_one(
            "likes",
            {
                "user_id": user_id,
                "target_id": target_id,
                "target_type": target_type
            }
        )
        
        if existing_like:
            # Unlike - remove the like
            await mongodb.delete_one(
                "likes",
                {
                    "user_id": user_id,
                    "target_id": target_id,
                    "target_type": target_type
                }
            )
            
            # Decrement like count
            await decrement_like_count(target_id, target_type)
            
            logger.info(f"User {user_id} unliked {target_type} {target_id}")
            return False
        else:
            # Like - add the like
            like = Like(
                user_id=user_id,
                target_id=target_id,
                target_type=target_type
            )
            
            await mongodb.insert_one("likes", like.model_dump())
            
            # Increment like count
            await increment_like_count(target_id, target_type)
            
            logger.info(f"User {user_id} liked {target_type} {target_id}")
            return True

    @staticmethod
    async def get_user_posts(
        user_id: str,
        page: int = 1,
        page_size: int = 20
    ) -> Tuple[List[PostResponse], int]:
        """
        Get posts by a specific user
        
        Args:
            user_id: User ID
            page: Page number
            page_size: Number of posts per page
            
        Returns:
            Tuple of (list of posts, total count)
        """
        skip = (page - 1) * page_size
        
        posts = await mongodb.find_many(
            "posts",
            {"user_id": user_id},
            limit=page_size,
            skip=skip,
            sort=[("created_at", -1)]
        )
        
        total_count = await mongodb.count_documents("posts", {"user_id": user_id})
        
        post_responses = [PostResponse(**post_data, is_liked_by_user=False) for post_data in posts]
        
        return post_responses, total_count


# Create singleton instance
forum_service = ForumService()
