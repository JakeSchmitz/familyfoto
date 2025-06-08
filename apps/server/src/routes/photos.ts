import { Router } from 'express';
import { Request, Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import path from 'path';
import fs from 'fs';

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

// Serve local photos if gcsUrl is not present
router.get('/:filename', async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(PHOTOS_DIR, filename);

  // Check if the file exists before sending
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).json({ error: 'Photo not found' });
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

export default router; 