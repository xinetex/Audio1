import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { audioRouter } from './routes/audio.js';
import { imageRouter } from './routes/image.js';
import { videoRouter } from './routes/video.js';
import { projectRouter } from './routes/project.js';
import { spriteVideoRouter } from './routes/spriteVideo.js';
import { visualizerRouter } from './routes/visualizer.js';
import { setupStorage } from './utils/storage.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Setup storage directories
setupStorage();

// Serve output images with CORS headers
app.use('/outputs/images', express.static('outputs/images', {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Serve output videos with CORS headers
app.use('/outputs/videos', express.static('outputs/videos', {
  setHeaders: (res) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
  }
}));

// Routes
app.use('/api/audio', audioRouter);
app.use('/api/image', imageRouter);
app.use('/api/video', videoRouter);
app.use('/api/project', projectRouter);
app.use('/api/sprite-video', spriteVideoRouter);
app.use('/api/visualizer', visualizerRouter);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
