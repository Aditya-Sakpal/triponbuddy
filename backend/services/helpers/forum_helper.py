"""
Forum helper functions
Handles comment tree building, like checking, and data transformations
"""

import logging
from typing import List, Dict, Optional

from database import mongodb
from models.forum import CommentResponse

logger = logging.getLogger(__name__)


async def check_user_liked_target(
    user_id: str,
    target_id: str,
    target_type: str
) -> bool:
    """
    Check if a user has liked a post or comment
    
    Args:
        user_id: User ID
        target_id: Post or comment ID
        target_type: "post" or "comment"
        
    Returns:
        True if liked, False otherwise
    """
    if not user_id:
        return False
        
    like = await mongodb.find_one(
        "likes",
        {
            "user_id": user_id,
            "target_id": target_id,
            "target_type": target_type
        }
    )
    return like is not None


def build_comment_tree(
    all_comments: List[Dict],
    current_user_id: Optional[str] = None
) -> List[CommentResponse]:
    """
    Build a tree structure from flat list of comments
    
    Args:
        all_comments: List of comment dictionaries from database
        current_user_id: Current user ID to check likes
        
    Returns:
        List of top-level comments with nested replies
    """
    # Build a map of comment_id -> comment
    comment_map: Dict[str, CommentResponse] = {}
    
    for comment_data in all_comments:
        comment_response = CommentResponse(
            **comment_data,
            is_liked_by_user=False,  # Will be updated below
            replies=[]
        )
        comment_map[comment_response.comment_id] = comment_response
    
    # Build the tree structure
    top_level_comments: List[CommentResponse] = []
    
    for comment in comment_map.values():
        if comment.parent_comment_id is None:
            top_level_comments.append(comment)
        else:
            # Add as a reply to parent
            parent = comment_map.get(comment.parent_comment_id)
            if parent:
                if parent.replies is None:
                    parent.replies = []
                parent.replies.append(comment)
    
    return top_level_comments


async def enrich_comments_with_likes(
    comments: List[CommentResponse],
    current_user_id: Optional[str]
) -> None:
    """
    Enrich comments with like status for current user (modifies in place)
    
    Args:
        comments: List of comments to enrich
        current_user_id: Current user ID to check likes
    """
    if not current_user_id:
        return
    
    # Recursively update like status
    for comment in comments:
        is_liked = await check_user_liked_target(
            current_user_id,
            comment.comment_id,
            "comment"
        )
        comment.is_liked_by_user = is_liked
        
        # Recursively enrich replies
        if comment.replies:
            await enrich_comments_with_likes(comment.replies, current_user_id)


def get_collection_and_field_for_target_type(target_type: str) -> tuple[str, str]:
    """
    Get collection name and ID field for a target type
    
    Args:
        target_type: "post" or "comment"
        
    Returns:
        Tuple of (collection_name, id_field)
    """
    if target_type == "post":
        return "posts", "post_id"
    else:
        return "comments", "comment_id"
