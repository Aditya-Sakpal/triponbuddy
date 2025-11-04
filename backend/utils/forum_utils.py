import logging

from database import mongodb

logger = logging.getLogger(__name__)


async def verify_post_ownership(post_id: str, user_id: str) -> bool:

    post = await mongodb.find_one("posts", {"post_id": post_id})
    return post is not None and post["user_id"] == user_id


async def verify_comment_ownership(comment_id: str, user_id: str) -> bool:

    comment = await mongodb.find_one("comments", {"comment_id": comment_id})
    return comment is not None and comment["user_id"] == user_id


async def verify_post_exists(post_id: str) -> bool:

    post = await mongodb.find_one("posts", {"post_id": post_id})
    return post is not None


async def verify_comment_exists(comment_id: str) -> bool:

    comment = await mongodb.find_one("comments", {"comment_id": comment_id})
    return comment is not None


async def increment_post_comment_count(post_id: str) -> None:

    logger.info(f"Incrementing comment count for post_id={post_id}")
    update_result = await mongodb.update_one(
        "posts",
        {"post_id": post_id},
        {"$inc": {"comments_count": 1}}
    )
    logger.info(f"Increment result: {update_result}")
    
    # Verify the update
    updated_post = await mongodb.find_one("posts", {"post_id": post_id})
    logger.info(
        f"Post after increment: comments_count="
        f"{updated_post.get('comments_count') if updated_post else 'NOT FOUND'}"
    )


async def decrement_post_comment_count(post_id: str) -> None:

    await mongodb.update_one(
        "posts",
        {"post_id": post_id},
        {"$inc": {"comments_count": -1}}
    )
    logger.info(f"Decremented comment count for post_id={post_id}")


async def increment_comment_reply_count(comment_id: str) -> None:

    await mongodb.update_one(
        "comments",
        {"comment_id": comment_id},
        {"$inc": {"replies_count": 1}}
    )
    logger.info(f"Incremented reply count for comment_id={comment_id}")


async def decrement_comment_reply_count(comment_id: str) -> None:

    await mongodb.update_one(
        "comments",
        {"comment_id": comment_id},
        {"$inc": {"replies_count": -1}}
    )
    logger.info(f"Decremented reply count for comment_id={comment_id}")


async def increment_like_count(target_id: str, target_type: str) -> None:

    collection_name = "posts" if target_type == "post" else "comments"
    id_field = "post_id" if target_type == "post" else "comment_id"
    
    await mongodb.update_one(
        collection_name,
        {id_field: target_id},
        {"$inc": {"likes_count": 1}}
    )
    logger.info(f"Incremented like count for {target_type} {target_id}")


async def decrement_like_count(target_id: str, target_type: str) -> None:

    collection_name = "posts" if target_type == "post" else "comments"
    id_field = "post_id" if target_type == "post" else "comment_id"
    
    await mongodb.update_one(
        collection_name,
        {id_field: target_id},
        {"$inc": {"likes_count": -1}}
    )
    logger.info(f"Decremented like count for {target_type} {target_id}")


async def delete_post_cascade(post_id: str) -> None:

    await mongodb.delete_many("comments", {"post_id": post_id})
    await mongodb.delete_many("likes", {"target_id": post_id, "target_type": "post"})
    logger.info(f"Deleted all associated data for post {post_id}")


async def delete_comment_cascade(comment_id: str) -> None:

    # Delete all replies to this comment
    await mongodb.delete_many("comments", {"parent_comment_id": comment_id})
    
    # Delete likes on this comment
    await mongodb.delete_many("likes", {"target_id": comment_id, "target_type": "comment"})
    
    logger.info(f"Deleted all associated data for comment {comment_id}")
