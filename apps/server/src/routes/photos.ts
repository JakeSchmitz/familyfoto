import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { authenticateToken } from '../middleware/auth';

const prisma = new PrismaClient();
const router = Router();

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
    console.log('Fetching all unique tags...');
    const tags = await prisma.tag.findMany({
      select: { name: true },
      distinct: ['name'],
      orderBy: { name: 'asc' },
    });
    console.log('Found tags:', tags);
    const tagNames = tags.map(tag => tag.name);
    console.log('Returning tag names:', tagNames);
    res.json(tagNames);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

// Get all photos with their tags and user information
router.get('/', async (req, res) => {
  try {
    const photos = await prisma.photo.findMany({
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(photos);
  } catch (error) {
    console.error('Error fetching photos:', error);
    res.status(500).json({ error: 'Error fetching photos' });
  }
});

// Get photos by user ID
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const photos = await prisma.photo.findMany({
      where: {
        userId: parseInt(userId)
      },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(photos);
  } catch (error) {
    console.error('Error fetching user photos:', error);
    res.status(500).json({ error: 'Error fetching user photos' });
  }
});

// Serve local photos
router.get('/file/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(PHOTOS_DIR, filename);
  
  console.log('Attempting to serve file:', {
    filename,
    filePath,
    exists: fs.existsSync(filePath)
  });

  // Check if the file exists before sending
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    console.error('File not found:', filePath);
    res.status(404).json({ error: 'Photo not found' });
  }
});

// Get a single photo by ID with its tags and user information
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
      include: {
        tags: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    res.json(photo);
  } catch (error) {
    console.error('Error fetching photo:', error);
    res.status(500).json({ error: 'Error fetching photo' });
  }
});

// Add tag to photo
router.post('/:photoId/tags', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { tag } = req.body;

    if (!tag || typeof tag !== 'string') {
      return res.status(400).json({ error: 'Invalid tag' });
    }

    const photo = await prisma.photo.update({
      where: { id: parseInt(photoId) },
      data: {
        tags: {
          connectOrCreate: {
            where: { name: tag },
            create: { name: tag }
          }
        }
      },
      include: {
        tags: true
      }
    });

    res.json({ tags: photo.tags.map(t => t.name) });
  } catch (error) {
    console.error('Error adding tag:', error);
    res.status(500).json({ error: 'Failed to add tag' });
  }
});

// Remove tag from photo
router.delete('/:photoId/tags', async (req: Request, res: Response) => {
  try {
    const { photoId } = req.params;
    const { tag } = req.body;

    if (!tag || typeof tag !== 'string') {
      return res.status(400).json({ error: 'Invalid tag' });
    }

    const photo = await prisma.photo.update({
      where: { id: parseInt(photoId) },
      data: {
        tags: {
          disconnect: {
            name: tag
          }
        }
      },
      include: {
        tags: true
      }
    });

    res.json({ tags: photo.tags.map(t => t.name) });
  } catch (error) {
    console.error('Error removing tag:', error);
    res.status(500).json({ error: 'Failed to remove tag' });
  }
});

// Delete a photo
router.delete('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Find the photo first to check ownership
    const photo = await prisma.photo.findUnique({
      where: { id: parseInt(id) },
      select: { userId: true, filename: true }
    });

    if (!photo) {
      return res.status(404).json({ error: 'Photo not found' });
    }

    // Check if the user owns the photo
    if (photo.userId !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this photo' });
    }

    // Delete the file from storage
    const filePath = path.join(PHOTOS_DIR, photo.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // Delete the photo record from the database
    await prisma.photo.delete({
      where: { id: parseInt(id) }
    });

    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Error deleting photo:', error);
    res.status(500).json({ error: 'Failed to delete photo' });
  }
});

export default router; 