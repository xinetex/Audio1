-- ThunderVerse Platform Database Schema
-- Neon PostgreSQL

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  wallet_address VARCHAR(255),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  total_score BIGINT DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  tokens_balance DECIMAL(18, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Linked social accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- twitter, discord, facebook, wallet
  provider_id VARCHAR(255) NOT NULL,
  provider_username VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  metadata JSONB DEFAULT '{}'::jsonb,
  linked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  duration INTEGER, -- seconds
  rank INTEGER,
  xp_earned INTEGER DEFAULT 0,
  tokens_earned DECIMAL(18, 8) DEFAULT 0,
  platform VARCHAR(50), -- web, twitter, discord, facebook
  referrer VARCHAR(255),
  metadata JSONB DEFAULT '{}'::jsonb,
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active' -- active, completed, abandoned
);

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  game_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  rank INTEGER NOT NULL,
  total_score BIGINT NOT NULL,
  games_played INTEGER DEFAULT 0,
  win_rate DECIMAL(5, 2) DEFAULT 0,
  best_score INTEGER,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_type, period, user_id)
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  game_type VARCHAR(50) NOT NULL,
  entry_fee DECIMAL(18, 8) DEFAULT 0,
  prize_pool DECIMAL(18, 8) DEFAULT 0,
  max_players INTEGER,
  current_players INTEGER DEFAULT 0,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed, cancelled
  sponsor_name VARCHAR(255),
  sponsor_logo_url TEXT,
  distribution JSONB, -- Prize distribution percentages
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament entries
CREATE TABLE tournament_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  best_score INTEGER DEFAULT 0,
  games_played INTEGER DEFAULT 0,
  final_rank INTEGER,
  prize_won DECIMAL(18, 8) DEFAULT 0,
  prize_claimed BOOLEAN DEFAULT false,
  entered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- deposit, withdraw, reward, prize, fee
  amount DECIMAL(18, 8) NOT NULL,
  token_symbol VARCHAR(10) DEFAULT 'THUNDER',
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Achievements
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  achievement_type VARCHAR(50) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  icon_url TEXT,
  xp_reward INTEGER DEFAULT 0,
  token_reward DECIMAL(18, 8) DEFAULT 0,
  unlocked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, achievement_type)
);

-- Referrals
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id UUID REFERENCES users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES users(id) ON DELETE CASCADE,
  platform VARCHAR(50), -- twitter, discord, etc
  reward_claimed BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(referred_id)
);

-- Performance indexes
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider, provider_id);
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_game_sessions_token ON game_sessions(session_token);
CREATE INDEX idx_game_sessions_status ON game_sessions(status, started_at);
CREATE INDEX idx_leaderboards_game_period ON leaderboards(game_type, period, rank);
CREATE INDEX idx_tournaments_status ON tournaments(status, start_time);
CREATE INDEX idx_tournament_entries_tournament ON tournament_entries(tournament_id);
CREATE INDEX idx_wallet_transactions_user ON wallet_transactions(user_id, created_at);

-- Views for common queries
CREATE VIEW active_tournaments AS
SELECT * FROM tournaments
WHERE status = 'active' AND NOW() BETWEEN start_time AND end_time;

CREATE VIEW daily_leaderboard AS
SELECT u.username, u.avatar_url, l.rank, l.total_score, l.games_played
FROM leaderboards l
JOIN users u ON l.user_id = u.id
WHERE l.period = 'daily' AND l.game_type = 'pacman'
ORDER BY l.rank
LIMIT 100;

-- Trigger to update user stats
CREATE OR REPLACE FUNCTION update_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE users
  SET 
    total_score = total_score + NEW.score,
    games_played = games_played + 1,
    xp = xp + NEW.xp_earned,
    tokens_balance = tokens_balance + NEW.tokens_earned,
    last_login = NOW()
  WHERE id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER game_session_completed
AFTER UPDATE ON game_sessions
FOR EACH ROW
WHEN (OLD.status = 'active' AND NEW.status = 'completed')
EXECUTE FUNCTION update_user_stats();

-- Function to calculate rank
CREATE OR REPLACE FUNCTION calculate_rank(game VARCHAR, period VARCHAR)
RETURNS VOID AS $$
BEGIN
  WITH ranked AS (
    SELECT 
      user_id,
      ROW_NUMBER() OVER (ORDER BY total_score DESC) as new_rank
    FROM leaderboards
    WHERE game_type = game AND period = period
  )
  UPDATE leaderboards l
  SET rank = r.new_rank
  FROM ranked r
  WHERE l.user_id = r.user_id
    AND l.game_type = game
    AND l.period = period;
END;
$$ LANGUAGE plpgsql;
