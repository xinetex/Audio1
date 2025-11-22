# ⚡ ThunderVerse Platform
## Dual-Purpose Game & Video Content Creation Platform

**Brand Your Meme Coins with Mini-Games + 8-Bit Video Shorts**

---

## 🎯 Vision

ThunderVerse is a unified content creation platform that generates **two outputs from one asset library**:

1. **Mini-Games** (HTML5/Electron) - Playable branded games
2. **Video Shorts** (MP4) - 8-bit animated promotional content

**Key Innovation**: Same pixel art sprites flow to both games and videos, ensuring **brand consistency** across all marketing channels.

---

## 🏗️ Architecture

```
thunderverse-platform/
├── workspace/
│   ├── studio.html          # Visual game editor (drag/drop assets)
│   └── pacman-demo.html     # Standalone Pac-Man with custom branding
├── packages/
│   ├── runtime/             # ThunderEngine - Game runtime
│   │   ├── src/
│   │   │   ├── types.ts     # Core type definitions
│   │   │   ├── engine.ts    # Base game loop engine
│   │   │   ├── physics.ts   # Collision detection
│   │   │   ├── input.ts     # Keyboard controls
│   │   │   └── pacman.ts    # Pac-Man implementation
│   ├── server/              # AI generation + video pipeline
│   └── client/              # React frontend
```

---

## 🪙 Meme Coin Integration Strategy

### Use Case: Branded Mini-Games

Transform your meme coin into an **engaging playable experience**:

**Example**: "🐶 DogeCoin Pac-Man"
- Player: 🐶 (Doge mascot)
- Ghosts: 🐱🐭🦊🐻 (competitor coins)
- Pellets: 💎 (coins to collect)
- Power Pellets: ⭐ (moon = to the moon!)

### How to Brand a Game

#### Option 1: Use the Visual Studio

1. Open `workspace/studio.html` in browser
2. Click **"Import Assets"** to upload meme coin logos/sprites
3. Drag assets onto canvas to build level
4. Click **"Export Game"** → Downloads branded HTML file
5. Host on your website or distribute as download

#### Option 2: Customize the Pac-Man Demo

1. Open `workspace/pacman-demo.html`
2. Modify the **"🎨 Customize Assets"** section:
   - **Player**: Your coin's mascot emoji/character
   - **Ghosts**: Competitor coins or themed enemies
   - **Pellets**: Coins, diamonds, or themed collectibles
   - **Power Pellets**: Moon emoji (🌙) or star
3. Click **"Apply Custom Assets"** → Game reloads with branding
4. Export and share!

#### Option 3: Code-Level Customization

```javascript
// In pacman-demo.html, modify lines 226-231:
let customAssets = {
    player: '🐶',          // Your meme coin character
    ghosts: ['🐱', '🐭', '🦊', '🐻'],  // Competitors
    pellet: '💰',          // Your token
    powerPellet: '🚀'      // To the moon!
};
```

---

## 🎮 Current Features

### ThunderEngine (Game Runtime)

✅ **Grid-based movement** - Pac-Man style navigation  
✅ **Collision detection** - AABB collision system  
✅ **Ghost AI** - Simple chase/scatter behavior  
✅ **Power mode** - Temporary invincibility mechanic  
✅ **Score system** - Points for pellets/ghosts  
✅ **Lives system** - Classic 3-life gameplay  
✅ **Keyboard input** - Arrow keys + WASD support  
✅ **Pause/Resume** - Space bar to pause  

### Studio Features

✅ **Asset persistence** - Save/load projects  
✅ **Import custom assets** - PNG/JPG support  
✅ **AI asset generation** - Replicate SDXL integration  
✅ **Export games** - Standalone HTML files  
✅ **Grid editor** - Snap-to-grid placement  
✅ **Drag & drop** - Visual asset placement  

---

## 🚀 Quick Start

### Play the Demo

```bash
# Open in browser (no server needed)
open workspace/pacman-demo.html
```

**Controls**:
- Arrow Keys / WASD: Move
- Space: Pause
- Goal: Collect all pellets, avoid ghosts!

### Use the Studio

```bash
# Start the dev server
cd packages/server
pnpm dev

# In another terminal
cd packages/client
pnpm dev

# Open studio
open workspace/studio.html
```

### Build the Runtime

```bash
cd packages/runtime
pnpm install
pnpm build
```

---

## 🎨 Marketing Applications

### 1. **Twitter/X Engagement**
- Share playable game links
- "Play our Pac-Man clone, collect $DOGE coins!"
- Embeddable in tweets via hosted HTML

### 2. **Community Challenges**
- High score competitions
- Leaderboards integration (future feature)
- Reward top players with tokens

### 3. **Brand Awareness**
- Every player sees your mascot/logo
- Subconscious brand reinforcement
- Shareable + viral potential

### 4. **Cross-Promotion**
- Collaborate with other meme coins
- "Defeat competitor ghosts"
- Community crossover events

### 5. **Educational Content**
- Teach tokenomics through gameplay
- "Collect liquidity pools (pellets)"
- "Power pellets = staking rewards"

---

## 🎬 Video Shorts Pipeline (Phase 3) ✅

**Audio-Reactive Music Visualizer** - Transform your meme coin sprites into hypnotic social media content

### Core Features

✅ **8 Sprite Behaviors**:
- **Pulse** - Scale with bass drops
- **Spin** - Rotate with rhythm
- **Bounce** - Jump on beats
- **Wave** - Smooth sine wave motion
- **Scatter** - Explode/contract with energy
- **Orbit** - Circle around center
- **Rain** - Fall from top
- **Shake** - Vibrate with high frequencies

✅ **5 Preset Recipes**:
1. **🚀 Moon Shot** - Rockets pumping to the moon (radial bg, bloom, trails)
2. **🎉 Party Vibes** - High energy celebration (chromatic, particles)
3. **🌊 Chill Wave** - Smooth flowing animations (gradient, vignette)
4. **👾 Retro Arcade** - 8-bit gaming nostalgia (scanlines, solid bg)
5. **💰 Crypto Chaos** - Market volatility energy (all effects enabled)

✅ **Visual Effects**:
- **Backgrounds**: Solid, gradient, radial, pulsing
- **Post-processing**: Bloom glow, CRT scanlines, vignette, chromatic aberration
- **Particles**: Dynamic particle systems
- **Audio-reactive**: Bass, mid, high frequency response

### API Usage

```javascript
// Generate visualizer with preset
POST /api/visualizer/generate-preset
{
  "audioFile": "my-track.mp3",
  "recipeId": "meme-pump",
  "sprites": ["🐶", "🚀", "💰", "🌙"],
  "settings": {
    "width": 1280,
    "height": 720,
    "fps": 30
  }
}

// Custom recipe
POST /api/visualizer/generate
{
  "audioFile": "track.mp3",
  "recipe": {
    "sprites": [
      { "sprite": "🐶", "behavior": "pulse", "baseSize": 64 }
    ],
    "effects": { /* ... */ },
    "audioReactivity": { /* ... */ }
  },
  "settings": { /* ... */ }
}
```

### Use Cases

- **Social media content** - TikTok/Instagram/Twitter videos
- **Token launch hype** - Countdown visualizers
- **Community engagement** - "What's your vibe?" polls
- **Live stream overlays** - Real-time audio reactive
- **NFT art** - Generative music videos

---

## 🛠️ Technical Stack

- **Frontend**: HTML5 Canvas, Vanilla JS (standalone games)
- **Studio**: React + Zustand + WaveSurfer.js
- **Backend**: Express + TypeScript
- **AI Generation**: Replicate SDXL API
- **Video Pipeline**: FFmpeg (existing audiovisual-art-tool)
- **Deployment**: Vercel + GitHub Actions
- **Database**: Neon PostgreSQL

---

## 📋 Roadmap

### Phase 1: ✅ Studio Foundation (COMPLETE)
- Asset management
- Import/export
- Project persistence
- AI generation

### Phase 2: ✅ Pac-Man Engine (COMPLETE)
- ThunderEngine core
- Grid-based physics
- Collision detection
- Ghost AI
- Customizable assets

### Phase 3: ✅ Video Shorts + Music Visualizer (COMPLETE)
- Sprite animation video generation
- Audio-reactive music visualizers
- 8 sprite behaviors (pulse, spin, bounce, wave, scatter, orbit, rain, shake)
- 5 preset visual recipes (Moon Shot, Party Vibes, Chill Wave, Retro Arcade, Crypto Chaos)
- Audio analysis with beat detection
- Post-processing effects (bloom, scanlines, vignette, chromatic aberration)
- MP4 export with FFmpeg

### Phase 4: 🔮 Advanced Features (PLANNED)
- Multiple game templates (Snake, Breakout, Platformer)
- Multiplayer support
- Blockchain integration (NFT rewards, token gates)
- Leaderboards + wallet authentication
- Electron desktop app
- Steam/itch.io distribution
- Mobile export (Capacitor/React Native)

---

## 🎯 Meme Coin Partnership Model

### For Meme Coin Projects

**Free Tier**:
- Use Pac-Man template
- Customize with emojis
- Self-hosted games

**Premium Tier** ($$$):
- Custom game templates
- Professional sprite art
- Video shorts production
- Hosted leaderboards
- Token-gated features
- Cross-promotion in ThunderVerse arcade

### Revenue Streams

1. **Custom game development** - Build unique games per coin
2. **Video production** - Animated shorts packages
3. **ThunderVerse Arcade** - Curated game portal (ads/sponsorships)
4. **White-label licenses** - Rebrand platform for agencies
5. **NFT game assets** - Sell branded sprite packs

---

## 🔧 Development Commands

```bash
# Install dependencies
pnpm install

# Build runtime
cd packages/runtime && pnpm build

# Start servers
pnpm dev  # Runs client + server concurrently

# Build all packages
pnpm build

# Type checking
pnpm type-check

# Linting
pnpm lint
```

---

## 📂 Key Files

- `workspace/pacman-demo.html` - Standalone Pac-Man (customizable)
- `workspace/studio.html` - Visual game editor
- `packages/runtime/src/pacman.ts` - Game logic
- `packages/runtime/src/engine.ts` - Core game engine
- `packages/server/src/services/imageGeneration.ts` - AI asset generation
- `packages/server/src/services/videoComposition.ts` - Video export

---

## 🤝 Contributing

This is a private project for ThunderVerse ecosystem. For collaboration:

1. Build a game with your meme coin branding
2. Share with your community
3. Provide feedback on features
4. Request custom templates

---

## 📜 License

Proprietary - ThunderVerse Platform © 2025

---

## 🎮 Try It Now!

1. **Open** `workspace/pacman-demo.html` in your browser
2. **Customize** the assets with your meme coin emojis
3. **Play** and share with your community!
4. **Export** the game HTML and host on your website

**Let's build the metaverse, one mini-game at a time! ⚡**

---

## 🔗 Links

- **Demo**: [Open pacman-demo.html locally]
- **Studio**: [Coming to jettythunder.app]
- **Docs**: [This file!]
- **Support**: [Create issue in repo]

---

**Built with ⚡ by ThunderVerse | Powered by ThunderEngine**
