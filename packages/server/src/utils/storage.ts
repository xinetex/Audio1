import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export const STORAGE_PATHS = {
  uploads: join(process.cwd(), 'uploads'),
  outputs: join(process.cwd(), 'outputs'),
  images: join(process.cwd(), 'outputs', 'images'),
  videos: join(process.cwd(), 'outputs', 'videos'),
};

export function setupStorage() {
  Object.values(STORAGE_PATHS).forEach((path) => {
    if (!existsSync(path)) {
      mkdirSync(path, { recursive: true });
      console.log(`Created storage directory: ${path}`);
    }
  });
}

export function getUploadPath(filename: string): string {
  return join(STORAGE_PATHS.uploads, filename);
}

export function getImagePath(filename: string): string {
  return join(STORAGE_PATHS.images, filename);
}

export function getVideoPath(filename: string): string {
  return join(STORAGE_PATHS.videos, filename);
}
