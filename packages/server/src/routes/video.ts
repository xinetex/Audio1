import { Router } from 'express';
import { composeVideo } from '../services/videoComposition.js';
import type { ComposeVideoRequest, ComposeVideoResponse } from '@audiovisual-art-tool/shared';

const router = Router();

router.post('/compose', async (req, res) => {
  try {
    const request: ComposeVideoRequest = req.body;
    
    if (!request.audioFile || !request.keyFrames || request.keyFrames.length === 0) {
      return res.status(400).json({ 
        error: 'Audio file and keyframes are required' 
      });
    }

    const response: ComposeVideoResponse = await composeVideo(request);
    res.json(response);
  } catch (error) {
    console.error('Video composition error:', error);
    res.status(500).json({ error: 'Failed to compose video' });
  }
});

export { router as videoRouter };
