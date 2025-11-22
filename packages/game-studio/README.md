# 🎮 ThunderVerse - AI Game Studio

AI-Powered Social Gaming Platform with PixiJS engine and multiplayer support.

## Features

- **PixiJS Rendering** - High-performance 2D graphics at 60+ FPS
- **Modular Game Engine** - Entity Component System architecture
- **Pac-Man MVP** - Complete game with AI ghost behavior
- **AI Character Generation** - Integrate with Replicate API (coming soon)
- **Multiplayer Ready** - Socket.io infrastructure prepared
- **Community Features** - Leaderboards, tournaments (coming soon)

## Quick Start

```bash
# Install dependencies (from root)
pnpm install

# Start dev server
pnpm dev

# Or from this package
cd packages/game-studio
pnpm dev
```

Visit http://localhost:3002

## Game Controls

- **Arrow Keys** or **WASD** - Move player
- **Spacebar** - Pause (when implemented)

## Architecture

```
game-studio/
├── src/
│   ├── engine/
│   │   ├── types.ts           # TypeScript interfaces
│   │   ├── Entity.ts          # Base entity class
│   │   ├── Player.ts          # Player entity
│   │   ├── Ghost.ts           # AI ghost with personalities
│   │   ├── GameMap.ts         # Map management
│   │   ├── GameEngine.ts      # Main engine with PixiJS
│   │   └── levels.ts          # Level definitions
│   ├── components/
│   │   └── Game.tsx           # React game component
│   ├── App.tsx                # Main app
│   └── main.tsx               # Entry point
└── vite.config.ts
```

## Engine Features

### Entity Component System
- Abstract `Entity` base class
- Specialized `Player` and `Ghost` classes
- Modular, extensible architecture

### Ghost AI Personalities
- **Chaser** - Direct pursuit
- **Ambusher** - Predicts player movement
- **Patrol** - Corner patrol patterns
- **Random** - Unpredictable behavior

### Game States
- `idle` - Waiting to start
- `playing` - Active gameplay
- `paused` - Game paused
- `game-over` - Player lost
- `victory` - Level completed

## Adding New Games

1. Create new entity classes extending `Entity`
2. Define game logic in custom `GameEngine` subclass
3. Add level definitions
4. Create React component wrapper

Example:
```typescript
class PokerPlayer extends Entity {
  hand: Card[];
  chips: number;
  // ... poker logic
}
```

## Next Steps

- [ ] AI character sprite generation
- [ ] Multiplayer poker implementation
- [ ] Level editor UI
- [ ] Leaderboard system
- [ ] WebSocket multiplayer
- [ ] Audio integration with beat detection
- [ ] Replay system with FFmpeg recording

## Tech Stack

- **PixiJS 7.x** - 2D rendering
- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Dev server & bundler
- **Socket.io** - Multiplayer (ready)
- **GSAP** - Animations (ready)

## Development

```bash
# Type check
pnpm type-check

# Build
pnpm build

# Lint
pnpm lint
```

## Credits

Built with ❤️ for ThunderVerse Community
- Game Engine: PixiJS
- Framework: React + TypeScript
- Deployment: Vercel (via GitHub)
