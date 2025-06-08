import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getExifData } from '../utils/exif';
import { getLocationFromExif } from '../utils/geocoding';

const router = Router();
const prisma = new PrismaClient();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Initialize Google Cloud Storage only if credentials are available
let storage: any = null;
let bucket: any = null;

if (
  process.env.GOOGLE_APPLICATION_CREDENTIALS &&
  process.env.GOOGLE_CLOUD_PROJECT_ID &&
  process.env.GOOGLE_CLOUD_BUCKET_NAME
) {
  // Only require if all env vars are set
  const { Storage } = require('@google-cloud/storage');
  storage = new Storage({
    keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
    projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
  });
  bucket = storage.bucket(process.env.GOOGLE_CLOUD_BUCKET_NAME);
}

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number;
        email: string;
        name?: string;
      };
    }
  }
}

router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = req.file;
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join('uploads', fileName);

    // Create uploads directory if it doesn't exist
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads');
    }

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    // Get EXIF data
    const exifData = await getExifData(filePath);
    const location = await getLocationFromExif(exifData);

    let publicUrl: string | undefined;

    if (storage && bucket) {
      // Upload to Google Cloud Storage
      const blob = bucket.file(fileName);
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.mimetype,
        },
      });

      await new Promise((resolve, reject) => {
        blobStream.on('error', (error: any) => {
          console.error('Error uploading to GCS:', error);
          reject(error);
        });

        blobStream.on('finish', () => {
          publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
          resolve(undefined);
        });

        blobStream.end(file.buffer);
      });
      // Clean up local file after upload to GCS
      fs.unlinkSync(filePath);
    } else {
      // For local development, use the local file path
      publicUrl = `/api/photos/${fileName}`;
    }

    // Create photo record in database
    const photo = await prisma.photo.create({
      data: {
        filename: fileName,
        originalName: file.originalname,
        gcsUrl: publicUrl,
        userId: req.user.id,
        tags: {
          create: location ? [{
            name: location
          }] : []
        }
      },
      include: {
        tags: true,
        user: true
      }
    });

    res.json(photo);
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Error processing upload' });
  }
});

export default router; 