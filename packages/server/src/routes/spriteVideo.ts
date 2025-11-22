import express from 'express';
import { generateSpriteVideo, createGameTrailer, type SpriteVideoRequest } from '../services/spriteVideo.js';

export const spriteVideoRouter = express.Router();

/**
 * POST /api/sprite-video/generate
 * Generate video from sprite animation frames
 */
spriteVideoRouter.post('/generate', async (req, res) => {
  try {
    const request: SpriteVideoRequest = req.body;
    const result = await generateSpriteVideo(request);
    res.json(result);
  } catch (error) {
    console.error('Sprite video generation error:', error);
    res.status(500).json({
      error: 'Failed to generate sprite video',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/sprite-video/trailer
 * Generate game trailer from sprites (simplified API)
 */
spriteVideoRouter.post('/trailer', async (req, res) => {
  try {
    const { sprites, settings } = req.body;
    
    if (!sprites || !sprites.player || !sprites.ghosts) {
      return res.status(400).json({ error: 'Missing sprites (player, ghosts required)' });
    }
    
    const result = await createGameTrailer(sprites, {
      width: settings?.width || 1280,
      height: settings?.height || 720,
      duration: settings?.duration || 5,
      audioFile: settings?.audioFile
    });
    
    res.json(result);
  } catch (error) {
    console.error('Trailer generation error:', error);
    res.status(500).json({
      error: 'Failed to generate trailer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
