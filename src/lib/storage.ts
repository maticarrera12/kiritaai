// lib/storage.ts

import { put, del } from "@vercel/blob";

/**
 * Upload an image to Vercel Blob storage
 * @param file - File to upload
 * @param userId - User ID for organizing files
 * @param type - Type of asset (logo, avatar, etc.)
 * @returns Object with URL, path, and size
 */
export async function uploadImage(
  file: File,
  userId: string,
  type: "logo" | "avatar"
): Promise<{ url: string; path: string; size: number }> {
  // Generate unique filename
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
  const filename = `${timestamp}-${sanitizedName}`;

  // Create organized path
  const path = `${type}s/${userId}/${filename}`;

  try {
    // Upload to Vercel Blob
    const blob = await put(path, file, {
      access: "public",
      addRandomSuffix: true, // Adds random suffix to avoid collisions
    });

    return {
      url: blob.url,
      path: path,
      size: file.size,
    };
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error);
    throw new Error("Failed to upload image to storage");
  }
}

/**
 * Delete an image from Vercel Blob storage
 * @param url - Blob URL to delete
 */
export async function deleteImage(url: string): Promise<void> {
  try {
    await del(url);
  } catch (error) {
    console.error("Error deleting from Vercel Blob:", error);
    throw new Error("Failed to delete image from storage");
  }
}

/**
 * Upload multiple images at once
 * @param files - Array of files to upload
 * @param userId - User ID
 * @param type - Asset type
 * @returns Array of upload results
 */
export async function uploadImages(
  files: File[],
  userId: string,
  type: "logo" | "avatar"
): Promise<Array<{ url: string; path: string; size: number }>> {
  const uploadPromises = files.map((file) => uploadImage(file, userId, type));
  return Promise.all(uploadPromises);
}

/**
 * Delete multiple images at once
 * @param urls - Array of Blob URLs to delete
 */
export async function deleteImages(urls: string[]): Promise<void> {
  const deletePromises = urls.map((url) => deleteImage(url));
  await Promise.all(deletePromises);
}

/**
 * Get storage usage for a user (optional - for future features)
 * Note: Vercel Blob doesn't provide built-in usage tracking,
 * so you'd need to track this in your database
 */
export async function getUserStorageUsage(userId: string): Promise<number> {
  // TODO: Implement by querying BrandAsset table
  // and summing fileSize for the user
  return 0;
}
