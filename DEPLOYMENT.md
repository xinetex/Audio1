# ThunderVerse Deployment Guide

## Prerequisites

1. **Vercel Project**: `prj_jvAVN2WI4cBZuuICfWYnDQwqhvqH`
2. **Neon PostgreSQL**: Already connected to Vercel project
3. **Discord Bot**: Create at https://discord.com/developers/applications
4. **GitHub Repo**: xinetex/Audio1

## Step 1: Database Migration

The Neon database is already connected. Run migration to create tables:

```bash
cd packages/platform
pnpm db:migrate
```

This will:
- Create all 9 tables (users, social_accounts, game_sessions, leaderboards, etc.)
- Set up indexes and constraints
- Create triggers and stored procedures
- Enable UUID extension

## Step 2: Environment Variables

Set these in Vercel project settings (Settings → Environment Variables):

### Required (Core Functionality)
```
DATABASE_URL=<from_neon_dashboard>
GAME_URL=https://thunderverse.app
PORT=3002
NODE_ENV=production
```

### Discord Bot (High Priority)
```
DISCORD_BOT_TOKEN=<from_discord_developer_portal>
DISCORD_CLIENT_ID=<from_discord_developer_portal>
DISCORD_CLIENT_SECRET=<from_discord_developer_portal>
DISCORD_REDIRECT_URI=https://thunderverse.app/auth/discord/callback
```

### Optional (Future Features)
```
TWITTER_API_KEY=<optional>
TWITTER_API_SECRET=<optional>
FACEBOOK_APP_ID=<optional>
FACEBOOK_APP_SECRET=<optional>
REDIS_URL=<optional_for_caching>
```

## Step 3: Discord Bot Setup

1. Go to https://discord.com/developers/applications
2. Create new application "ThunderVerse Bot"
3. Go to Bot section → Reset Token → Copy token
4. Enable these intents:
   - Guilds
   - Guild Messages (if needed)
5. Go to OAuth2 → URL Generator
6. Select scopes: `bot`, `applications.commands`
7. Select permissions: `Send Messages`, `Use Slash Commands`
8. Copy generated URL and invite bot to your test server

### Register Slash Commands

Commands auto-register on bot startup. Available commands:
- `/play` - Start a game session
- `/stats` - View player stats
- `/leaderboard` - View leaderboards
- `/tournament` - View tournaments
- `/wallet` - Check token balance
- `/invite` - Get referral link

## Step 4: Test Locally

```bash
# Install dependencies
pnpm install

# Set up environment
cp packages/platform/.env.example packages/platform/.env
# Edit .env with your values

# Run migration
cd packages/platform
pnpm db:migrate

# Start platform API
pnpm dev
```

API will run on port 3002 with Discord bot active.

## Step 5: Deploy to Vercel

```bash
# Commit and push
git add .
git commit -m "Deploy ThunderVerse platform"
git push origin main
```

Vercel will automatically deploy. The deployment includes:
- Platform API (Express server)
- Discord bot (runs alongside API)
- Game session tracking
- Leaderboard system
- User management

## Step 6: Verify Deployment

### Check API Health
```bash
curl https://thunderverse.app/health
# Should return: {"status":"ok","service":"thunderverse-platform"}
```

### Test Discord Bot
1. Go to your Discord server
2. Type `/play` and select a game
3. Bot should respond with game link and session token

### Test Game Session
```bash
# Start session
curl -X POST https://thunderverse.app/api/game/session/start \
  -H "Content-Type: application/json" \
  -d '{"game_type":"pacman","platform":"web"}'

# End session
curl -X POST https://thunderverse.app/api/game/session/end \
  -H "Content-Type: application/json" \
  -d '{"session_token":"<token>","score":1000,"duration":120}'
```

### Test Leaderboard
```bash
curl https://thunderverse.app/api/leaderboard/pacman?period=all_time
```

## Architecture Overview

### Database Schema (Neon PostgreSQL)
- `users` - Player accounts
- `social_accounts` - OAuth connections (Discord, Twitter, etc.)
- `game_sessions` - Game plays with scores
- `leaderboards` - Rankings by game/period
- `tournaments` - Competitive events
- `tournament_entries` - Tournament participation
- `wallet_transactions` - Token transfers
- `achievements` - Player achievements
- `referrals` - Referral tracking

### API Endpoints

**Game Sessions**
- `POST /api/game/session/start` - Start new session
- `POST /api/game/session/end` - End session & record score
- `GET /api/game/session/:token` - Get session details
- `GET /api/game/sessions/user/:userId` - User's recent sessions

**Leaderboards**
- `GET /api/leaderboard/:gameType?period=<daily|weekly|monthly|all_time>`
- `GET /api/leaderboard/:gameType/user/:userId?period=<period>`

### Discord Bot Commands
- `/play <game>` - Launch game with session tracking
- `/stats` - View XP, level, tokens, win rate
- `/leaderboard <game> <period>` - Top 10 players
- `/tournament` - View active tournaments
- `/wallet` - Token balance & wallet address
- `/invite` - Referral link for rewards

### Reward System
- **XP**: 1 XP per 100 points scored (1000 XP per level)
- **Tokens**: 1 token per 1000 points scored
- **Speed Bonus**: 20% bonus for games under 5 minutes
- **Minimum Rewards**: 10 XP, 0.1 tokens per game
- **Referral Bonus**: 100 tokens per signup, 10% of friend earnings

## Monitoring

### Vercel Logs
View logs in Vercel dashboard:
- Function logs for API requests
- Build logs for deployment issues
- Runtime logs for errors

### Discord Bot Status
Bot logs will show in Vercel function logs:
- `🤖 Discord bot ready as <BotName>#1234` - Success
- `❌ Failed to start Discord bot` - Check token/permissions

### Database Monitoring
Neon dashboard shows:
- Active connections
- Query performance
- Storage usage
- Connection pool stats

## Troubleshooting

### Bot Not Responding
1. Check `DISCORD_BOT_TOKEN` in Vercel env vars
2. Verify bot is invited to server with slash command permissions
3. Check Vercel function logs for errors

### Database Connection Errors
1. Verify `DATABASE_URL` in Vercel env vars
2. Check Neon dashboard for connection limits
3. Ensure IP allowlist includes Vercel's IPs (should be public by default)

### Session Tracking Issues
1. Verify database migration completed successfully
2. Check for errors in Vercel function logs
3. Test with curl commands above

### Leaderboard Not Updating
1. Ensure game session ended successfully
2. Check `calculate_rank()` stored procedure exists
3. Verify triggers are active in database

## Next Steps

### Phase 1: MVP (Week 1)
- [x] Database schema
- [x] User management
- [x] Game session tracking
- [x] Discord bot with slash commands
- [x] Leaderboard system
- [ ] Deploy to production
- [ ] Test with real users

### Phase 2: Social Integration (Week 2)
- [ ] Twitter bot for mentions
- [ ] Twitter OAuth for web login
- [ ] Facebook Canvas app
- [ ] Instagram integration
- [ ] Referral tracking

### Phase 3: Tournaments (Week 3)
- [ ] Tournament creation API
- [ ] Entry fees & prize pools
- [ ] Automated payouts
- [ ] Tournament leaderboards
- [ ] Discord tournament announcements

### Phase 4: Web3 (Week 4)
- [ ] MetaMask wallet connect
- [ ] Phantom wallet (Solana)
- [ ] Token withdrawals
- [ ] On-chain leaderboards
- [ ] NFT achievements

## Support

For issues:
1. Check Vercel deployment logs
2. Verify environment variables
3. Test API endpoints with curl
4. Check Discord bot permissions
5. Review Neon database connection

---

**Deployed Project**: prj_jvAVN2WI4cBZuuICfWYnDQwqhvqH  
**Domain**: thunderverse.app (configure in Vercel)  
**GitHub**: xinetex/Audio1  
**Database**: Neon PostgreSQL (connected)
