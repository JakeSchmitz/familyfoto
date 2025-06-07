import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

// Temporary photo storage implementation
const PHOTOS_DIR = process.env.PHOTOS_DIR || path.join(__dirname, '../../uploads');

// New endpoint to get all unique tags
router.get('/tags', async (req: Request, res: Response) => {
  try {
    const tags = await prisma.tag.findMany({
      distinct: ['name'],
      select: {
        name: true
      }
    });
    res.json(tags);
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ error: 'Failed to fetch tags' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { tags } = req.query;
    let whereClause: any = {};

    if (tags) {
      const tagNames = Array.isArray(tags) ? tags : [tags];
      whereClause = {
        tags: {
          some: {
            name: {
              in: tagNames as string[],
              mode: 'insensitive'
            }
          }
        }
      };
    }

    // Get all photos from the database with their tags
    const photos = await prisma.photo.findMany({
      where: whereClause,
      include: {
        tags: true
      }
    });

    // Map the database results to the expected format
    const formattedPhotos = photos.map(photo => ({
      id: photo.id.toString(),
      url: `/api/photos/${photo.filename}`,
      name: photo.originalName,
      description: photo.description || '',
      tags: photo.tags.map(tag => tag.name)
    }));
    
    res.json(formattedPhotos);
  } catch (error) {
    console.error('Error reading photos:', error);
    res.status(500).json({ error: 'Failed to read photos' });
  }
});

router.get('/:filename', async (req: Request, res: Response) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(PHOTOS_DIR, filename);
    
    // Check if file exists
    await fs.access(filePath);
    
    res.sendFile(filePath);
  } catch (error) {
    console.error('Error serving photo:', error);
    res.status(404).json({ error: 'Photo not found' });
  }
});

export const photosRouter = router; 