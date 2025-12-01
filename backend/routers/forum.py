"""
Forum/Social Feed API router
"""

import logging
from typing import Optional
from fastapi import APIRouter, HTTPException, Query, Request

from models.forum import (
    CreatePostRequest,
    PostFeedResponse,
    PostResponse,
    CreateCommentRequest,
    CommentsResponse,
    ActionResponse
)
from services.forum_service import forum_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/forum", tags=["forum"])


@router.post("/posts", response_model=ActionResponse)
async def create_post(
    request: Request,
    post_data: CreatePostRequest,
    user_id: str = Query(..., description="User ID from Clerk"),
    username: str = Query(..., description="Username of the post creator")
):
    """
    Create a new post
    
    - **content**: Post text content (required)
    - **images**: Optional list of image URLs to attach
    - **shared_trip**: Optional trip data to share
    """
    try:
        post = await forum_service.create_post(user_id, username, post_data)
        
        return ActionResponse(
            success=True,
            message="Post created successfully",
            data={"post_id": post.post_id}
        )
    
    except Exception as e:
        logger.error(f"Error creating post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/posts", response_model=PostFeedResponse)
async def get_post_feed(
    request: Request,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Posts per page"),
    user_id: Optional[str] = Query(None, description="Current user ID for like status"),
    exclude_own_posts: bool = Query(False, description="Exclude posts by the current user")
):
    """
    Get paginated feed of posts
    
    Returns posts in reverse chronological order with like/comment counts
    """
    try:
        exclude_user_id = user_id if exclude_own_posts and user_id else None
        
        posts, total_count = await forum_service.get_post_feed(
            page=page,
            page_size=page_size,
            current_user_id=user_id,
            exclude_user_id=exclude_user_id
        )
        
        has_more = (page * page_size) < total_count
        
        return PostFeedResponse(
            success=True,
            posts=posts,
            page=page,
            page_size=page_size,
            total_posts=total_count,
            has_more=has_more
        )
    
    except Exception as e:
        logger.error(f"Error getting post feed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/posts/{post_id}", response_model=PostResponse)
async def get_post(
    request: Request,
    post_id: str,
    user_id: Optional[str] = Query(None, description="Current user ID for like status")
):
    """
    Get a single post by ID
    """
    try:
        post = await forum_service.get_post_by_id(post_id, user_id)
        
        if not post:
            raise HTTPException(status_code=404, detail="Post not found")
        
        return post
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/posts/{post_id}", response_model=ActionResponse)
async def delete_post(
    request: Request,
    post_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """
    Delete a post (only by the post creator)
    """
    try:
        deleted = await forum_service.delete_post(post_id, user_id)
        
        if not deleted:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this post or post not found"
            )
        
        return ActionResponse(
            success=True,
            message="Post deleted successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting post: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users/{user_id}/posts", response_model=PostFeedResponse)
async def get_user_posts(
    request: Request,
    user_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Posts per page")
):
    """
    Get all posts by a specific user
    """
    try:
        posts, total_count = await forum_service.get_user_posts(
            user_id=user_id,
            page=page,
            page_size=page_size
        )
        
        has_more = (page * page_size) < total_count
        
        return PostFeedResponse(
            success=True,
            posts=posts,
            page=page,
            page_size=page_size,
            total_posts=total_count,
            has_more=has_more
        )
    
    except Exception as e:
        logger.error(f"Error getting user posts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/posts/{post_id}/comments", response_model=ActionResponse)
async def create_comment(
    request: Request,
    post_id: str,
    comment_data: CreateCommentRequest,
    user_id: str = Query(..., description="User ID from Clerk"),
    username: str = Query(..., description="Username of the commenter")
):
    """
    Create a comment on a post
    
    - **content**: Comment text content (required)
    - **parent_comment_id**: Optional parent comment ID for threaded replies
    """
    try:
        comment = await forum_service.create_comment(
            post_id=post_id,
            user_id=user_id,
            username=username,
            comment_data=comment_data
        )
        
        if not comment:
            raise HTTPException(
                status_code=404,
                detail="Post not found or parent comment not found"
            )
        
        return ActionResponse(
            success=True,
            message="Comment created successfully",
            data={"comment_id": comment.comment_id}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/posts/{post_id}/comments", response_model=CommentsResponse)
async def get_post_comments(
    request: Request,
    post_id: str,
    user_id: Optional[str] = Query(None, description="Current user ID for like status")
):
    """
    Get all comments for a post with nested replies
    """
    try:
        comments = await forum_service.get_post_comments(post_id, user_id)
        
        return CommentsResponse(
            success=True,
            comments=comments,
            total_comments=len(comments)
        )
    
    except Exception as e:
        logger.error(f"Error getting comments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/comments/{comment_id}", response_model=ActionResponse)
async def delete_comment(
    request: Request,
    comment_id: str,
    user_id: str = Query(..., description="User ID from Clerk")
):
    """
    Delete a comment (only by the comment creator)
    """
    try:
        deleted = await forum_service.delete_comment(comment_id, user_id)
        
        if not deleted:
            raise HTTPException(
                status_code=403,
                detail="Not authorized to delete this comment or comment not found"
            )
        
        return ActionResponse(
            success=True,
            message="Comment deleted successfully"
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting comment: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/like", response_model=ActionResponse)
async def toggle_like(
    request: Request,
    user_id: str = Query(..., description="User ID from Clerk"),
    target_id: str = Query(..., description="Post or comment ID to like"),
    target_type: str = Query(..., description="Type: 'post' or 'comment'")
):
    """
    Toggle like on a post or comment
    
    Returns whether the item was liked (True) or unliked (False)
    """
    try:
        if target_type not in ["post", "comment"]:
            raise HTTPException(
                status_code=400,
                detail="target_type must be 'post' or 'comment'"
            )
        
        is_liked = await forum_service.toggle_like(
            user_id=user_id,
            target_id=target_id,
            target_type=target_type
        )
        
        message = "Liked" if is_liked else "Unliked"
        
        return ActionResponse(
            success=True,
            message=f"{message} {target_type} successfully",
            data={"is_liked": is_liked}
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error toggling like: {e}")
        raise HTTPException(status_code=500, detail=str(e))
