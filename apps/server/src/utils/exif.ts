import { promisify } from 'util';
import exif from 'exif';

const getExifDataAsync = promisify(exif);

export async function getExifData(filePath: string): Promise<Record<string, any>> {
  try {
    return await getExifDataAsync(filePath);
  } catch (error) {
    console.error('Error reading EXIF data:', error);
    return {};
  }
} 