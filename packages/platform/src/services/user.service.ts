/**
 * User Service
 * Handles user creation, social account linking, profile management
 */

import { sql } from '../database/connection.js';

export interface User {
  id: string;
  username: string;
  email?: string;
  avatar_url?: string;
  wallet_address?: string;
  level: number;
  xp: number;
  total_score: number;
  games_played: number;
  wins: number;
  tokens_balance: string;
  created_at: Date;
  last_login: Date;
}

export interface SocialAccount {
  id: string;
  user_id: string;
  provider: 'twitter' | 'discord' | 'facebook' | 'wallet';
  provider_id: string;
  provider_username?: string;
  linked_at: Date;
}

export interface CreateUserParams {
  username: string;
  email?: string;
  avatar_url?: string;
  wallet_address?: string;
}

export interface LinkSocialAccountParams {
  user_id: string;
  provider: 'twitter' | 'discord' | 'facebook' | 'wallet';
  provider_id: string;
  provider_username?: string;
  access_token?: string;
  refresh_token?: string;
  metadata?: any;
}

/**
 * Create a new user
 */
export async function createUser(params: CreateUserParams): Promise<User> {
  const result = await sql`
    INSERT INTO users (username, email, avatar_url, wallet_address)
    VALUES (${params.username}, ${params.email}, ${params.avatar_url}, ${params.wallet_address})
    RETURNING *
  `;
  return result[0] as User;
}

/**
 * Get user by ID
 */
export async function getUserById(userId: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE id = ${userId}
  `;
  return result[0] as User || null;
}

/**
 * Get user by username
 */
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE username = ${username}
  `;
  return result[0] as User || null;
}

/**
 * Get user by wallet address
 */
export async function getUserByWallet(walletAddress: string): Promise<User | null> {
  const result = await sql`
    SELECT * FROM users WHERE wallet_address = ${walletAddress}
  `;
  return result[0] as User || null;
}

/**
 * Get user by social account (Twitter, Discord, etc.)
 */
export async function getUserBySocialAccount(
  provider: string,
  providerId: string
): Promise<User | null> {
  const result = await sql`
    SELECT u.* FROM users u
    JOIN social_accounts sa ON u.id = sa.user_id
    WHERE sa.provider = ${provider} AND sa.provider_id = ${providerId}
  `;
  return result[0] as User || null;
}

/**
 * Link social account to user
 */
export async function linkSocialAccount(params: LinkSocialAccountParams): Promise<SocialAccount> {
  const result = await sql`
    INSERT INTO social_accounts (
      user_id, provider, provider_id, provider_username,
      access_token, refresh_token, metadata
    )
    VALUES (
      ${params.user_id}, ${params.provider}, ${params.provider_id},
      ${params.provider_username}, ${params.access_token},
      ${params.refresh_token}, ${JSON.stringify(params.metadata || {})}
    )
    ON CONFLICT (provider, provider_id) 
    DO UPDATE SET
      access_token = EXCLUDED.access_token,
      refresh_token = EXCLUDED.refresh_token,
      metadata = EXCLUDED.metadata
    RETURNING *
  `;
  return result[0] as SocialAccount;
}

/**
 * Get all linked social accounts for a user
 */
export async function getUserSocialAccounts(userId: string): Promise<SocialAccount[]> {
  const result = await sql`
    SELECT id, user_id, provider, provider_id, provider_username, linked_at
    FROM social_accounts
    WHERE user_id = ${userId}
  `;
  return result as SocialAccount[];
}

/**
 * Find or create user from social login
 */
export async function findOrCreateUserFromSocial(
  provider: string,
  providerId: string,
  profile: {
    username: string;
    email?: string;
    avatar_url?: string;
    access_token?: string;
    refresh_token?: string;
  }
): Promise<User> {
  // Try to find existing user
  let user = await getUserBySocialAccount(provider, providerId);

  if (user) {
    // Update last login
    await sql`UPDATE users SET last_login = NOW() WHERE id = ${user.id}`;
    
    // Update tokens
    await linkSocialAccount({
      user_id: user.id,
      provider: provider as any,
      provider_id: providerId,
      provider_username: profile.username,
      access_token: profile.access_token,
      refresh_token: profile.refresh_token,
    });

    return user;
  }

  // Create new user
  user = await createUser({
    username: profile.username,
    email: profile.email,
    avatar_url: profile.avatar_url,
  });

  // Link social account
  await linkSocialAccount({
    user_id: user.id,
    provider: provider as any,
    provider_id: providerId,
    provider_username: profile.username,
    access_token: profile.access_token,
    refresh_token: profile.refresh_token,
  });

  return user;
}

/**
 * Update user profile
 */
export async function updateUser(
  userId: string,
  updates: Partial<CreateUserParams>
): Promise<User> {
  const setClauses: string[] = [];
  const values: any[] = [];
  let paramIndex = 1;

  if (updates.username) {
    setClauses.push(`username = $${paramIndex++}`);
    values.push(updates.username);
  }
  if (updates.email !== undefined) {
    setClauses.push(`email = $${paramIndex++}`);
    values.push(updates.email);
  }
  if (updates.avatar_url !== undefined) {
    setClauses.push(`avatar_url = $${paramIndex++}`);
    values.push(updates.avatar_url);
  }
  if (updates.wallet_address !== undefined) {
    setClauses.push(`wallet_address = $${paramIndex++}`);
    values.push(updates.wallet_address);
  }

  values.push(userId);

  const result = await sql.neon(
    `UPDATE users SET ${setClauses.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    values
  );

  return result[0] as User;
}

/**
 * Add XP to user and level up if needed
 */
export async function addXP(userId: string, xp: number): Promise<{ leveledUp: boolean; newLevel: number }> {
  const user = await getUserById(userId);
  if (!user) throw new Error('User not found');

  const newXP = user.xp + xp;
  const newLevel = Math.floor(newXP / 1000) + 1; // 1000 XP per level
  const leveledUp = newLevel > user.level;

  await sql`
    UPDATE users 
    SET xp = ${newXP}, level = ${newLevel}
    WHERE id = ${userId}
  `;

  return { leveledUp, newLevel };
}

/**
 * Add tokens to user balance
 */
export async function addTokens(userId: string, amount: number): Promise<void> {
  await sql`
    UPDATE users 
    SET tokens_balance = tokens_balance + ${amount}
    WHERE id = ${userId}
  `;
}

/**
 * Get user stats
 */
export async function getUserStats(userId: string) {
  const [user] = await sql`
    SELECT 
      u.id, u.username, u.avatar_url, u.level, u.xp,
      u.total_score, u.games_played, u.wins, u.tokens_balance,
      COALESCE(l.rank, 0) as global_rank
    FROM users u
    LEFT JOIN leaderboards l ON u.id = l.user_id 
      AND l.game_type = 'pacman' AND l.period = 'all_time'
    WHERE u.id = ${userId}
  `;

  return user;
}
