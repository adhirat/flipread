// R2 Storage Service — upload, delete, and signed URL generation

import type { Env } from '../lib/types';

export class StorageService {
  constructor(private bucket: R2Bucket) {}

  async upload(key: string, data: ArrayBuffer | ReadableStream, contentType: string): Promise<R2Object> {
    return await this.bucket.put(key, data, {
      httpMetadata: { contentType },
    });
  }

  async delete(key: string): Promise<void> {
    await this.bucket.delete(key);
  }

  async getObject(key: string): Promise<R2ObjectBody | null> {
    return await this.bucket.get(key);
  }

  async head(key: string): Promise<R2Object | null> {
    return await this.bucket.head(key);
  }

  /**
   * Generate a file key for R2 storage.
   * Format: users/{userId}/books/{bookId}/{filename}
   */
  static generateFileKey(userId: string, bookId: string, filename: string): string {
    return `users/${userId}/books/${bookId}/${filename}`;
  }
}
