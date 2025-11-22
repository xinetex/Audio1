/**
 * ThunderVerse Platform API Gateway
 * Express server with all platform routes
 */

import express from 'express';
import cors from 'cors';
import { startDiscordBot } from './bots/discord.bot.js';
import gameRoutes from './routes/game.routes.js';
import leaderboardRoutes from './routes/leaderboard.routes.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'thunderverse-platform' });
});

// API Routes
app.use('/api/game', gameRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 ThunderVerse Platform API running on port ${PORT}`);
  
  // Start Discord bot if configured
  if (process.env.DISCORD_BOT_TOKEN && process.env.DISCORD_CLIENT_ID) {
    try {
      await startDiscordBot();
    } catch (error) {
      console.error('❌ Failed to start Discord bot:', error);
    }
  } else {
    console.warn('⚠️ Discord bot not started - missing DISCORD_BOT_TOKEN or DISCORD_CLIENT_ID');
  }
});

export default app;
