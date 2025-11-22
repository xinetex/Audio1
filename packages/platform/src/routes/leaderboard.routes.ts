/**
 * Leaderboard API Routes
 */

import { Router } from 'express';
import { getLeaderboard } from '../services/game.service.js';

const router = Router();

/**
 * GET /api/leaderboard/:gameType
 * Get leaderboard for a game type and period
 */
router.get('/:gameType', async (req, res) => {
  try {
    const { gameType } = req.params;
    const period = (req.query.period as string) || 'all_time';
    const limit = parseInt(req.query.limit as string) || 100;

    const validPeriods = ['daily', 'weekly', 'monthly', 'all_time'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        error: 'Invalid period. Must be one of: daily, weekly, monthly, all_time' 
      });
    }

    const leaderboard = await getLeaderboard(
      gameType,
      period as 'daily' | 'weekly' | 'monthly' | 'all_time',
      limit
    );

    res.json({
      game_type: gameType,
      period,
      total_entries: leaderboard.length,
      entries: leaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ error: 'Failed to get leaderboard' });
  }
});

/**
 * GET /api/leaderboard/:gameType/user/:userId
 * Get user's rank in a specific leaderboard
 */
router.get('/:gameType/user/:userId', async (req, res) => {
  try {
    const { gameType, userId } = req.params;
    const period = (req.query.period as string) || 'all_time';

    const validPeriods = ['daily', 'weekly', 'monthly', 'all_time'];
    if (!validPeriods.includes(period)) {
      return res.status(400).json({ 
        error: 'Invalid period. Must be one of: daily, weekly, monthly, all_time' 
      });
    }

    // Get full leaderboard and find user
    const leaderboard = await getLeaderboard(
      gameType,
      period as 'daily' | 'weekly' | 'monthly' | 'all_time',
      1000 // Get more entries to find user
    );

    const userEntry = leaderboard.find((entry: any) => entry.user_id === userId);

    if (!userEntry) {
      return res.status(404).json({ 
        error: 'User not found in leaderboard',
        game_type: gameType,
        period
      });
    }

    res.json({
      game_type: gameType,
      period,
      ...userEntry
    });
  } catch (error) {
    console.error('Get user rank error:', error);
    res.status(500).json({ error: 'Failed to get user rank' });
  }
});

export default router;
