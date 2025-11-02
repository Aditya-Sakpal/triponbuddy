"""
Upload API router for Cloudflare R2
Handles image uploads for forum posts and other features
"""

import logging
from typing import List
from fastapi import APIRouter, UploadFile, File, HTTPException, Request
from pydantic import BaseModel

from config import settings
from services.helpers.r2_helper import r2_helper

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/upload", tags=["upload"])


# Allowed image file extensions
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}

# Allowed MIME types
ALLOWED_MIME_TYPES = {
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp'
}

# Maximum file size in bytes (from settings)
MAX_FILE_SIZE = settings.max_upload_size_mb * 1024 * 1024  # Convert MB to bytes


class UploadResponse(BaseModel):
    """Response model for successful upload"""
    success: bool
    url: str
    filename: str
    size: int
    content_type: str


class BulkUploadResponse(BaseModel):
    """Response model for bulk upload"""
    success: bool
    uploaded: List[UploadResponse]
    failed: List[dict]


def validate_file_extension(filename: str) -> bool:
    """
    Validate file extension
    
    Args:
        filename: Name of the file
        
    Returns:
        True if extension is allowed
    """
    if '.' not in filename:
        return False
    
    extension = filename.rsplit('.', 1)[1].lower()
    return extension in ALLOWED_EXTENSIONS


def validate_content_type(content_type: str) -> bool:
    """
    Validate file MIME type
    
    Args:
        content_type: MIME type of the file
        
    Returns:
        True if MIME type is allowed
    """
    return content_type.lower() in ALLOWED_MIME_TYPES


def validate_file_size(size: int) -> bool:
    """
    Validate file size
    
    Args:
        size: Size of file in bytes
        
    Returns:
        True if size is within limit
    """
    return 0 < size <= MAX_FILE_SIZE


@router.post("/image", response_model=UploadResponse)
async def upload_image(
    request: Request,
    file: UploadFile = File(...)
):
    """
    Upload a single image to Cloudflare R2
    
    Validates:
    - File extension (jpg, jpeg, png, webp)
    - Content type
    - File size (max 10MB by default)
    
    Returns:
    - Public URL of uploaded image
    - File metadata
    """
    try:
        # Validate filename
        if not file.filename:
            raise HTTPException(status_code=400, detail="No filename provided")
        
        # Validate file extension
        if not validate_file_extension(file.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # Validate content type
        if not validate_content_type(file.content_type):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid content type. Must be an image (jpg, jpeg, png, webp)"
            )
        
        # Read file content
        file_content = await file.read()
        file_size = len(file_content)
        
        # Validate file size
        if not validate_file_size(file_size):
            max_mb = settings.max_upload_size_mb
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size: {max_mb}MB"
            )
        
        # Additional check for empty files
        if file_size == 0:
            raise HTTPException(status_code=400, detail="Empty file")
        
        # Upload to R2
        try:
            public_url = await r2_helper.upload_image(
                file_content=file_content,
                filename=file.filename,
                content_type=file.content_type,
                folder="forum"
            )
        except Exception as e:
            logger.error(f"R2 upload failed: {str(e)}")
            raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")
        
        logger.info(f"Image uploaded successfully: {file.filename} -> {public_url}")
        
        return UploadResponse(
            success=True,
            url=public_url,
            filename=file.filename,
            size=file_size,
            content_type=file.content_type
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error during upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.post("/images", response_model=BulkUploadResponse)
async def upload_multiple_images(
    request: Request,
    files: List[UploadFile] = File(...)
):
    """
    Upload multiple images to Cloudflare R2
    
    Validates each file:
    - File extension (jpg, jpeg, png, webp)
    - Content type
    - File size (max 10MB each by default)
    
    Returns:
    - List of successfully uploaded files with URLs
    - List of failed uploads with error messages
    """
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    
    if len(files) > 10:
        raise HTTPException(status_code=400, detail="Maximum 10 files allowed per request")
    
    uploaded = []
    failed = []
    
    for file in files:
        try:
            # Validate filename
            if not file.filename:
                failed.append({
                    "filename": "unknown",
                    "error": "No filename provided"
                })
                continue
            
            # Validate file extension
            if not validate_file_extension(file.filename):
                failed.append({
                    "filename": file.filename,
                    "error": f"Invalid file extension. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
                })
                continue
            
            # Validate content type
            if not validate_content_type(file.content_type):
                failed.append({
                    "filename": file.filename,
                    "error": "Invalid content type. Must be an image"
                })
                continue
            
            # Read file content
            file_content = await file.read()
            file_size = len(file_content)
            
            # Validate file size
            if not validate_file_size(file_size):
                failed.append({
                    "filename": file.filename,
                    "error": f"File too large. Maximum size: {settings.max_upload_size_mb}MB"
                })
                continue
            
            if file_size == 0:
                failed.append({
                    "filename": file.filename,
                    "error": "Empty file"
                })
                continue
            
            # Upload to R2
            try:
                public_url = await r2_helper.upload_image(
                    file_content=file_content,
                    filename=file.filename,
                    content_type=file.content_type,
                    folder="forum"
                )
                
                uploaded.append(UploadResponse(
                    success=True,
                    url=public_url,
                    filename=file.filename,
                    size=file_size,
                    content_type=file.content_type
                ))
                
                logger.info(f"Image uploaded: {file.filename} -> {public_url}")
                
            except Exception as e:
                failed.append({
                    "filename": file.filename,
                    "error": f"Upload failed: {str(e)}"
                })
                logger.error(f"Failed to upload {file.filename}: {str(e)}")
        
        except Exception as e:
            failed.append({
                "filename": file.filename if file.filename else "unknown",
                "error": f"Processing failed: {str(e)}"
            })
            logger.error(f"Error processing file: {str(e)}")
    
    return BulkUploadResponse(
        success=len(failed) == 0,
        uploaded=uploaded,
        failed=failed
    )
