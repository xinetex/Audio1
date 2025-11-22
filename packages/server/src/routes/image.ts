import { Router } from 'express';
import { generateImage } from '../services/imageGeneration.js';
import { generateRetroDiffusion } from '../services/retroDiffusion.js';
import type { GenerateImageRequest, GenerateImageResponse } from '@audiovisual-art-tool/shared';

const router = Router();

router.post('/generate', async (req, res) => {
  try {
    const request: GenerateImageRequest = req.body;
    const { model, prompt, style } = request;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    let response: GenerateImageResponse;
    
    // Route to appropriate AI service based on model parameter
    if (model === 'retro-diffusion' || style?.includes('pixel') || style?.includes('8bit') || style?.includes('16bit')) {
      // Use Retro Diffusion for pixel art
      console.log('🎮 Using Retro Diffusion for pixel art generation');
      const result = await generateRetroDiffusion({
        prompt,
        style,
        width: 256,
        height: 256
      });
      response = {
        imageUrl: `http://localhost:${process.env.PORT || 3001}${result.imageUrl}`,
        prompt: result.prompt
      };
    } else {
      // Use default Replicate for general images
      console.log('🎨 Using Replicate for general image generation');
      response = await generateImage(request);
    }
    
    res.json(response);
  } catch (error) {
    console.error('Image generation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate image',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export { router as imageRouter };
