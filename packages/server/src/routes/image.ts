import { Router } from 'express';
import { generateImage } from '../services/imageGeneration.js';
import type { GenerateImageRequest, GenerateImageResponse } from '@audiovisual-art-tool/shared';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const request: GenerateImageRequest = req.body;
    
    if (!request.prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    const response: GenerateImageResponse = await generateImage(request);
    res.json(response);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

export { router as imageRouter };
