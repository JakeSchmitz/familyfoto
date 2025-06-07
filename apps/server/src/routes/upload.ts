import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs'; // Re-import fs for local storage
import { Storage } from '@google-cloud/storage';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Environment variables
const PHOTO_UPLOAD_TARGET = process.env.PHOTO_UPLOAD_TARGET || 'local'; // Default to local
const GCS_BUCKET_NAME = process.env.GCS_BUCKET_NAME;
const PHOTOS_DIR = process.env.PHOTOS_DIR || path.join(__dirname, '../../uploads');

// Initialize Google Cloud Storage only if target is GCS
const storageClient = PHOTO_UPLOAD_TARGET === 'gcs' ? new Storage() : null;

// Configure multer storage based on environment variable
const multerStorage = PHOTO_UPLOAD_TARGET === 'local'
  ? multer.diskStorage({
      destination: (req, file, cb) => {
        if (!fs.existsSync(PHOTOS_DIR)) {
          fs.mkdirSync(PHOTOS_DIR, { recursive: true });
        }
        cb(null, PHOTOS_DIR);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    })
  : multer.memoryStorage();

const upload = multer({
  storage: multerStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB limit
  }
});

// Separate function for saving file metadata to database
async function savePhotoMetadata(
  filename: string,
  originalName: string,
  description: string,
  tags: string[],
  gcsUrl?: string // gcsUrl is now optional
) {
  return prisma.photo.create({
    data: {
      filename,
      originalName,
      description,
      ...(gcsUrl && { gcsUrl }), // Conditionally include gcsUrl if it's provided
      tags: {
        connectOrCreate: tags.map(tag => ({
          where: { name: tag },
          create: { name: tag }
        }))
      }
    }
  });
}

// Upload endpoint
router.post('/', upload.single('photo'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { description, tags } = req.body;
    const parsedTags = tags ? JSON.parse(tags) : [];
    let photoId: string = ''; // Initialize to empty string
    let photoUrl: string = ''; // Initialize to empty string

    if (PHOTO_UPLOAD_TARGET === 'local') {
      // Local storage implementation
      // No need to write the file again as multer.diskStorage already did it
      const photo = await savePhotoMetadata(
        req.file!.filename,
        req.file!.originalname,
        description,
        parsedTags
      );
      photoId = photo.id.toString();
      photoUrl = `/api/photos/${photo.filename}`;

    } else { // Default to GCS storage
      if (!GCS_BUCKET_NAME || !storageClient) {
          throw new Error('GCS_BUCKET_NAME or storageClient is not set for GCS upload.');
      }

      const bucket = storageClient.bucket(GCS_BUCKET_NAME);
      const uniqueFilename = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(req.file!.originalname);
      const blob = bucket.file(uniqueFilename);

      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: req.file!.mimetype
        }
      });

      let createdPhoto: any; // Use any for now to simplify type handling from promise
      await new Promise<void>((resolve, reject) => {
        blobStream.on('error', (err) => {
          console.error('Blob stream error:', err);
          reject(new Error('Failed to upload file to Google Cloud Storage'));
        });

        blobStream.on('finish', async () => {
          try {
            await blob.makePublic(); // Make the image publicly accessible
            const gcsUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;
            
            createdPhoto = await savePhotoMetadata(
              blob.name,
              req.file!.originalname,
              description,
              parsedTags,
              gcsUrl
            );
            resolve();
          } catch (dbError) {
            console.error('Database save error after GCS upload:', dbError);
            reject(new Error('Failed to save photo metadata after GCS upload'));
          }
        });

        blobStream.end(req.file!.buffer);
      });
      
      // Now assign photoId and photoUrl from the createdPhoto after the promise resolves
      if (!createdPhoto) {
          throw new Error('Photo metadata not saved for GCS upload.');
      }
      photoId = createdPhoto.id.toString();
      photoUrl = createdPhoto.gcsUrl || `/api/photos/${createdPhoto.filename}`; // Use gcsUrl from createdPhoto

    }

    res.status(201).json({
      message: 'Photo uploaded successfully',
      photo: {
          id: photoId,
          url: photoUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload photo' });
  }
});

export default router; 