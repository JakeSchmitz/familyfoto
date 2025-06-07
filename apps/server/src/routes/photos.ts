import { Router } from 'express';
import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs/promises';

const router = Router();

// Temporary photo storage implementation
const PHOTOS_DIR = process.env.PHOTOS_DIR || path.join(__dirname, '../../photos');

router.get('/', async (req: Request, res: Response) => {
  try {
    const files = await fs.readdir(PHOTOS_DIR);
    const photos = files
      .filter(file => /\.(jpg|jpeg|png|gif)$/i.test(file))
      .map(file => ({
        id: file,
        url: `/api/photos/${file}`,
        name: file
      }));
    
    res.json(photos);
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