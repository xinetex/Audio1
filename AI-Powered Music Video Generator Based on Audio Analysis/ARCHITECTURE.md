# Music Video Generator - Technical Architecture

## System Overview

The Music Video Generator is a sophisticated web application that analyzes music files and generates AI-powered music videos. The system combines advanced audio analysis with AI video generation APIs to create synchronized, visually compelling music videos based on tempo, pacing, mood, and musical structure.

## Technology Stack

### Frontend
- **Framework**: React 19 with TypeScript
- **Styling**: Tailwind CSS 4 (OKLCH color space)
- **UI Components**: shadcn/ui
- **State Management**: tRPC React Query
- **Routing**: Wouter
- **Audio Visualization**: Web Audio API + Canvas
- **Video Player**: HTML5 Video with custom controls

### Backend
- **Runtime**: Node.js with Express 4
- **API Layer**: tRPC 11 (type-safe RPC)
- **Database**: MySQL/TiDB with Drizzle ORM
- **File Storage**: S3-compatible storage
- **Audio Analysis**: Python subprocess (librosa, essentia)
- **Video Generation**: Replicate API (LTX-Video or Hunyuan-Video)

### External Services
- **Video Generation**: Replicate API
- **File Storage**: S3 (via platform storage helpers)
- **Authentication**: Manus OAuth

## Data Architecture

### Database Schema

#### Projects Table
Stores user music video projects with metadata and status tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | int (PK) | Auto-increment project ID |
| userId | int (FK) | Reference to users table |
| title | varchar(255) | Project name |
| audioFileKey | varchar(512) | S3 key for uploaded audio |
| audioFileUrl | text | Public URL to audio file |
| audioFileName | varchar(255) | Original filename |
| audioFileDuration | float | Duration in seconds |
| status | enum | pending, analyzing, generating, completed, failed |
| createdAt | timestamp | Project creation time |
| updatedAt | timestamp | Last update time |

#### Music Analysis Table
Stores detailed analysis results for each audio file.

| Column | Type | Description |
|--------|------|-------------|
| id | int (PK) | Auto-increment ID |
| projectId | int (FK) | Reference to projects table |
| tempo | float | BPM (beats per minute) |
| key | varchar(10) | Musical key (e.g., "C major") |
| energy | float | Overall energy level (0-1) |
| mood | varchar(50) | Detected mood (energetic, calm, etc.) |
| structure | json | Structural segments (intro, verse, chorus) |
| beats | json | Beat timestamps array |
| spectralFeatures | json | Brightness, timbre, etc. |
| analysisData | json | Full analysis results |
| createdAt | timestamp | Analysis completion time |

#### Video Generations Table
Tracks individual video segment generation requests.

| Column | Type | Description |
|--------|------|-------------|
| id | int (PK) | Auto-increment ID |
| projectId | int (FK) | Reference to projects table |
| segmentIndex | int | Order in final video |
| prompt | text | Generated prompt for this segment |
| startTime | float | Start time in audio (seconds) |
| endTime | float | End time in audio (seconds) |
| videoFileKey | varchar(512) | S3 key for generated video |
| videoFileUrl | text | Public URL to video segment |
| replicateId | varchar(255) | Replicate prediction ID |
| status | enum | pending, processing, completed, failed |
| errorMessage | text | Error details if failed |
| createdAt | timestamp | Generation request time |
| completedAt | timestamp | Generation completion time |

#### Final Videos Table
Stores assembled final videos with audio.

| Column | Type | Description |
|--------|------|-------------|
| id | int (PK) | Auto-increment ID |
| projectId | int (FK) | Reference to projects table |
| videoFileKey | varchar(512) | S3 key for final video |
| videoFileUrl | text | Public URL to final video |
| duration | float | Video duration in seconds |
| resolution | varchar(20) | Video resolution (e.g., "1920x1080") |
| createdAt | timestamp | Assembly completion time |

## Audio Analysis Pipeline

### Analysis Process Flow

1. **Audio Upload**: User uploads audio file via drag-and-drop
2. **File Storage**: Audio saved to S3, metadata stored in database
3. **Analysis Trigger**: Backend spawns Python subprocess
4. **Feature Extraction**: Python script analyzes audio using librosa/essentia
5. **Result Storage**: Analysis results saved to database
6. **Prompt Generation**: Backend generates video prompts based on analysis

### Audio Analysis Features

The Python analysis engine extracts the following features:

**Temporal Features**
- Tempo (BPM) and beat positions
- Onset detection for rhythm changes
- Structural segmentation (intro, verse, chorus, bridge, outro)

**Spectral Features**
- Spectral centroid (brightness)
- Spectral rolloff (timbre)
- Spectral contrast (texture)
- Chroma features (harmony)

**Energy & Dynamics**
- RMS energy over time
- Zero crossing rate
- Dynamic range analysis

**High-Level Features**
- Mood classification (energetic, calm, dark, uplifting)
- Key and scale detection
- Time signature estimation

## Prompt Generation System

### Intelligent Scene Creation

The prompt generation system maps musical features to visual concepts:

**Tempo Mapping**
- Slow (< 90 BPM): Cinematic, slow-motion, contemplative scenes
- Medium (90-120 BPM): Natural pacing, storytelling
- Fast (> 120 BPM): Dynamic camera movement, rapid cuts, energetic action

**Energy Mapping**
- Low energy: Calm landscapes, intimate scenes, soft lighting
- Medium energy: Balanced scenes with moderate movement
- High energy: Action sequences, vibrant colors, dramatic effects

**Mood Mapping**
- Energetic: Bright colors, dynamic movement, outdoor scenes
- Calm: Soft colors, gentle movement, natural environments
- Dark: Low-key lighting, mysterious atmosphere, urban settings
- Uplifting: Warm colors, ascending movement, open spaces

**Structural Mapping**
- Intro: Establishing shots, scene setting
- Verse: Character development, narrative progression
- Chorus: Climactic moments, wide shots, emotional peaks
- Bridge: Transition scenes, perspective shifts
- Outro: Resolution, fade-outs, closing shots

### Prompt Template System

Each video segment uses a structured prompt format:

```
[SCENE TYPE] featuring [CHARACTERS/SUBJECTS] in [ENVIRONMENT],
[CAMERA MOVEMENT], [LIGHTING], [MOOD/ATMOSPHERE],
[STYLE], cinematic, high quality
```

Example prompts generated:
- "Cinematic aerial shot of a lone figure walking through misty mountains at dawn, slow dolly forward, golden hour lighting, contemplative atmosphere, photorealistic style"
- "Dynamic close-up of dancers in an urban plaza, rapid camera movement, vibrant neon lighting, energetic atmosphere, modern style"

## Video Generation Workflow

### Generation Pipeline

1. **Segment Planning**: Divide song into logical segments based on structure
2. **Prompt Generation**: Create unique prompt for each segment
3. **API Orchestration**: Queue video generation requests to Replicate
4. **Progress Tracking**: Monitor generation status via webhooks/polling
5. **Video Assembly**: Concatenate segments and sync with audio
6. **Final Encoding**: Merge audio track with video
7. **Storage**: Upload final video to S3

### Replicate API Integration

The system uses Replicate's API to generate video segments:

**Model Selection**
- Primary: `lightricks/ltx-video` (real-time generation, 24 FPS)
- Fallback: `tencent/hunyuan-video` (higher quality, slower)

**Generation Parameters**
- Resolution: 768x512 (optimized for speed)
- Frame rate: 24 FPS
- Duration: 3-6 seconds per segment
- Inference steps: 30-50 (balanced quality/speed)

**Queue Management**
- Parallel generation of non-sequential segments
- Retry logic for failed generations
- Progress webhooks for real-time updates

## User Interface Design

### Design System (ColorPalette.pro Inspired)

**Color Palette (OKLCH)**
- Primary: `oklch(47.6% 0.152 294)` - Deep purple
- Secondary: `oklch(65% 0.2 320)` - Vibrant pink
- Background: `oklch(95% 0.01 280)` - Soft purple-tinted white
- Surface: `oklch(98% 0.005 280)` with backdrop-blur
- Text: `oklch(20% 0.01 280)` - Near black with purple tint

**Visual Effects**
- Glassmorphism: Semi-transparent panels with backdrop blur
- Soft shadows: Layered box-shadows for depth
- Smooth transitions: 200-300ms ease-in-out
- Gradient accents: Purple to pink gradients on interactive elements

### Key UI Components

**Upload Card**
- Drag-and-drop zone with visual feedback
- File validation (format, size, duration)
- Upload progress indicator
- Audio preview player

**Waveform Visualizer**
- Real-time audio waveform rendering
- Beat markers overlay
- Structural segment highlights
- Interactive playback scrubbing

**Analysis Dashboard**
- Grid layout showing detected features
- Animated value displays
- Visual representation of tempo, energy, mood
- Expandable detailed analysis

**Generation Progress**
- Circular progress indicator
- Segment-by-segment status
- Estimated time remaining
- Real-time status updates

**Video Preview**
- Custom video player controls
- Segment navigation
- Download options (video only, with audio)
- Share functionality

## API Endpoints (tRPC Procedures)

### Project Management
- `project.create` - Create new project
- `project.list` - List user projects
- `project.get` - Get project details
- `project.delete` - Delete project

### Audio Processing
- `audio.upload` - Handle audio file upload
- `audio.analyze` - Trigger audio analysis
- `audio.getAnalysis` - Retrieve analysis results

### Video Generation
- `video.generateSegments` - Start video generation
- `video.getProgress` - Get generation progress
- `video.assemble` - Assemble final video
- `video.download` - Get download URL

## Performance Considerations

### Optimization Strategies

**Frontend**
- Lazy load video player components
- Debounce waveform rendering
- Use Web Workers for audio processing
- Implement virtual scrolling for project lists

**Backend**
- Stream large file uploads
- Cache analysis results
- Batch video generation requests
- Use connection pooling for database

**Storage**
- Implement CDN for video delivery
- Use presigned URLs for secure downloads
- Compress audio files before storage
- Clean up temporary files after processing

## Security & Privacy

**File Upload Security**
- Validate file types and sizes
- Scan for malware
- Limit upload rate per user
- Sanitize filenames

**API Security**
- Rate limiting on expensive operations
- User authentication for all operations
- Secure API key storage for external services
- Input validation on all endpoints

**Data Privacy**
- User data isolation
- Secure file storage with access controls
- Option to delete all project data
- No sharing of user content without permission

## Scalability Considerations

**Horizontal Scaling**
- Stateless backend services
- Queue-based video generation
- Distributed file storage
- Load-balanced API servers

**Cost Optimization**
- Efficient video generation (minimize API calls)
- Storage lifecycle policies (auto-delete old projects)
- Caching of analysis results
- Batch processing for multiple segments

## Future Enhancements

**Advanced Features**
- Custom style selection (anime, 3D, watercolor)
- Manual prompt editing
- Video editing tools (trim, rearrange segments)
- Multiple video generation options
- Collaborative projects

**AI Improvements**
- Fine-tuned models for music-specific scenes
- Better mood detection
- Genre-specific visual styles
- Lyric analysis for narrative generation

**Integration Options**
- Direct Suno.com integration
- YouTube upload
- Social media sharing
- Embed code generation
