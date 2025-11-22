/**
 * Game Session Service
 * Tracks game sessions, scores, rewards
 */

import { sql } from '../database/connection.js';
import { addXP, addTokens } from './user.service.js';
import { v4 as uuidv4 } from 'uuid';

export interface GameSession {
  id: string;
  user_id: string | null;
  session_token: string;
  game_type: string;
  score: number;
  duration: number | null;
  rank: number | null;
  xp_earned: number;
  tokens_earned: string;
  platform: string | null;
  referrer: string | null;
  started_at: Date;
  ended_at: Date | null;
  status: 'active' | 'completed' | 'abandoned';
}

export interface StartSessionParams {
  user_id?: string;
  game_type: string;
  platform?: string;
  referrer?: string;
}

export interface EndSessionParams {
  session_token: string;
  score: number;
  duration: number;
}

/**
 * Start a new game session
 */
export async function startGameSession(params: StartSessionParams): Promise<GameSession> {
  const sessionToken = uuidv4();

  const result = await sql`
    INSERT INTO game_sessions (
      user_id, session_token, game_type, platform, referrer, status
    )
    VALUES (
      ${params.user_id || null}, ${sessionToken}, ${params.game_type},
      ${params.platform || null}, ${params.referrer || null}, 'active'
    )
    RETURNING *
  `;

  return result[0] as GameSession;
}

/**
 * End a game session and calculate rewards
 */
export async function endGameSession(params: EndSessionParams): Promise<GameSession> {
  // Get session
  const [session] = await sql`
    SELECT * FROM game_sessions WHERE session_token = ${params.session_token}
  `;

  if (!session) {
    throw new Error('Session not found');
  }

  if (session.status !== 'active') {
    throw new Error('Session already ended');
  }

  // Calculate rewards based on score
  const rewards = calculateRewards(params.score, params.duration);

  // Get rank
  const rank = await calculateRank(session.game_type, params.score);

  // Update session
  const result = await sql`
    UPDATE game_sessions
    SET 
      score = ${params.score},
      duration = ${params.duration},
      rank = ${rank},
      xp_earned = ${rewards.xp},
      tokens_earned = ${rewards.tokens},
      status = 'completed',
      ended_at = NOW()
    WHERE session_token = ${params.session_token}
    RETURNING *
  `;

  const updatedSession = result[0] as GameSession;

  // Award rewards to user
  if (session.user_id) {
    await addXP(session.user_id, rewards.xp);
    await addTokens(session.user_id, rewards.tokens);
  }

  return updatedSession;
}

/**
 * Get session by token
 */
export async function getSessionByToken(sessionToken: string): Promise<GameSession | null> {
  const result = await sql`
    SELECT * FROM game_sessions WHERE session_token = ${sessionToken}
  `;
  return result[0] as GameSession || null;
}

/**
 * Get user's recent sessions
 */
export async function getUserSessions(userId: string, limit: number = 10): Promise<GameSession[]> {
  const result = await sql`
    SELECT * FROM game_sessions
    WHERE user_id = ${userId}
    ORDER BY started_at DESC
    LIMIT ${limit}
  `;
  return result as GameSession[];
}

/**
 * Calculate rewards based on score and performance
 */
function calculateRewards(score: number, duration: number): { xp: number; tokens: number } {
  // Base rewards
  let xp = Math.floor(score / 100); // 1 XP per 100 points
  let tokens = Math.floor(score / 1000); // 1 token per 1000 points

  // Bonus for quick games (under 5 minutes)
  if (duration < 300) {
    xp = Math.floor(xp * 1.2);
    tokens = Math.floor(tokens * 1.2);
  }

  // Minimum rewards
  xp = Math.max(xp, 10);
  tokens = Math.max(tokens, 0.1);

  return { xp, tokens };
}

/**
 * Calculate rank for a score in a game type
 */
async function calculateRank(gameType: string, score: number): Promise<number> {
  const result = await sql`
    SELECT COUNT(*) + 1 as rank
    FROM leaderboards
    WHERE game_type = ${gameType}
      AND period = 'all_time'
      AND total_score > ${score}
  `;

  return parseInt(result[0].rank);
}

/**
 * Update leaderboard after session
 */
export async function updateLeaderboard(
  userId: string,
  gameType: string,
  score: number
): Promise<void> {
  const periods = ['daily', 'weekly', 'monthly', 'all_time'];

  for (const period of periods) {
    await sql`
      INSERT INTO leaderboards (game_type, period, user_id, total_score, games_played, best_score, rank)
      VALUES (${gameType}, ${period}, ${userId}, ${score}, 1, ${score}, 0)
      ON CONFLICT (game_type, period, user_id)
      DO UPDATE SET
        total_score = leaderboards.total_score + ${score},
        games_played = leaderboards.games_played + 1,
        best_score = GREATEST(leaderboards.best_score, ${score}),
        updated_at = NOW()
    `;
  }

  // Recalculate ranks
  for (const period of periods) {
    await sql`SELECT calculate_rank(${gameType}, ${period})`;
  }
}

/**
 * Get leaderboard
 */
export async function getLeaderboard(
  gameType: string,
  period: 'daily' | 'weekly' | 'monthly' | 'all_time',
  limit: number = 100
) {
  const result = await sql`
    SELECT 
      l.rank, l.total_score, l.games_played, l.best_score,
      u.id as user_id, u.username, u.avatar_url, u.level
    FROM leaderboards l
    JOIN users u ON l.user_id = u.id
    WHERE l.game_type = ${gameType} AND l.period = ${period}
    ORDER BY l.rank ASC
    LIMIT ${limit}
  `;

  return result;
}
