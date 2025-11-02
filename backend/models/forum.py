"""
Forum/Social Feed Pydantic models
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timezone
from pydantic import BaseModel, Field
from uuid import uuid4


def generate_post_id() -> str:
    """Generate unique post ID"""
    return f"post_{uuid4().hex[:12]}"


def generate_comment_id() -> str:
    """Generate unique comment ID"""
    return f"comment_{uuid4().hex[:12]}"


def utc_now() -> datetime:
    """Get current UTC time with timezone info"""
    return datetime.now(timezone.utc)


class PostImage(BaseModel):
    """Image attached to a post"""
    url: str = Field(description="Image URL")
    alt: Optional[str] = Field(default=None, description="Alt text for image")


class SharedTrip(BaseModel):
    """Trip information shared in a post"""
    trip_id: str = Field(description="ID of the shared trip")
    destination: str = Field(description="Trip destination")
    total_cost: str = Field(description="Total trip cost")
    cover_image_url: Optional[str] = Field(default=None, description="Trip cover image URL")
    start_date: str = Field(description="Trip start date")
    end_date: str = Field(description="Trip end date")
    duration_days: int = Field(description="Trip duration in days")


class CreatePostRequest(BaseModel):
    """Request model for creating a post"""
    content: str = Field(description="Post text content", min_length=1, max_length=5000)
    images: Optional[List[PostImage]] = Field(default=None, description="Optional images to attach")
    shared_trip: Optional[SharedTrip] = Field(default=None, description="Optional trip to share")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Just came back from an amazing trip to Goa!",
                "images": [{"url": "https://example.com/image.jpg", "alt": "Beach view"}],
                "shared_trip": None
            }
        }


class Post(BaseModel):
    """Post model"""
    post_id: str = Field(default_factory=generate_post_id, description="Unique post ID")
    user_id: str = Field(description="ID of the user who created the post")
    username: str = Field(description="Username of the post creator")
    content: str = Field(description="Post text content")
    images: Optional[List[PostImage]] = Field(default=None, description="Attached images")
    shared_trip: Optional[SharedTrip] = Field(default=None, description="Shared trip information")
    likes_count: int = Field(default=0, description="Number of likes")
    comments_count: int = Field(default=0, description="Number of comments")
    created_at: datetime = Field(default_factory=utc_now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=utc_now, description="Last update timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None
        }


class PostResponse(BaseModel):
    """Response model for a post with additional user interaction data"""
    post_id: str
    user_id: str
    username: str
    content: str
    images: Optional[List[PostImage]] = None
    shared_trip: Optional[SharedTrip] = None
    likes_count: int
    comments_count: int
    created_at: datetime
    updated_at: datetime
    is_liked_by_user: bool = Field(default=False, description="Whether current user liked this post")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None
        }


class CreateCommentRequest(BaseModel):
    """Request model for creating a comment"""
    content: str = Field(description="Comment text content", min_length=1, max_length=2000)
    parent_comment_id: Optional[str] = Field(default=None, description="ID of parent comment for replies")

    class Config:
        json_schema_extra = {
            "example": {
                "content": "Great post! I've been wanting to visit Goa too.",
                "parent_comment_id": None
            }
        }


class Comment(BaseModel):
    """Comment model"""
    comment_id: str = Field(default_factory=generate_comment_id, description="Unique comment ID")
    post_id: str = Field(description="ID of the post this comment belongs to")
    user_id: str = Field(description="ID of the user who created the comment")
    username: str = Field(description="Username of the comment creator")
    content: str = Field(description="Comment text content")
    parent_comment_id: Optional[str] = Field(default=None, description="ID of parent comment (for threaded replies)")
    likes_count: int = Field(default=0, description="Number of likes on this comment")
    replies_count: int = Field(default=0, description="Number of direct replies to this comment")
    created_at: datetime = Field(default_factory=utc_now, description="Creation timestamp")
    updated_at: datetime = Field(default_factory=utc_now, description="Last update timestamp")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None
        }


class CommentResponse(BaseModel):
    """Response model for a comment with user interaction data"""
    comment_id: str
    post_id: str
    user_id: str
    username: str
    content: str
    parent_comment_id: Optional[str] = None
    likes_count: int
    replies_count: int
    created_at: datetime
    updated_at: datetime
    is_liked_by_user: bool = Field(default=False, description="Whether current user liked this comment")
    replies: Optional[List['CommentResponse']] = Field(default=None, description="Nested replies (optional)")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None
        }


class Like(BaseModel):
    """Like model"""
    user_id: str = Field(description="ID of the user who liked")
    target_id: str = Field(description="ID of the post or comment that was liked")
    target_type: str = Field(description="Type of target: 'post' or 'comment'")
    created_at: datetime = Field(default_factory=utc_now, description="When the like was created")

    class Config:
        json_encoders = {
            datetime: lambda v: v.replace(tzinfo=timezone.utc).isoformat() if v else None
        }


class PostFeedResponse(BaseModel):
    """Response model for post feed with pagination"""
    success: bool = Field(default=True)
    posts: List[PostResponse] = Field(description="List of posts")
    page: int = Field(description="Current page number")
    page_size: int = Field(description="Number of posts per page")
    total_posts: int = Field(description="Total number of posts")
    has_more: bool = Field(description="Whether there are more posts to load")


class CommentsResponse(BaseModel):
    """Response model for comments with pagination"""
    success: bool = Field(default=True)
    comments: List[CommentResponse] = Field(description="List of comments")
    total_comments: int = Field(description="Total number of comments")


class ActionResponse(BaseModel):
    """Generic response for actions like create/update/delete"""
    success: bool = Field(default=True)
    message: str = Field(description="Response message")
    data: Optional[Dict[str, Any]] = Field(default=None, description="Additional response data")


# Update forward references for nested models
CommentResponse.model_rebuild()
