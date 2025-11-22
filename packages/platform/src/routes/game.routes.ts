/**
 * Game Session API Routes
 */

import { Router } from 'express';
import { 
  startGameSession, 
  endGameSession, 
  getSessionByToken, 
  getUserSessions,
  updateLeaderboard 
} from '../services/game.service.js';

const router = Router();

/**
 * POST /api/game/session/start
 * Start a new game session
 */
router.post('/session/start', async (req, res) => {
  try {
    const { user_id, game_type, platform, referrer } = req.body;

    if (!game_type) {
      return res.status(400).json({ error: 'game_type is required' });
    }

    const session = await startGameSession({
      user_id,
      game_type,
      platform,
      referrer
    });

    res.json(session);
  } catch (error) {
    console.error('Start session error:', error);
    res.status(500).json({ error: 'Failed to start session' });
  }
});

/**
 * POST /api/game/session/end
 * End a game session and record score
 */
router.post('/session/end', async (req, res) => {
  try {
    const { session_token, score, duration } = req.body;

    if (!session_token || score === undefined || !duration) {
      return res.status(400).json({ 
        error: 'session_token, score, and duration are required' 
      });
    }

    const session = await endGameSession({
      session_token,
      score,
      duration
    });

    // Update leaderboard if user is logged in
    if (session.user_id) {
      await updateLeaderboard(session.user_id, session.game_type, score);
    }

    res.json(session);
  } catch (error: any) {
    console.error('End session error:', error);
    res.status(error.message.includes('not found') ? 404 : 500).json({ 
      error: error.message || 'Failed to end session' 
    });
  }
});

/**
 * GET /api/game/session/:token
 * Get session details
 */
router.get('/session/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const session = await getSessionByToken(token);

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    res.json(session);
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to get session' });
  }
});

/**
 * GET /api/game/sessions/user/:userId
 * Get user's recent sessions
 */
router.get('/sessions/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const limit = parseInt(req.query.limit as string) || 10;

    const sessions = await getUserSessions(userId, limit);
    res.json(sessions);
  } catch (error) {
    console.error('Get user sessions error:', error);
    res.status(500).json({ error: 'Failed to get sessions' });
  }
});

export default router;
