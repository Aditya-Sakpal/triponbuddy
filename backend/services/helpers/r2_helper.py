"""
Cloudflare R2 Upload Helper
Handles image uploads to Cloudflare R2 using S3-compatible API
"""

import logging
from uuid import uuid4
import boto3
from botocore.exceptions import ClientError, BotoCoreError

from config import settings

logger = logging.getLogger(__name__)


class R2UploadHelper:
    """Helper class for uploading files to Cloudflare R2"""

    def __init__(self):
        """Initialize S3 client for R2"""
        self.endpoint_url = f"https://{settings.r2_account_id}.r2.cloudflarestorage.com"
        self.bucket_name = settings.r2_bucket
        self.public_url = settings.r2_public_url
        
        # Initialize boto3 S3 client with R2 credentials
        self.s3_client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,
            aws_access_key_id=settings.r2_access_key_id,
            aws_secret_access_key=settings.r2_secret_access_key,
            region_name='auto'  # R2 uses 'auto' for region
        )
        
        logger.info(f"R2 client initialized for bucket: {self.bucket_name}")

    def generate_unique_filename(self, original_filename: str) -> str:
        """
        Generate a unique filename using UUID
        
        Args:
            original_filename: Original filename with extension
            
        Returns:
            Unique filename with preserved extension
        """
        # Extract file extension
        extension = original_filename.rsplit('.', 1)[-1].lower() if '.' in original_filename else ''
        
        # Generate UUID-based filename
        unique_id = uuid4().hex
        
        if extension:
            return f"{unique_id}.{extension}"
        return unique_id

    async def upload_image(
        self,
        file_content: bytes,
        filename: str,
        content_type: str,
        folder: str = "forum"
    ) -> str:
        """
        Upload an image to Cloudflare R2
        
        Args:
            file_content: Binary content of the file
            filename: Filename (will be made unique)
            content_type: MIME type of the file
            folder: Folder/prefix in R2 bucket (default: "forum")
            
        Returns:
            Public URL of the uploaded file
            
        Raises:
            Exception: If upload fails
        """
        try:
            # Generate unique filename
            unique_filename = self.generate_unique_filename(filename)
            
            # Construct object key with folder prefix
            object_key = f"{folder}/{unique_filename}"
            
            logger.info(f"Uploading file to R2: {object_key}")
            
            # Upload to R2
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=object_key,
                Body=file_content,
                ContentType=content_type,
                # Make the file publicly accessible
                # Note: Your R2 bucket must have public access enabled
            )
            
            # Construct public URL
            public_url = f"{self.public_url}/{object_key}"
            
            logger.info(f"File uploaded successfully: {public_url}")
            return public_url
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"R2 ClientError during upload: {error_code} - {error_message}")
            raise Exception(f"Failed to upload to R2: {error_message}")
            
        except BotoCoreError as e:
            logger.error(f"R2 BotoCoreError during upload: {str(e)}")
            raise Exception(f"Failed to upload to R2: {str(e)}")
            
        except Exception as e:
            logger.error(f"Unexpected error during R2 upload: {str(e)}")
            raise Exception(f"Failed to upload to R2: {str(e)}")

    async def delete_image(self, file_url: str) -> bool:
        """
        Delete an image from Cloudflare R2
        
        Args:
            file_url: Full public URL of the file
            
        Returns:
            True if deletion was successful
            
        Raises:
            Exception: If deletion fails
        """
        try:
            # Extract object key from URL
            # URL format: https://pub-xxxx.r2.dev/folder/filename.ext
            object_key = file_url.replace(f"{self.public_url}/", "")
            
            logger.info(f"Deleting file from R2: {object_key}")
            
            # Delete from R2
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            
            logger.info(f"File deleted successfully: {object_key}")
            return True
            
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"R2 ClientError during deletion: {error_code} - {error_message}")
            raise Exception(f"Failed to delete from R2: {error_message}")
            
        except Exception as e:
            logger.error(f"Unexpected error during R2 deletion: {str(e)}")
            raise Exception(f"Failed to delete from R2: {str(e)}")


# Global R2 helper instance
r2_helper = R2UploadHelper()
