import { ExifData } from 'exif';

interface Coordinates {
  latitude: number;
  longitude: number;
}

interface NominatimResponse {
  display_name: string;
}

function convertDMSToDD(degrees: number, minutes: number, seconds: number, direction: string): number {
  let dd = degrees + minutes / 60 + seconds / 3600;
  if (direction === 'S' || direction === 'W') {
    dd = -dd;
  }
  return dd;
}

function getCoordinatesFromExif(exifData: ExifData): Coordinates | null {
  try {
    if (!exifData.gps) {
      return null;
    }

    const { GPSLatitude, GPSLatitudeRef, GPSLongitude, GPSLongitudeRef } = exifData.gps;

    if (!GPSLatitude || !GPSLongitude || !GPSLatitudeRef || !GPSLongitudeRef) {
      return null;
    }

    const latitude = convertDMSToDD(
      GPSLatitude[0],
      GPSLatitude[1],
      GPSLatitude[2],
      GPSLatitudeRef
    );

    const longitude = convertDMSToDD(
      GPSLongitude[0],
      GPSLongitude[1],
      GPSLongitude[2],
      GPSLongitudeRef
    );

    return { latitude, longitude };
  } catch (error) {
    console.error('Error extracting coordinates from EXIF:', error);
    return null;
  }
}

export async function getLocationFromExif(exifData: ExifData): Promise<string | null> {
  const coordinates = getCoordinatesFromExif(exifData);
  
  if (!coordinates) {
    return null;
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.latitude}&lon=${coordinates.longitude}&zoom=10`
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch location data');
    }

    const data = await response.json() as NominatimResponse;
    return data.display_name || null;
  } catch (error) {
    console.error('Error fetching location data:', error);
    return null;
  }
} 