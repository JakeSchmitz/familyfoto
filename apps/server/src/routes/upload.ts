import { Router } from 'express';
import multer from 'multer';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { getExifData } from '../utils/exif';
import { getLocationFromExif } from '../utils/geocoding';
import { authenticateToken } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Define uploads directory
const UPLOADS_DIR = process.env.PHOTOS_DIR || path.join(__dirname, '../../uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
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

// Add authentication middleware to the upload route
router.post('/', authenticateToken, upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!req.user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    const file = req.file;
    const { description, tags } = req.body;
    console.log('Upload request body:', { description, tags });

    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(UPLOADS_DIR, fileName);

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
    }

    // Parse tags if they exist
    let tagArray: string[] = [];
    if (tags) {
      try {
        tagArray = Array.isArray(tags) ? tags : JSON.parse(tags);
      } catch (e) {
        console.error('Error parsing tags:', e);
        tagArray = [];
      }
    }

    // Add location to tags if available
    if (location && !tagArray.includes(location)) {
      tagArray.push(location);
    }

    // Create photo record in database
    const photo = await prisma.photo.create({
      data: {
        filename: fileName,
        originalName: file.originalname,
        description: description || null,
        gcsUrl: publicUrl,
        userId: req.user.id,
        tags: {
          connectOrCreate: tagArray.map(tag => ({
            where: { name: tag.trim().toLowerCase() },
            create: { name: tag.trim().toLowerCase() }
          }))
        }
      },
      include: {
        tags: true,
        user: true
      }
    });

    console.log('Created photo with tags:', {
      photoId: photo.id,
      description: photo.description,
      tags: photo.tags.map(t => t.name)
    });

    res.json(photo);
  } catch (error) {
    console.error('Error in upload route:', error);
    res.status(500).json({ error: 'Error processing upload' });
  }
});

export default router; 