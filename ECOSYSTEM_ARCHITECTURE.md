# 🎮 ThunderVerse Social Gaming Ecosystem
## FanDuel-Style Multi-Platform Architecture

---

## 🎯 Vision

**Cross-platform gaming ecosystem where users can:**
- Register once via social auth (Twitter, Discord, Instagram, Facebook, Wallet)
- Play games across all platforms (web, mobile, social media embeds)
- Earn rewards, climb leaderboards, compete in tournaments
- Cash out winnings or trade NFT prizes
- Stream gameplay, share clips, build communities

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SOCIAL AUTH LAYER                         │
│  Twitter OAuth | Discord OAuth | FB Login | Wallet Connect   │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  IDENTITY AGGREGATION                        │
│         Unified User Profile (Neon PostgreSQL)               │
│   wallet_address | twitter_id | discord_id | fb_id          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                    GAME SERVICES                             │
│  Game Engine | Matchmaking | Tournaments | Leaderboards     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│               PLATFORM INTEGRATIONS                          │
│  Twitter Bots | Discord Bots | IG/FB Canvas | Web App       │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                  BLOCKCHAIN LAYER                            │
│  Wallet Auth | Token Rewards | NFT Prizes | Withdrawals     │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔐 Universal Authentication System

### Multi-Provider OAuth Strategy

**Supported Login Methods**:
1. **Twitter/X** - OAuth 2.0
2. **Discord** - OAuth 2.0
3. **Facebook** - Graph API
4. **Instagram** (via Facebook)
5. **Wallet Connect** - Web3 wallets (MetaMask, Phantom, etc.)
6. **Email/Password** - Traditional fallback

### Implementation with NextAuth.js

```typescript
// packages/auth/nextauth.config.ts
import NextAuth from "next-auth"
import TwitterProvider from "next-auth/providers/twitter"
import DiscordProvider from "next-auth/providers/discord"
import FacebookProvider from "next-auth/providers/facebook"
import CredentialsProvider from "next-auth/providers/credentials"
import { WalletConnectProvider } from "./wallet-provider"

export default NextAuth({
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID,
      clientSecret: process.env.TWITTER_CLIENT_SECRET,
      version: "2.0",
    }),
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
    }),
    FacebookProvider({
      clientId: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
    }),
    WalletConnectProvider({
      // Custom Web3 provider
      name: "Wallet",
      allowedChains: ["ethereum", "solana", "base"],
    }),
  ],
  
  callbacks: {
    async signIn({ user, account, profile }) {
      // Link social account to unified profile
      await linkSocialAccount(user.id, account.provider, profile.id)
      return true
    },
    
    async session({ session, token }) {
      // Inject user's linked accounts
      session.user.linkedAccounts = await getLinkedAccounts(token.sub)
      session.user.walletAddress = await getWalletAddress(token.sub)
      return session
    }
  },
  
  database: process.env.NEON_DATABASE_URL,
})
```

### Database Schema (Neon PostgreSQL)

```sql
-- Core user table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  avatar_url TEXT,
  wallet_address VARCHAR(255),
  level INTEGER DEFAULT 1,
  xp INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP DEFAULT NOW()
);

-- Linked social accounts
CREATE TABLE social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider VARCHAR(50) NOT NULL, -- twitter, discord, facebook, wallet
  provider_id VARCHAR(255) NOT NULL,
  display_name VARCHAR(255),
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMP,
  metadata JSONB, -- Store provider-specific data
  linked_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(provider, provider_id)
);

-- Game sessions
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  game_type VARCHAR(50) NOT NULL,
  score INTEGER DEFAULT 0,
  duration INTEGER, -- seconds
  rank INTEGER,
  xp_earned INTEGER DEFAULT 0,
  tokens_earned DECIMAL(18, 8) DEFAULT 0,
  metadata JSONB,
  played_at TIMESTAMP DEFAULT NOW()
);

-- Leaderboards
CREATE TABLE leaderboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_type VARCHAR(50) NOT NULL,
  period VARCHAR(20) NOT NULL, -- daily, weekly, monthly, all_time
  user_id UUID REFERENCES users(id),
  rank INTEGER,
  total_score BIGINT,
  games_played INTEGER,
  win_rate DECIMAL(5, 2),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(game_type, period, user_id)
);

-- Tournaments
CREATE TABLE tournaments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  game_type VARCHAR(50) NOT NULL,
  entry_fee DECIMAL(18, 8) DEFAULT 0,
  prize_pool DECIMAL(18, 8),
  max_players INTEGER,
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending', -- pending, active, completed
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Tournament entries
CREATE TABLE tournament_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id UUID REFERENCES tournaments(id),
  user_id UUID REFERENCES users(id),
  best_score INTEGER,
  final_rank INTEGER,
  prize_won DECIMAL(18, 8),
  entered_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  type VARCHAR(20) NOT NULL, -- deposit, withdraw, reward, prize
  amount DECIMAL(18, 8) NOT NULL,
  token_symbol VARCHAR(10),
  tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending', -- pending, confirmed, failed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_wallet ON users(wallet_address);
CREATE INDEX idx_social_accounts_user ON social_accounts(user_id);
CREATE INDEX idx_social_accounts_provider ON social_accounts(provider, provider_id);
CREATE INDEX idx_game_sessions_user ON game_sessions(user_id);
CREATE INDEX idx_leaderboards_game_period ON leaderboards(game_type, period, rank);
CREATE INDEX idx_tournaments_status ON tournaments(status, start_time);
```

---

## 🎮 Platform-Specific Integrations

### 1. Twitter/X Integration

**Features**:
- Tweet-to-play commands
- Bot responds with game links
- Share scores automatically
- Leaderboard tweets
- Tournament announcements

**Implementation**:

```typescript
// packages/integrations/twitter-bot.ts
import { TwitterApi } from 'twitter-api-v2';

export class ThunderVerseTwitterBot {
  private client: TwitterApi;

  constructor() {
    this.client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
      accessToken: process.env.TWITTER_ACCESS_TOKEN!,
      accessSecret: process.env.TWITTER_ACCESS_SECRET!,
    });
  }

  // Listen for mentions
  async startMentionListener() {
    const stream = await this.client.v2.searchStream({
      'tweet.fields': ['author_id', 'conversation_id'],
    });

    stream.on('data', async (tweet) => {
      if (tweet.data.text.includes('@ThunderVerseGame')) {
        await this.handleMention(tweet);
      }
    });
  }

  // Handle game commands
  async handleMention(tweet: any) {
    const text = tweet.data.text.toLowerCase();

    if (text.includes('play')) {
      await this.replyWithGameLink(tweet);
    } else if (text.includes('stats')) {
      await this.replyWithStats(tweet);
    } else if (text.includes('leaderboard')) {
      await this.replyWithLeaderboard(tweet);
    }
  }

  // Reply with game link
  async replyWithGameLink(tweet: any) {
    const gameUrl = `https://jettythunder.app/game?ref=twitter&user=${tweet.data.author_id}`;
    
    await this.client.v2.reply(
      `🎮 Ready to play? Click here: ${gameUrl}\n\n` +
      `Connect your wallet to earn rewards!\n` +
      `#ThunderVerse #Web3Gaming`,
      tweet.data.id
    );
  }

  // Auto-share game results
  async shareGameResult(userId: string, score: number, rank: number) {
    const user = await getUserByTwitterId(userId);
    
    await this.client.v2.tweet(
      `🏆 @${user.twitter_handle} just scored ${score.toLocaleString()} ` +
      `and ranked #${rank} on ThunderVerse!\n\n` +
      `Think you can beat them? 👉 https://jettythunder.app\n` +
      `#ThunderVerse #Gaming`
    );
  }
}
```

**Commands**:
- `@ThunderVerseGame play` → Get game link
- `@ThunderVerseGame stats` → View your stats
- `@ThunderVerseGame leaderboard` → Current rankings
- `@ThunderVerseGame tournament` → Join active tournament

---

### 2. Discord Integration

**Features**:
- Slash commands to play games
- Embed game in Discord canvas
- Server leaderboards
- Tournament channels
- Role rewards for top players

**Implementation**:

```typescript
// packages/integrations/discord-bot.ts
import { Client, GatewayIntentBits, SlashCommandBuilder } from 'discord.js';

export class ThunderVerseDiscordBot {
  private client: Client;

  constructor() {
    this.client = new Client({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
      ],
    });

    this.registerCommands();
  }

  registerCommands() {
    const commands = [
      new SlashCommandBuilder()
        .setName('play')
        .setDescription('Launch a ThunderVerse game')
        .addStringOption(option =>
          option.setName('game')
            .setDescription('Game to play')
            .setRequired(true)
            .addChoices(
              { name: 'Pac-Man', value: 'pacman' },
              { name: 'Snake', value: 'snake' },
              { name: 'Space Defender', value: 'space' }
            )
        ),

      new SlashCommandBuilder()
        .setName('stats')
        .setDescription('View your ThunderVerse stats'),

      new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('View server leaderboard'),

      new SlashCommandBuilder()
        .setName('tournament')
        .setDescription('Join the active tournament'),
    ];

    // Register commands with Discord API
    this.client.application?.commands.set(commands);
  }

  // Handle /play command
  async handlePlayCommand(interaction: any) {
    const gameType = interaction.options.getString('game');
    const userId = interaction.user.id;

    // Generate temporary game session
    const sessionToken = await createGameSession(userId, gameType);
    const gameUrl = `https://jettythunder.app/play?session=${sessionToken}`;

    await interaction.reply({
      content: `🎮 **${gameType.toUpperCase()} is ready!**`,
      embeds: [{
        title: 'Click to Play',
        url: gameUrl,
        description: 'Your game session is ready. Scores are saved automatically!',
        color: 0x7209b7,
        thumbnail: { url: 'https://jettythunder.app/logo.png' },
        fields: [
          { name: 'Rewards', value: 'Earn tokens for high scores!', inline: true },
          { name: 'Leaderboard', value: 'Compete with your server!', inline: true },
        ],
      }],
      components: [{
        type: 1,
        components: [{
          type: 2,
          style: 5, // Link button
          label: 'Launch Game',
          url: gameUrl,
        }],
      }],
    });
  }

  // Auto-post high scores
  async announceHighScore(guildId: string, user: any, score: number) {
    const guild = await this.client.guilds.fetch(guildId);
    const channel = guild.channels.cache.find(ch => ch.name === 'game-scores');

    if (channel && channel.isTextBased()) {
      await channel.send({
        embeds: [{
          title: '🏆 NEW HIGH SCORE!',
          description: `<@${user.id}> just scored **${score.toLocaleString()}**!`,
          color: 0xff006e,
          timestamp: new Date().toISOString(),
        }],
      });
    }
  }
}
```

---

### 3. Instagram/Facebook Integration

**Instagram Stories & Feed**:
- Playable game in story sticker
- AR filter with game overlay
- Swipe-up to full game

**Facebook Canvas Instant Games**:
- Full HTML5 game embedded in Facebook
- Native sharing, challenges
- Facebook login integration

**Implementation**:

```typescript
// packages/integrations/facebook-canvas.ts
export class FacebookCanvasGame {
  async initialize() {
    // Load Facebook SDK
    await this.loadFBSDK();
    
    // Initialize FB Instant Games API
    FBInstant.initializeAsync().then(() => {
      // Start loading assets
      this.loadAssets().then(() => {
        // Start the game
        FBInstant.startGameAsync().then(() => {
          this.startGame();
        });
      });
    });
  }

  // Share game result
  async shareResult(score: number) {
    await FBInstant.shareAsync({
      intent: 'SHARE',
      image: await this.captureGameScreenshot(),
      text: `I just scored ${score} on ThunderVerse! Can you beat me?`,
      data: { score }
    });
  }

  // Challenge friends
  async challengeFriend(friendId: string) {
    await FBInstant.updateAsync({
      action: 'CUSTOM',
      cta: 'Play Now',
      image: await this.getChallengeImage(),
      text: 'Beat my high score!',
      template: 'play_turn',
      data: { challengerId: FBInstant.player.getID() },
      strategy: 'IMMEDIATE',
      notification: 'PUSH',
    });
  }

  // Context-aware leaderboard
  async showContextLeaderboard() {
    const contextId = FBInstant.context.getID();
    const leaderboard = await getLeaderboardForContext(contextId);
    
    // Render leaderboard in game
    this.renderLeaderboard(leaderboard);
  }
}
```

---

## 💰 Monetization & Economy

### Token Economy

**ThunderCoin ($THUNDER)**:
- Play-to-earn rewards
- Tournament entry fees
- In-game purchases
- NFT prizes

**Reward Structure**:
```typescript
interface RewardTier {
  rank: number;
  tokensEarned: number;
  xpEarned: number;
  nftChance: number; // Probability of NFT drop
}

const REWARD_TIERS: RewardTier[] = [
  { rank: 1, tokensEarned: 100, xpEarned: 500, nftChance: 0.1 },   // 10% NFT
  { rank: 2, tokensEarned: 75, xpEarned: 350, nftChance: 0.05 },   // 5% NFT
  { rank: 3, tokensEarned: 50, xpEarned: 250, nftChance: 0.02 },   // 2% NFT
  // ... top 10 get rewards
];
```

### Tournament System

**Tournament Types**:
1. **Free Tournaments** - No entry, smaller prizes
2. **Paid Tournaments** - Entry fee, large prize pools
3. **Sponsored Tournaments** - Meme coin projects sponsor
4. **Community Tournaments** - Discord/Twitter exclusive

**Example Tournament Config**:
```typescript
{
  name: "DogeCoin Championship",
  entryFee: 10, // $THUNDER tokens
  prizePool: 10000,
  distribution: [50, 30, 10, 5, 3, 2], // % for top 6
  duration: "24h",
  maxPlayers: 1000,
  sponsor: {
    name: "DogeCoin",
    logoUrl: "...",
    bonusPrize: "1000 DOGE"
  }
}
```

---

## 🔗 Cross-Platform Flow

### User Journey Example

**1. Discovery** (Twitter):
```
User sees tweet: "@ThunderVerseGame play"
Bot replies: "🎮 Click here: jettythunder.app/game?ref=twitter123"
```

**2. Registration** (Web):
```
User clicks link → Lands on game page
Options shown:
[Twitter Login] [Discord Login] [Wallet Connect] [Email]
User clicks "Continue with Twitter"
OAuth flow → Account created → Profile linked
```

**3. First Game**:
```
Tutorial plays → User plays game → Scores 42,850
"🎉 Great score! Ranked #127 globally"
"Earned: 25 $THUNDER + 100 XP"
```

**4. Social Sharing**:
```
"Share your score?" [Yes] [No]
→ Posts to Twitter: "I just scored 42,850 on @ThunderVerseGame!"
→ Auto-tagged, includes game link
→ Friends see tweet, join game
```

**5. Tournament Discovery** (Discord):
```
User joins ThunderVerse Discord
Bot DMs: "🏆 Weekend Tournament starts in 2h! Entry: 10 $THUNDER"
User types: /tournament join
Bot: "You're in! Prize pool: 5000 $THUNDER"
```

**6. Competitive Play**:
```
User plays 5 tournament games
Best score: 67,450 → Ranks #3
Tournament ends → Wins 500 $THUNDER
```

**7. Withdrawal**:
```
User goes to dashboard → "Withdraw Earnings"
Connects wallet (if not already) → MetaMask
Withdraws 525 $THUNDER to wallet
Transaction confirmed on chain
```

---

## 📊 Analytics & Tracking

**Key Metrics**:
- Daily Active Users (DAU) per platform
- Retention (D1, D7, D30)
- Average session duration
- Revenue per user (ARPU)
- Tournament participation rate
- Social referral conversion
- Wallet connection rate

**Implementation** (Mixpanel/PostHog):
```typescript
analytics.track('game_started', {
  userId: user.id,
  gameType: 'pacman',
  platform: 'twitter',
  referrer: 'tweet_123',
});

analytics.track('game_completed', {
  userId: user.id,
  score: 42850,
  rank: 127,
  tokensEarned: 25,
  duration: 320, // seconds
});
```

---

## 🚀 Deployment Strategy

### Infrastructure

**Web App** (Vercel):
- Next.js 14 + React
- Server-side rendering
- Edge functions for auth

**Game Server** (AWS/Railway):
- Node.js + Express
- WebSocket for multiplayer
- Redis for leaderboards

**Database** (Neon):
- PostgreSQL with connection pooling
- Read replicas for leaderboards

**Bots** (Separate processes):
- Twitter bot (Node.js)
- Discord bot (Discord.js)
- Scheduled jobs (cron)

**Blockchain** (Base L2):
- Lower fees than Ethereum
- ERC-20 $THUNDER token
- ERC-721 NFT prizes

---

## 🎯 MVP Roadmap

### Phase 1: Core Platform (4-6 weeks)
- [ ] Multi-provider auth (Twitter, Discord, Wallet)
- [ ] User profile system
- [ ] Game session tracking
- [ ] Basic leaderboard
- [ ] Token reward system

### Phase 2: Social Integration (3-4 weeks)
- [ ] Twitter bot commands
- [ ] Discord slash commands
- [ ] Auto-sharing to social
- [ ] Referral system

### Phase 3: Tournaments (2-3 weeks)
- [ ] Tournament creation UI
- [ ] Entry fee handling
- [ ] Prize distribution
- [ ] Bracket system

### Phase 4: Mobile & Advanced (4-6 weeks)
- [ ] Facebook Canvas integration
- [ ] Instagram story games
- [ ] Mobile apps (React Native)
- [ ] Live streaming integration

---

## 💡 Competitive Advantages

**vs FanDuel/DraftKings**:
- ✅ Crypto-native (instant payouts)
- ✅ Social-first (viral growth)
- ✅ Lower fees (blockchain vs traditional)
- ✅ Global (no geographic restrictions)

**vs Axie Infinity**:
- ✅ Easier onboarding (social login)
- ✅ Casual gameplay (not time-intensive)
- ✅ Cross-platform (all social networks)

**Unique Positioning**:
- **Casual + Competitive** hybrid
- **Meme coin partnerships** for sponsored tournaments
- **UGC games** - users create & monetize games
- **Influencer tournaments** with prize pools

---

## 📈 Revenue Projections

**Revenue Streams**:
1. **Tournament fees** (10% rake)
2. **Token transaction fees** (2%)
3. **Sponsored tournaments** ($5k-$50k per event)
4. **White-label partnerships** (meme coin projects)
5. **NFT marketplace fees** (5%)
6. **Premium features** (custom avatars, themes)

**Year 1 Conservative**:
- 10,000 DAU average
- $5 ARPU/month
- **$600k/year revenue**

**Year 2 Growth**:
- 100,000 DAU
- $10 ARPU/month
- **$12M/year revenue**

---

## 🔒 Compliance & Safety

**Required Considerations**:
- [ ] Age verification (18+ for real money)
- [ ] KYC for withdrawals >$1000
- [ ] Anti-money laundering (AML)
- [ ] Responsible gaming limits
- [ ] Geographic restrictions (check local laws)
- [ ] Terms of service
- [ ] Privacy policy (GDPR, CCPA)

---

## 🎮 Let's Build It!

This is the blueprint for a **$100M+ gaming ecosystem**. 

**Next Steps**:
1. Implement auth system with social providers
2. Build Discord bot for MVP testing
3. Deploy tournament system
4. Launch with meme coin partner
5. Scale across all platforms

Ready to proceed?
