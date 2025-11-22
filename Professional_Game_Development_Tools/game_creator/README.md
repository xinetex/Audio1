# Game Creator Platform - 2D Platformer Game Builder

A fully functional, production-ready web application for creating, customizing, and sharing 2D platformer games.

## 🎮 Features

### Core Functionality
- **Visual Level Editor**: Interactive canvas with drag-and-drop placement for:
  - Platforms (ground and elevated)
  - Enemies with patrol behavior
  - Collectibles (coins/gems)
  - Player spawn point
  - Goal flag
  
- **Working Platformer Game Engine**: 
  - Full physics simulation (gravity, velocity, friction)
  - Collision detection and response
  - Player controls (WASD/Arrow keys + Space to jump)
  - Score tracking and lives system
  - Win/lose conditions
  
- **Customization Panel**:
  - Physics settings (gravity, friction)
  - Player properties (speed, jump height, lives)
  - Visual styling (colors for all game elements)
  - Real-time preview of changes
  
- **Live Preview Mode**: Instant switch between editor and play modes
  
- **Save/Load System**: 
  - Save levels to database with metadata
  - Load previously created levels
  - Export level data as JSON
  - Community level sharing

### User Management
- Email/password authentication
- User dashboard with level library
- Personal and community level collections
- Level statistics (plays, likes, timestamps)

## 🏗️ Architecture

### Clean Modular Structure

#### Game Engine (`lib/game-engine/`)
```
├── types.ts          # TypeScript definitions for all game entities
├── physics.ts        # Physics simulation (gravity, collision, velocity)
├── entities.ts       # Entity creation and behavior systems
├── game-state.ts     # Game loop and state management
└── renderer.ts       # Canvas rendering pipeline
```

#### Extension Points Documented Throughout:
- **AI Generation Hooks**: Ready for procedural level generation integration
- **Advanced Rendering**: Placeholder comments for WebGL/gaussian splatting
- **Service Layer Patterns**: Architecture for platform services
- **Asset Pipeline**: IPFS/cloud storage integration points
- **Behavior Systems**: Entity AI and state machines
- **Replay System**: Game state serialization

### Technology Stack
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript (full type safety)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v4
- **Storage**: AWS S3 (configured for level exports)
- **LLM APIs**: Abacus.AI integration (ready for AI features)
- **UI**: Tailwind CSS, Radix UI, Framer Motion
- **Canvas**: HTML5 Canvas API with custom renderer

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- PostgreSQL database running
- Yarn package manager

### Installation

1. Clone and navigate to the project:
```bash
cd /home/ubuntu/game_creator/nextjs_space
```

2. Install dependencies:
```bash
yarn install
```

3. Set up environment variables (already configured):
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000
AWS_BUCKET_NAME=...
AWS_FOLDER_PREFIX=...
ABACUSAI_API_KEY=...
```

4. Run database migrations:
```bash
yarn prisma generate
yarn prisma db push
```

5. Seed the database with test data:
```bash
yarn prisma db seed
```

6. Start the development server:
```bash
yarn dev
```

7. Open http://localhost:3000 in your browser

### Default Test Account
- Email: john@doe.com
- Password: johndoe123

## 📖 User Guide

### Creating a Level

1. **Login/Signup**: Access the platform with your account
2. **Dashboard**: Click "Create New Level"
3. **Editor Tools**:
   - Select tools from the toolbar (Spawn, Platform, Enemy, Coin, Goal)
   - Click on canvas to place objects
   - Grid snapping for precise placement
   - Delete selected objects
4. **Customize**: Switch to "Customize" tab to adjust:
   - Physics (gravity, friction)
   - Player abilities (speed, jump power)
   - Visual colors
5. **Save**: Click "Save" to persist your level
6. **Test**: Click "Play" to test your level

### Playing a Level

1. **Controls**:
   - Arrow Keys or WASD: Move left/right
   - Space or Up Arrow: Jump
2. **Objective**: 
   - Collect coins for points
   - Avoid enemies (lose lives on contact)
   - Reach the goal flag to win

### Sharing Levels

- Mark levels as "Public" to share with the community
- View community levels from the dashboard
- Track plays and likes on your levels

## 🔧 API Endpoints

### Authentication
- `POST /api/signup` - Create new account
- `POST /api/auth/login` - Sign in
- `GET /api/auth/session` - Get current session

### Levels
- `GET /api/levels` - List levels (with filter: my-levels/public)
- `POST /api/levels` - Create new level
- `GET /api/levels/[id]` - Get specific level
- `PUT /api/levels/[id]` - Update level
- `DELETE /api/levels/[id]` - Delete level

### AI Generation (Future)
- `POST /api/ai/generate-level` - Procedural level generation (placeholder)

## 🎯 Future Enhancements

### Documented Extension Points

1. **AI Features**:
   - Procedural level generation using LLM APIs
   - Asset generation (sprites, textures)
   - Difficulty balancing
   - Auto-playtesting with AI agents

2. **Advanced Rendering**:
   - WebGL rendering pipeline
   - Particle effects system
   - Gaussian splatting for 3D elements
   - Custom shaders and post-processing

3. **Entity Behaviors**:
   - Advanced enemy AI (chase, attack patterns)
   - Moving platforms
   - Power-ups and abilities
   - Boss encounters

4. **Platform Services**:
   - Level versioning and history
   - Collaborative editing
   - Level validation and testing
   - Analytics and telemetry
   - Replay system

5. **Social Features**:
   - Level ratings and comments
   - Leaderboards
   - Challenges and achievements
   - Level playlists

## 📁 Project Structure

```
game_creator/
├── nextjs_space/
│   ├── app/
│   │   ├── api/              # API routes
│   │   ├── dashboard/        # User dashboard
│   │   ├── editor/           # Level editor
│   │   ├── play/            # Play level page
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/
│   │   ├── auth/            # Authentication components
│   │   ├── game/            # Game components (editor, preview)
│   │   └── ui/              # UI components
│   ├── lib/
│   │   ├── game-engine/     # Core game engine
│   │   ├── auth.ts          # NextAuth config
│   │   ├── db.ts            # Prisma client
│   │   └── types.ts         # Type definitions
│   ├── prisma/
│   │   └── schema.prisma    # Database schema
│   └── scripts/
│       └── seed.ts          # Database seeding
```

## 🧪 Testing

Run TypeScript type checking:
```bash
yarn tsc --noEmit
```

Run the development server:
```bash
yarn dev
```

Build for production:
```bash
yarn build
```

## 🔐 Security

- Passwords hashed with bcryptjs
- JWT-based session management
- API routes protected with authentication checks
- Database queries use Prisma for SQL injection prevention
- Environment variables for sensitive data

## 📝 Database Schema

### User
- Authentication and profile data
- One-to-many relationship with levels

### Level
- Level metadata (title, description, thumbnail)
- Level configuration (JSON)
- Entity data (platforms, enemies, collectibles)
- Play statistics (plays, likes)
- Public/private visibility

## 🎨 Design System

- **Color Palette**: Purple and cyan gradients
- **Typography**: Inter font family
- **Components**: Radix UI primitives
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design approach

## 📊 Performance

- Server-side rendering for initial load
- Client-side navigation for fast transitions
- Canvas rendering at 60 FPS
- Optimized physics calculations
- Database indexes on frequently queried fields

## 🤝 Contributing

This is a production-ready MVP with clear extension points for future enhancements. The codebase includes extensive comments marking where new features should integrate.

## 📄 License

Built with Next.js, Prisma, NextAuth, and other open-source technologies.

---

**Ready for Production Deployment!** 🚀

The application is fully functional and can be deployed immediately. All core features are working:
- User authentication ✅
- Level creation and editing ✅
- Game physics and rendering ✅
- Save/load system ✅
- Community sharing ✅
- Responsive UI ✅

Future enhancements can be added incrementally without disrupting existing functionality.
