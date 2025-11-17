# 🎵 Audiovisual Art Tool

Transform sound into visual art with AI. An interactive tool that analyzes audio files, detects beats, and generates synchronized AI-powered videos with manual creative controls.

## Features

- **Audio Analysis**: Automatic beat detection and tempo analysis
- **AI Image Generation**: Generate images using Stable Diffusion via Replicate API
- **Interactive Timeline**: Visual waveform with beat markers and keyframe editing
- **Manual Controls**: Full control over prompts, styles, intensity, and transitions
- **Video Composition**: FFmpeg-powered video creation with smooth transitions
- **Real-time Preview**: Watch your creation come to life

## Architecture

```
audiovisual-art-tool/
├── packages/
│   ├── client/          # React frontend (Vite + TypeScript)
│   ├── server/          # Express API (Node.js + TypeScript)
│   └── shared/          # Shared types between client and server
```

### Tech Stack

**Frontend:**
- React 18 with TypeScript
- Vite for fast development
- WaveSurfer.js for waveform visualization
- Zustand for state management
- Axios for API communication

**Backend:**
- Node.js with Express
- TypeScript
- FFmpeg for audio analysis and video composition
- Replicate API for AI image generation
- Multer for file uploads

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **pnpm** (v8 or higher) - `npm install -g pnpm`
- **FFmpeg** - Required for audio/video processing
  - macOS: `brew install ffmpeg`
  - Ubuntu: `sudo apt-get install ffmpeg`
  - Windows: Download from [ffmpeg.org](https://ffmpeg.org/download.html)
- **Replicate API Key** - Sign up at [replicate.com](https://replicate.com)

## Installation

1. **Clone or navigate to the repository:**
   ```bash
   cd audiovisual-art-tool
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Configure environment variables:**
   ```bash
   cd packages/server
   cp .env.example .env
   ```
   
   Edit `.env` and add your Replicate API token:
   ```env
   REPLICATE_API_TOKEN=your_token_here
   ```

## Development

Start both client and server in development mode:

```bash
# From the root directory
pnpm dev
```

This will start:
- **Client**: http://localhost:3000
- **Server**: http://localhost:3001

### Running Services Separately

**Start the server only:**
```bash
cd packages/server
pnpm dev
```

**Start the client only:**
```bash
cd packages/client
pnpm dev
```

## Usage

### 1. Upload Audio
- Click "Upload Audio File" and select an audio file (MP3, WAV, OGG)
- The tool will automatically analyze the audio and detect beats

### 2. Create Keyframes
- Click "Play" to listen to your audio
- Click "+ Add Keyframe" at any point in the timeline
- Keyframes mark moments where new AI-generated images will appear

### 3. Customize Keyframes
- Select a keyframe marker on the timeline
- Edit the prompt (what the AI should generate)
- Choose a style (cinematic, abstract, anime, etc.)
- Adjust intensity and transition effects

### 4. Generate Video
- Once you have multiple keyframes, click "Generate Video"
- The tool will:
  - Generate AI images for each keyframe
  - Compose them into a video with transitions
  - Sync everything with your audio

### 5. Export
- Preview the generated video
- Download when satisfied

## Example Workflow

1. Upload a 2-minute electronic music track
2. Add keyframes at major beat drops (auto-detected beats shown as yellow lines)
3. First keyframe: "Neon cityscape" + "cinematic" style
4. Second keyframe: "Abstract waves" + "psychedelic" style
5. Third keyframe: "Cosmic explosion" + "digital-art" style
6. Generate video and watch your music visualized!

## API Endpoints

### Audio
- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/analyze` - Analyze audio for beats

### Project
- `POST /api/project/create` - Create new project
- `GET /api/project/:id` - Get project details
- `PUT /api/project/:id/keyframes` - Update keyframes

### Image
- `POST /api/image/generate` - Generate AI image

### Video
- `POST /api/video/compose` - Compose final video

## Building for Production

```bash
# Build all packages
pnpm build

# Start production server
cd packages/server
pnpm start
```

## Troubleshooting

**FFmpeg not found:**
- Ensure FFmpeg is installed and in your PATH
- Set `FFMPEG_PATH` in `.env` if needed

**Replicate API errors:**
- Verify your API token is correct
- Check your Replicate account has sufficient credits

**Audio not loading:**
- Ensure the audio file format is supported
- Check browser console for CORS errors

**Video generation slow:**
- Image generation takes 5-20 seconds per keyframe
- Video composition takes additional time based on length

## Performance Tips

- Use 3-5 keyframes for shorter audio (< 2 minutes)
- Use 5-10 keyframes for longer audio
- Higher resolution (1920x1080) takes longer to generate
- Consider using 720p for faster previews

## Future Enhancements

- [ ] Real-time audio-reactive effects
- [ ] Multiple AI model options (DALL-E, Midjourney)
- [ ] Automatic keyframe generation from beat analysis
- [ ] Video effect plugins (particles, distortions)
- [ ] Collaborative projects
- [ ] Cloud storage integration
- [ ] Mobile app version

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## License

MIT License - feel free to use this project for any purpose.

## Credits

- Built with [React](https://react.dev/), [Express](https://expressjs.com/), and [TypeScript](https://www.typescriptlang.org/)
- AI images powered by [Replicate](https://replicate.com)
- Audio/video processing via [FFmpeg](https://ffmpeg.org/)
- Waveform visualization by [WaveSurfer.js](https://wavesurfer-js.org/)

---

**Happy creating! 🎨🎵**
