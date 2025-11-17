# Professional Frontend Setup Guide

## Overview

The audiovisual art tool now features a professional-grade frontend with:

- 🎨 **Modern Glassmorphic UI** - Beautiful backdrop blur effects and gradient designs
- 🎵 **Advanced Audio Analysis** - Real-time beat detection and frequency visualization  
- ✏️ **Deforum-Style Animation Controls** - Camera motion, zoom, pan, rotation parameters
- 📊 **Interactive Timeline** - WaveSurfer.js integration with beat markers and keyframes
- 🎬 **Video Generation** - AI-powered image generation with smooth transitions
- 📄 **Deforum Script Export** - Export projects as Deforum-compatible JSON

## Installation

```bash
# From root directory
pnpm install

# Start development server
pnpm dev
```

The app will be available at:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

## User Workflow

### 1. Upload Audio (Drag & Drop)

The landing page features a beautiful drag-and-drop zone:
- Drag audio files directly onto the upload zone
- Or click to browse for MP3, WAV, OGG, or FLAC files
- Real-time upload progress with visual feedback
- Automatic audio analysis upon upload

**Features**:
- Animated floating icon
- Glassmorphic card design
- Feature highlights below upload zone
- Error handling with clear messages

### 2. Audio Analysis View

After upload, see detailed audio analysis:

**Beat Detection Card**:
- Visual representation of all detected beats
- Energy levels shown as vertical bars
- Total beats count and BPM display

**Audio Segments Card**:
- Color-coded intensity levels
- Timestamp markers
- Scroll through up to 20 segments

**Track Information Card**:
- Duration, BPM, segments, and beat count
- Large icon-based stats display

Click "Continue to Editor →" when ready.

### 3. Edit View

The main editing interface with three sections:

#### Navigation Tabs
- **📊 Analyze** - Return to analysis view
- **✏️ Edit** - Main editing workspace
- **🎬 Generate** - Video generation and export

#### Editor Layout

**Left Sidebar - Keyframe Editor**:

Three tabs for editing selected keyframes:

**Prompt Tab**:
- Text area for AI image prompt
- Art style selector (8 styles):
  - Cinematic, Abstract, Anime
  - Photographic, Digital Art, Psychedelic
  - Minimalist, Surreal
- Intensity slider (0-1)

**Animation Tab**:
- Transition type buttons (Fade, Dissolve, Cut, Zoom, Slide)
- Transition duration slider (0.1-3s)
- **Deforum-style Camera Motion**:
  - Zoom control (-5 to +5)
  - Pan X control (-10 to +10)
  - Pan Y control (-10 to +10)
  - Rotate control (-180° to +180°)

**Advanced Tab**:
- Keyframe time adjustment
- Seed for reproducibility
- CFG Scale (prompt adherence)
- Generation steps (quality)

**Main Area**:
- Audio-reactive frequency visualization (64 bars)
- Animated gradient visualization
- Grid background effect

**Timeline**:
- WaveSurfer.js waveform display
- Beat markers (yellow vertical lines)
- Keyframe markers (red vertical lines)
- Play/Pause button
- Add Keyframe button
- Click anywhere on timeline to add keyframes

**Project Stats Bar**:
- Duration, BPM, Beats, Keyframes count
- Color-coded statistics

### 4. Generate View

**Video Generation**:
- Progress bar with percentage
- Real-time status updates
- Estimated generation time
- Resolution and framerate display

**Actions**:
1. **Generate Video** - Create AI-powered video from keyframes
2. **Export Deforum Script** - Download JSON file for Deforum

**Deforum Script Format**:
```json
{
  "W": 1920,
  "H": 1080,
  "fps": 30,
  "prompts": {
    "0": "cosmic landscape, cinematic style",
    "30": "abstract waves, psychedelic style",
    "60": "neon city, digital-art style"
  },
  "animation_mode": "2D",
  "max_frames": 900,
  "zoom": "0:(1.0)",
  "angle": "0:(0)",
  "translation_x": "0:(0)",
  "translation_y": "0:(0)"
}
```

**After Generation**:
- Video player with controls
- Download button
- "Generate Another" button to restart

## Visual Design Features

### Color Palette
- **Primary**: Purple gradient (#667eea → #764ba2 → #f093fb)
- **Background**: Dark blue gradient (#0a0e27 → #1a1a2e → #16213e)
- **Accent**: Glassmorphic cards with backdrop blur

### Animations
- Floating hero icons
- Pulsing logo
- Frequency bar bounce effect
- Smooth hover transitions
- Card lift on hover

### Glassmorphism
- `backdrop-filter: blur(10px)`
- Semi-transparent backgrounds
- Subtle borders with rgba colors
- Smooth shadows and gradients

## Keyboard Shortcuts

- **Space** - Play/Pause audio
- **Click Timeline** - Add keyframe at cursor position
- **Escape** - Deselect keyframe

## Tips & Best Practices

1. **Keyframe Placement**:
   - Add keyframes at beat markers for rhythm-synced visuals
   - Use 3-5 keyframes for tracks under 2 minutes
   - Use 5-10 keyframes for longer tracks

2. **Prompt Writing**:
   - Be specific but concise
   - Style selector adds "style" keyword automatically
   - Higher intensity = more dramatic visuals

3. **Transitions**:
   - Fade/Dissolve for smooth changes
   - Cut for instant changes
   - Zoom for dramatic reveals
   - Slide for lateral movement

4. **Generation Times**:
   - Each keyframe takes 5-20 seconds to generate
   - Video composition adds ~30 seconds
   - Total: ~(keyframes × 15s) + 30s

5. **Deforum Export**:
   - Use for advanced animation in Stable Diffusion
   - Import into Deforum extension
   - Customize camera motion parameters

## Responsive Design

The interface adapts to different screen sizes:

- **Desktop (>1024px)**: Full side-by-side layout
- **Tablet (768-1024px)**: Stacked layout
- **Mobile (<768px)**: Single column with touch-optimized controls

## Browser Compatibility

Tested and optimized for:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

Requires:
- WebAudio API support
- CSS backdrop-filter support
- ES2020+ JavaScript

## Performance Optimizations

- WaveSurfer.js for efficient waveform rendering
- CSS animations over JavaScript
- Lazy loading of large audio files
- Optimized re-renders with React hooks
- Zustand for lightweight state management

## Troubleshooting

**Audio won't play**:
- Check browser console for errors
- Ensure audio format is supported
- Try converting to MP3

**Keyframes not appearing**:
- Check that audio analysis completed
- Refresh the page and re-upload

**Generation fails**:
- Verify Replicate API token in server/.env
- Check server console for errors
- Ensure FFmpeg is installed

**Styling looks broken**:
- Clear browser cache
- Check that styles.css is imported
- Verify no CSS conflicts

## Future Enhancements

Planned features:
- [ ] Real-time audio-reactive preview
- [ ] More AI models (DALL-E, Midjourney)
- [ ] Automatic keyframe generation from beats
- [ ] Video effect plugins
- [ ] Collaborative editing
- [ ] Cloud storage integration

## Technical Stack

- **Frontend Framework**: React 18 + TypeScript
- **State Management**: Zustand
- **Audio Visualization**: WaveSurfer.js
- **Styling**: CSS3 with Glassmorphism
- **Build Tool**: Vite
- **Type Safety**: TypeScript 5.3+

## Component Architecture

```
App.tsx (Main Router)
├── AudioUploader (Drag & Drop)
├── AudioAnalyzer (Analysis Display)
├── Editor
│   ├── Controls (Keyframe Editor)
│   │   ├── Prompt Tab
│   │   ├── Animation Tab
│   │   └── Advanced Tab
│   ├── Viewport (Visualization)
│   ├── Timeline (WaveSurfer)
│   └── Stats Bar
└── Preview (Generation & Export)
```

## API Integration

The frontend communicates with the backend via REST API:

- `POST /api/audio/upload` - Upload audio file
- `POST /api/audio/analyze` - Analyze audio
- `POST /api/project/create` - Create project
- `POST /api/image/generate` - Generate AI image
- `POST /api/video/compose` - Compose final video

All requests use Axios with proper error handling.

---

**Built with ❤️ for audiovisual artists and creators**
