# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Project Overview

An audiovisual art tool that transforms sound into AI-generated visual art. It analyzes audio files, detects beats, and creates synchronized videos with AI-generated images using the Replicate API and FFmpeg.

## Architecture

### Monorepo Structure (pnpm workspaces)

The project is organized as a monorepo with three packages:

- **`packages/client/`** - React frontend with Vite, TypeScript, and WaveSurfer.js for waveform visualization
- **`packages/server/`** - Express API handling audio analysis, AI image generation, and video composition
- **`packages/shared/`** - TypeScript types shared between client and server

### Key Dependencies

- **Client**: React 18, Zustand (state management), Axios, WaveSurfer.js
- **Server**: Express, fluent-ffmpeg, Replicate SDK (AI image generation), Multer (file uploads)
- **Shared**: TypeScript type definitions exported to both packages

### Data Flow

1. User uploads audio → Server stores in `uploads/` directory
2. Server analyzes audio with FFmpeg → Extracts beats, tempo, segments
3. User creates keyframes at timeline positions → Each keyframe has prompt/style
4. Server generates AI images via Replicate API → Stored in `outputs/images/`
5. Server composes video using FFmpeg complex filters → Creates transitions between images synchronized to audio

## Development Commands

### Root Directory

```bash
# Install all dependencies
pnpm install

# Start both client (port 3000) and server (port 3001) concurrently
pnpm dev

# Build all packages
pnpm build

# Run linting across all packages
pnpm lint

# Run type checking across all packages
pnpm type-check
```

### Server Only (packages/server/)

```bash
# Start server with hot-reload
pnpm dev

# Build server TypeScript
pnpm build

# Start production server
pnpm start

# Lint server code
pnpm lint

# Type check only
pnpm type-check
```

### Client Only (packages/client/)

```bash
# Start Vite dev server
pnpm dev

# Build for production
pnpm build

# Preview production build
pnpm preview

# Lint client code
pnpm lint

# Type check only
pnpm type-check
```

## Environment Setup

### Required Environment Variables

Create `packages/server/.env` from `.env.example`:

```env
PORT=3001
REPLICATE_API_TOKEN=<your_replicate_api_token>
# Optional: FFMPEG_PATH and FFPROBE_PATH if not in system PATH
```

### External Dependencies

- **FFmpeg** - Must be installed and accessible in PATH
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install ffmpeg`
- **Replicate API Key** - Required for AI image generation (sign up at replicate.com)

## Core Services

### Audio Analysis (`packages/server/src/services/audioAnalysis.ts`)

- `analyzeAudio(filePath)` - Main entry point
- Uses FFmpeg to extract duration
- Implements energy-based beat detection algorithm
- Calculates BPM from beat intervals
- Creates audio segments between beats

**Note**: Current implementation uses simplified beat detection. For production, consider integrating dedicated audio analysis libraries.

### Image Generation (`packages/server/src/services/imageGeneration.ts`)

- Uses Replicate API with Stable Diffusion XL model
- Model ID: `stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b`
- Combines user prompt with style keyword
- Downloads generated images and stores locally in `outputs/images/`
- Each generation takes 5-20 seconds depending on Replicate API load

### Video Composition (`packages/server/src/services/videoComposition.ts`)

- `composeVideo(request)` - Main entry point
- Sorts keyframes chronologically
- Uses FFmpeg complex filters for transitions
- Supports transition types: fade, dissolve, cut, zoom, slide
- Creates filter chain: scales images → applies transitions → syncs with audio
- Outputs H.264 video with AAC audio codec

**Implementation detail**: Each transition is created using FFmpeg's `xfade` filter between consecutive keyframes.

## State Management

### Client Store (`packages/client/src/store/projectStore.ts`)

Uses Zustand for global state:

- `project` - Current video project with keyframes and settings
- `audioFile` - Uploaded audio file object
- `currentTime` - Playback position in seconds
- `selectedKeyFrame` - Currently selected keyframe for editing

Key actions: `addKeyFrame`, `updateKeyFrame`, `deleteKeyFrame`, `setAudioAnalysis`

## API Routes

All routes prefixed with `/api`:

- **Audio**: `POST /audio/upload`, `POST /audio/analyze`
- **Project**: `POST /project/create`, `GET /project/:id`, `PUT /project/:id/keyframes`
- **Image**: `POST /image/generate`
- **Video**: `POST /video/compose`
- **Health**: `GET /health`

## Type System

All shared types defined in `packages/shared/src/types.ts`:

- `VideoProject` - Top-level project structure
- `KeyFrame` - Timestamp with prompt, style, intensity, transition
- `AudioAnalysis` - Beat detection results
- `TransitionType` - Union type for video transitions
- Request/Response types for all API endpoints

**Important**: When modifying types, rebuild the shared package (`cd packages/shared && pnpm build`) before other packages can see changes.

## Working with FFmpeg

FFmpeg is used for:
1. Audio duration/metadata extraction (`ffprobe`)
2. Video composition with complex filters
3. Format conversions and codecs

Common FFmpeg patterns in this codebase:
- Complex filters for image scaling: `scale=width:height:force_original_aspect_ratio=decrease`
- Transitions between frames: `xfade=transition=fade:duration=X:offset=Y`
- Output options: `-pix_fmt yuv420p`, `-c:v libx264`, `-preset medium`, `-crf 23`

## Testing Notes

- No test framework is currently configured
- When adding tests, consider separate test commands per package
- Audio analysis and video composition require FFmpeg installed
- Image generation tests require valid Replicate API token and incur API costs

## Frontend Architecture

### Multi-View Application

The app follows a 4-view workflow:
1. **Upload** - Drag & drop audio file upload with animated UI
2. **Analyze** - Visual audio analysis display with beat detection
3. **Edit** - Main workspace with keyframe editor, timeline, and visualization
4. **Generate** - Video generation and Deforum script export

### Key Features

**Glassmorphic UI Design**:
- Backdrop blur effects with `backdrop-filter: blur(10px)`
- Purple gradient theme (#667eea → #764ba2 → #f093fb)
- Dark background gradients for contrast
- Smooth animations and transitions

**Deforum-Style Animation Controls**:
- Camera motion parameters (zoom, pan X/Y, rotate)
- Transition types (fade, dissolve, cut, zoom, slide)
- Advanced settings (CFG scale, steps, seed)
- Export to Deforum JSON format

**Audio Visualization**:
- WaveSurfer.js for waveform rendering
- Beat markers displayed as yellow vertical lines
- Keyframe markers as red interactive elements
- Frequency spectrum visualization (64 bars)

### Component Structure

- `App.tsx` - Main router with view state management
- `AudioUploader.tsx` - Drag & drop file upload with progress
- `AudioAnalyzer.tsx` - Beat detection and segment visualization
- `Controls.tsx` - Three-tab keyframe editor (Prompt, Animation, Advanced)
- `Timeline.tsx` - WaveSurfer integration with markers
- `Preview.tsx` - Generation interface and Deforum export

### Styling System

Three CSS files:
- `index.css` - Global resets and base styles
- `App.css` - Application layout and header styles
- `styles.css` - Component-specific styles (1000+ lines)

## Development Workflow Tips

1. **When modifying shared types**: Rebuild shared package first (`cd packages/shared && pnpm build`), then restart dev servers
2. **Testing video generation**: Each keyframe image generation takes ~10-20 seconds
3. **Storage locations**: 
   - Uploads: `packages/server/uploads/`
   - Generated images: `packages/server/outputs/images/`
   - Generated videos: `packages/server/outputs/videos/`
4. **Module resolution**: All imports use `.js` extensions for ESM compatibility (even in `.ts` files)
5. **Timeline precision**: WaveSurfer.js provides waveform visualization; keyframes snap to pixel positions
6. **Frontend styling**: Three CSS files imported in order (index.css, App.css, styles.css)
7. **Deforum export**: Click "Export Deforum Script" to download JSON with prompts and animation parameters

## Quick Start Guide

```bash
# Install dependencies
pnpm install

# Start dev servers (client on :3000, server on :3001)
pnpm dev

# OR start separately
cd packages/server && pnpm dev  # Terminal 1
cd packages/client && pnpm dev  # Terminal 2
```

**First Time Setup**:
1. Ensure FFmpeg is installed: `brew install ffmpeg` (macOS)
2. Copy `packages/server/.env.example` to `packages/server/.env`
3. Add your Replicate API token to `.env`
4. Start dev servers with `pnpm dev`
5. Open http://localhost:3000
