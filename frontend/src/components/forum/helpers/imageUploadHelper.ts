/**
 * Image Upload Helper
 * Handles image upload logic for forum posts
 */

import { PostImage } from "@/types/forum";
import { API_BASE_URL } from "@/constants/api";

export interface ImageUploadResult {
  success: boolean;
  images: PostImage[];
  errors: string[];
}

/**
 * Upload images to Cloudflare R2
 */
export const uploadImages = async (
  files: FileList,
  existingImagesCount: number,
  maxImages: number = 10
): Promise<ImageUploadResult> => {
  const result: ImageUploadResult = {
    success: false,
    images: [],
    errors: [],
  };

  // Validate file count
  if (files.length + existingImagesCount > maxImages) {
    result.errors.push(`You can upload a maximum of ${maxImages} images per post.`);
    return result;
  }

  try {
    const formData = new FormData();

    // Add all files to FormData
    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    // Upload to backend
    const response = await fetch(`${API_BASE_URL}/api/upload/images`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const uploadResult = await response.json();

    // Process successfully uploaded images
    if (uploadResult.uploaded && uploadResult.uploaded.length > 0) {
      result.images = uploadResult.uploaded.map(
        (item: { url: string; filename: string }) => ({
          url: item.url,
          alt: item.filename,
        })
      );
      result.success = true;
    }

    // Collect errors for failed uploads
    if (uploadResult.failed && uploadResult.failed.length > 0) {
      result.errors = uploadResult.failed.map(
        (item: { filename: string; error: string }) =>
          `${item.filename}: ${item.error}`
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    result.errors.push("Failed to upload images. Please try again.");
  }

  return result;
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  const maxSize = 5 * 1024 * 1024; // 5MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `${file.name}: Invalid file type. Only JPEG, PNG, and WebP are allowed.`,
    };
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: `${file.name}: File too large. Maximum size is 5MB.`,
    };
  }

  return { valid: true };
};

/**
 * Validate multiple image files
 */
export const validateImageFiles = (files: FileList): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const validation = validateImageFile(files[i]);
    if (!validation.valid && validation.error) {
      errors.push(validation.error);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
};
