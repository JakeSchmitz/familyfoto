import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();
const router = Router();

const PHOTO_UPLOAD_TARGET = process.env.PHOTO_UPLOAD_TARGET || 'gcs'; // Default to gcs
const PHOTOS_DIR = process.env.PHOTOS_DIR || path.join(__dirname, '../../uploads');

// Define a type for the photo object with tags included and optional gcsUrl
type PhotoWithTags = {
  id: number;
  filename: string;
  originalName: string;
  description: string | null;
  gcsUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  tags: { id: number; name: string; }[];
};

// New endpoint to get all unique tags
router.get('/tags', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });
    res.json(tags.map(tag => tag.name));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { tags } = req.query;
    let photos: PhotoWithTags[]; // Explicitly type photos here
    
    if (tags && typeof tags === 'string') {
      const tagNames = tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
      photos = await prisma.photo.findMany({
        where: {
          tags: {
            some: {
              name: {
                in: tagNames
              }
            }
          }
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          description: true,
          gcsUrl: true, // Explicitly include gcsUrl
          createdAt: true,
          updatedAt: true,
          tags: { // Explicitly select tags as well
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      photos = await prisma.photo.findMany({
        select: {
          id: true,
          filename: true,
          originalName: true,
          description: true,
          gcsUrl: true, // Explicitly include gcsUrl
          createdAt: true,
          updatedAt: true,
          tags: { // Explicitly select tags as well
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    const photosWithUrls = photos.map(photo => ({
      id: photo.id,
      filename: photo.filename,
      originalName: photo.originalName,
      description: photo.description,
      url: photo.gcsUrl && PHOTO_UPLOAD_TARGET !== 'local'
            ? photo.gcsUrl
            : `/api/photos/${photo.filename}`,
      tags: photo.tags.map(tag => tag.name),
      timestamp: photo.createdAt.toISOString(),
    }));

    res.json(photosWithUrls);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Failed to fetch photos' });
  }
});

// Route to serve local photos if PHOTO_UPLOAD_TARGET is local and gcsUrl is not present
router.get('/:filename', async (req, res) => {
  if (PHOTO_UPLOAD_TARGET === 'local') {
    const filename = req.params.filename;
    const filePath = path.join(PHOTOS_DIR, filename);

    // Check if the file exists before sending
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ error: 'Photo not found' });
    }
  } else {
    res.status(400).json({ error: 'Local photo serving is not enabled.' });
  }
});

export default router; 