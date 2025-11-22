# 🎵 Audio-Reactive Game Platform
## Casino Energy Meets Game Development

**Created**: November 22, 2025  
**Status**: Implementation Plan

---

## Vision

> "Aligning sound with video in traditional editing takes too long. Let's make games dance to the music in real-time!"

Bring casino-style, music visualizer energy into game development with **real-time audio-reactive animations**. Characters pulse to the beat, environments react to frequency ranges, and particle effects sync with the music—all without manual animation.

---

## The Problem

### Traditional Workflow (Slow)
```
1. Create animation frames
2. Export audio
3. Import to video editor
4. Manually align keyframes to beats
5. Render and test
6. Repeat if timing is off
```
**Time**: Hours per minute of content

### Audio-Reactive Workflow (Fast)
```
1. Upload music
2. AI generates beat-synced animations
3. Real-time preview with audio
4. Adjust parameters live
5. Export instantly
```
**Time**: Minutes per minute of content

---

## What You Already Have

### ✅ Existing Audio Infrastructure

#### Server-Side (Node.js)
- **Audio Analysis Service** (`packages/server/src/services/audioAnalysis.ts`)
  - Beat detection (energy-based algorithm)
  - BPM calculation
  - Audio segmentation
  - FFmpeg integration

#### Client-Side (React)
- **WaveSurfer.js Integration** (`packages/client/src/components/Timeline.tsx`)
  - Waveform visualization
  - Beat markers display
  - Keyframe timeline
  - Play/pause controls

#### Capabilities
- ✅ Extract duration from audio files
- ✅ Detect beats with confidence scores
- ✅ Calculate tempo (BPM)
- ✅ Create time-aligned segments
- ✅ Display visual waveforms

---

## What We'll Add

### 🎮 Real-Time Audio Reactivity

#### Web Audio API Integration
```javascript
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
analyser.fftSize = 2048;

// Get frequency data in real-time
const frequencyData = new Uint8Array(analyser.frequencyBinCount);
analyser.getByteFrequencyData(frequencyData);
```

#### Frequency Band Analysis
```javascript
const bands = {
  bass: frequencyData.slice(0, 10),      // 0-200 Hz
  lowMid: frequencyData.slice(10, 40),   // 200-800 Hz
  mid: frequencyData.slice(40, 100),     // 800-2000 Hz
  highMid: frequencyData.slice(100, 200),// 2000-5000 Hz
  treble: frequencyData.slice(200, 512)  // 5000+ Hz
};
```

#### Casino-Style Effects
- **Slot Machine Reels** spin on kick drums
- **Neon Signs** pulse with mid-range frequencies
- **Particle Explosions** trigger on snare hits
- **Character Bounces** sync to beat
- **Background Colors** shift with music intensity

---

## Architecture

### System Flow

```
Audio File Upload
    ↓
┌─────────────────────────┐
│ Server-Side Analysis    │
│ - Extract beats         │
│ - Calculate BPM         │
│ - Create segments       │
└─────────────────────────┘
    ↓
Beat Map + Audio File
    ↓
┌─────────────────────────┐
│ Client-Side Playback    │
│ - Web Audio API         │
│ - Real-time FFT         │
│ - Frequency bands       │
└─────────────────────────┘
    ↓
┌─────────────────────────┐
│ Game Engine             │
│ - Canvas rendering      │
│ - Sprite animations     │
│ - Particle systems      │
│ - Color modulation      │
└─────────────────────────┘
    ↓
Synchronized Visual Output
```

---

## Implementation Plan

### Phase 1: Core Audio Reactive Engine

#### 1.1 AudioReactiveEngine Class

**File**: `packages/client/src/engine/AudioReactiveEngine.ts`

```typescript
export class AudioReactiveEngine {
  private audioContext: AudioContext;
  private analyser: AnalyserNode;
  private source: AudioBufferSourceNode | null = null;
  private frequencyData: Uint8Array;
  private beatDetector: BeatDetector;
  
  constructor(audioFile: File) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 2048;
    this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
    this.beatDetector = new BeatDetector();
    
    this.loadAudio(audioFile);
  }
  
  async loadAudio(file: File): Promise<void> {
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
    
    this.source = this.audioContext.createBufferSource();
    this.source.buffer = audioBuffer;
    this.source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);
  }
  
  play(): void {
    this.source?.start();
  }
  
  getFrequencyData(): Uint8Array {
    this.analyser.getByteFrequencyData(this.frequencyData);
    return this.frequencyData;
  }
  
  getBands(): FrequencyBands {
    const data = this.getFrequencyData();
    return {
      bass: this.average(data.slice(0, 10)),
      lowMid: this.average(data.slice(10, 40)),
      mid: this.average(data.slice(40, 100)),
      highMid: this.average(data.slice(100, 200)),
      treble: this.average(data.slice(200, 512))
    };
  }
  
  private average(arr: Uint8Array): number {
    return arr.reduce((a, b) => a + b, 0) / arr.length / 255;
  }
  
  isKick(): boolean {
    const bands = this.getBands();
    return bands.bass > 0.7;
  }
  
  isSnare(): boolean {
    const bands = this.getBands();
    return bands.mid > 0.6 && bands.bass < 0.5;
  }
  
  isHiHat(): boolean {
    const bands = this.getBands();
    return bands.treble > 0.5;
  }
}

interface FrequencyBands {
  bass: number;      // 0-1
  lowMid: number;    // 0-1
  mid: number;       // 0-1
  highMid: number;   // 0-1
  treble: number;    // 0-1
}
```

---

### Phase 2: Game Integration

#### 2.1 ThunderVerse Studio Integration

**File**: `workspace/studio.html` (additions)

```html
<!-- Add Audio Upload Section -->
<div class="panel">
    <div class="panel-header">🎵 Audio Reactive</div>
    <div class="panel-content">
        <button class="btn" onclick="uploadMusic()">Upload Music</button>
        
        <div id="audioControls" style="display: none;">
            <button class="btn" onclick="playMusic()">▶️ Play</button>
            <button class="btn" onclick="pauseMusic()">⏸️ Pause</button>
            
            <label class="property-label">Reactivity</label>
            <input type="range" id="reactivity" min="0" max="100" value="50">
            
            <label class="property-label">Effect Type</label>
            <select id="effectType">
                <option value="pulse">Pulse on Beat</option>
                <option value="bounce">Bounce on Kick</option>
                <option value="color">Color Shift</option>
                <option value="scale">Scale to Bass</option>
                <option value="rotate">Rotate to Treble</option>
                <option value="particles">Particle Burst</option>
            </select>
            
            <div class="property-label">Frequency Visualizer</div>
            <canvas id="frequencyViz" width="280" height="64"></canvas>
        </div>
    </div>
</div>
```

**JavaScript Addition**:

```javascript
// Audio Reactive System
let audioReactive = null;
let audioContext = null;
let analyser = null;
let animationFrame = null;

function uploadMusic() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    
    input.onchange = async (e) => {
        const file = e.target.files[0];
        await initAudioReactive(file);
        document.getElementById('audioControls').style.display = 'block';
        updateStatus('🎵 Music loaded - ready for reactive mode!');
    };
    
    input.click();
}

async function initAudioReactive(file) {
    // Create audio context
    audioContext = new (window.AudioContext || window.webkitAudioContext)();
    analyser = audioContext.createAnalyser();
    analyser.fftSize = 256;
    
    // Load audio
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    
    audioReactive = {
        context: audioContext,
        analyser: analyser,
        buffer: audioBuffer,
        source: null,
        frequencyData: new Uint8Array(analyser.frequencyBinCount)
    };
}

function playMusic() {
    if (!audioReactive) return;
    
    // Stop previous source if exists
    if (audioReactive.source) {
        audioReactive.source.stop();
    }
    
    // Create new source
    audioReactive.source = audioReactive.context.createBufferSource();
    audioReactive.source.buffer = audioReactive.buffer;
    audioReactive.source.connect(audioReactive.analyser);
    audioReactive.analyser.connect(audioReactive.context.destination);
    audioReactive.source.start();
    
    // Start animation loop
    startAudioReactiveLoop();
    updateStatus('🎵 Music playing - watch the magic!');
}

function pauseMusic() {
    if (audioReactive?.source) {
        audioReactive.source.stop();
        cancelAnimationFrame(animationFrame);
        updateStatus('⏸️ Music paused');
    }
}

function startAudioReactiveLoop() {
    function loop() {
        animationFrame = requestAnimationFrame(loop);
        
        // Get frequency data
        audioReactive.analyser.getByteFrequencyData(audioReactive.frequencyData);
        
        // Update visualizer
        drawFrequencyViz();
        
        // Apply effects to canvas assets
        applyAudioEffects();
    }
    loop();
}

function drawFrequencyViz() {
    const canvas = document.getElementById('frequencyViz');
    const ctx = canvas.getContext('2d');
    const data = audioReactive.frequencyData;
    
    ctx.fillStyle = 'rgba(10, 0, 20, 0.3)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / data.length;
    
    for (let i = 0; i < data.length; i++) {
        const barHeight = (data[i] / 255) * canvas.height;
        
        // Rainbow gradient
        const hue = (i / data.length) * 360;
        ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
        
        ctx.fillRect(
            i * barWidth,
            canvas.height - barHeight,
            barWidth - 1,
            barHeight
        );
    }
}

function applyAudioEffects() {
    const data = audioReactive.frequencyData;
    const effectType = document.getElementById('effectType').value;
    const reactivity = parseInt(document.getElementById('reactivity').value) / 100;
    
    // Calculate frequency bands
    const bass = average(data.slice(0, 10)) / 255;
    const mid = average(data.slice(10, 100)) / 255;
    const treble = average(data.slice(100, 128)) / 255;
    
    // Apply to all assets on canvas
    currentProject.assets.forEach(asset => {
        switch(effectType) {
            case 'pulse':
                // Pulse size on beat
                const pulseScale = 1 + (bass * reactivity * 0.5);
                asset.width = asset.originalWidth * pulseScale;
                asset.height = asset.originalHeight * pulseScale;
                break;
                
            case 'bounce':
                // Bounce on kick
                if (bass > 0.7) {
                    asset.y = asset.originalY - (bass * reactivity * 50);
                } else {
                    asset.y = asset.originalY;
                }
                break;
                
            case 'color':
                // Shift canvas background color
                const hue = (bass + mid + treble) / 3 * 360;
                canvas.style.filter = `hue-rotate(${hue}deg)`;
                break;
                
            case 'scale':
                // Scale to bass
                const scale = 1 + (bass * reactivity);
                asset.width = asset.originalWidth * scale;
                asset.height = asset.originalHeight * scale;
                break;
                
            case 'rotate':
                // Rotate to treble
                asset.rotation = (asset.rotation || 0) + (treble * reactivity * 10);
                break;
                
            case 'particles':
                // Burst particles on snare
                if (mid > 0.6 && bass < 0.5) {
                    createParticleBurst(asset.x, asset.y);
                }
                break;
        }
    });
    
    // Redraw with effects
    redrawCanvas();
}

function average(arr) {
    return arr.reduce((a, b) => a + b, 0) / arr.length;
}

// Store original sizes
function storeOriginalSizes() {
    currentProject.assets.forEach(asset => {
        if (!asset.originalWidth) {
            asset.originalWidth = asset.width;
            asset.originalHeight = asset.height;
            asset.originalY = asset.y;
        }
    });
}
```

---

#### 2.2 Game Creator Platform Integration

**New Component**: `packages/client/src/components/AudioReactiveControls.tsx`

```tsx
import { useState, useEffect, useRef } from 'react';

export function AudioReactiveControls() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [reactivity, setReactivity] = useState(50);
  const [effectType, setEffectType] = useState('pulse');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setAudioFile(file);
    await initAudio(file);
  };
  
  const initAudio = async (file: File) => {
    const context = new AudioContext();
    const analyser = context.createAnalyser();
    analyser.fftSize = 256;
    
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await context.decodeAudioData(arrayBuffer);
    
    audioContextRef.current = context;
    analyserRef.current = analyser;
  };
  
  const playAudio = () => {
    if (!audioContextRef.current || !analyserRef.current) return;
    
    setIsPlaying(true);
    // Start animation loop and connect to game engine
    startReactiveLoop();
  };
  
  const startReactiveLoop = () => {
    const loop = () => {
      if (!isPlaying) return;
      
      const frequencyData = new Uint8Array(analyserRef.current!.frequencyBinCount);
      analyserRef.current!.getByteFrequencyData(frequencyData);
      
      // Draw visualizer
      drawVisualizer(frequencyData);
      
      // Emit to game engine
      emitAudioData(frequencyData);
      
      requestAnimationFrame(loop);
    };
    loop();
  };
  
  const drawVisualizer = (data: Uint8Array) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const barWidth = canvas.width / data.length;
    
    for (let i = 0; i < data.length; i++) {
      const barHeight = (data[i] / 255) * canvas.height;
      const hue = (i / data.length) * 360;
      
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;
      ctx.fillRect(
        i * barWidth,
        canvas.height - barHeight,
        barWidth - 1,
        barHeight
      );
    }
  };
  
  const emitAudioData = (data: Uint8Array) => {
    // Emit to game engine via event system
    window.dispatchEvent(new CustomEvent('audioData', {
      detail: {
        frequencyData: data,
        reactivity,
        effectType
      }
    }));
  };
  
  return (
    <div className="audio-reactive-controls">
      <h3>🎵 Audio Reactive Mode</h3>
      
      <input
        type="file"
        accept="audio/*"
        onChange={handleFileUpload}
      />
      
      {audioFile && (
        <>
          <button onClick={playAudio}>
            {isPlaying ? '⏸️ Pause' : '▶️ Play'}
          </button>
          
          <div>
            <label>Reactivity: {reactivity}%</label>
            <input
              type="range"
              min="0"
              max="100"
              value={reactivity}
              onChange={(e) => setReactivity(parseInt(e.target.value))}
            />
          </div>
          
          <div>
            <label>Effect Type:</label>
            <select value={effectType} onChange={(e) => setEffectType(e.target.value)}>
              <option value="pulse">Pulse on Beat</option>
              <option value="bounce">Bounce on Kick</option>
              <option value="color">Color Shift</option>
              <option value="particles">Particle Burst</option>
            </select>
          </div>
          
          <canvas
            ref={canvasRef}
            width={400}
            height={100}
            style={{ width: '100%', height: 'auto' }}
          />
        </>
      )}
    </div>
  );
}
```

---

### Phase 3: Casino-Style Effect Library

#### 3.1 Effect Presets

**File**: `packages/client/src/effects/AudioEffects.ts`

```typescript
export const AudioEffects = {
  // CASINO EFFECTS
  
  slotMachine: (entity: GameObject, bands: FrequencyBands) => {
    // Spin on kick drum
    if (bands.bass > 0.75) {
      entity.rotation += 360;
      entity.scale = 1.2;
    } else {
      entity.scale = Math.max(1, entity.scale * 0.95);
    }
  },
  
  neonPulse: (entity: GameObject, bands: FrequencyBands) => {
    // Glow intensity based on mid frequencies
    entity.glowIntensity = bands.mid * 2;
    entity.glowColor = `hsl(${bands.mid * 360}, 100%, 50%)`;
  },
  
  chipStack: (entity: GameObject, bands: FrequencyBands) => {
    // Stack height responds to treble
    entity.y = entity.baseY - (bands.treble * 100);
  },
  
  rouletteSpin: (entity: GameObject, bands: FrequencyBands) => {
    // Continuous rotation, speed based on energy
    const totalEnergy = (bands.bass + bands.mid + bands.treble) / 3;
    entity.rotation += totalEnergy * 10;
  },
  
  jackpotFlash: (entity: GameObject, bands: FrequencyBands) => {
    // Flash on peak moments
    if (bands.bass > 0.8 && bands.mid > 0.7) {
      entity.opacity = 1;
      entity.scale = 1.5;
      setTimeout(() => {
        entity.opacity = 0.5;
        entity.scale = 1;
      }, 100);
    }
  },
  
  // MUSIC VISUALIZER EFFECTS
  
  spectrumBars: (entities: GameObject[], frequencyData: Uint8Array) => {
    // Each entity is a frequency bar
    entities.forEach((bar, i) => {
      const dataIndex = Math.floor((i / entities.length) * frequencyData.length);
      bar.scaleY = (frequencyData[dataIndex] / 255) * 3;
      bar.color = `hsl(${(i / entities.length) * 360}, 100%, 50%)`;
    });
  },
  
  waveform: (entities: GameObject[], frequencyData: Uint8Array) => {
    // Create wave pattern
    entities.forEach((particle, i) => {
      const angle = (i / entities.length) * Math.PI * 2;
      const radius = 50 + (frequencyData[i % frequencyData.length] / 255) * 100;
      particle.x = Math.cos(angle) * radius;
      particle.y = Math.sin(angle) * radius;
    });
  },
  
  particleExplosion: (origin: Point, bands: FrequencyBands) => {
    // Burst particles on snare
    if (bands.mid > 0.6 && bands.bass < 0.5) {
      for (let i = 0; i < 20; i++) {
        createParticle({
          x: origin.x,
          y: origin.y,
          velocityX: (Math.random() - 0.5) * bands.mid * 10,
          velocityY: (Math.random() - 0.5) * bands.mid * 10,
          life: 1000,
          color: `hsl(${Math.random() * 360}, 100%, 50%)`
        });
      }
    }
  },
  
  colorCycle: (entity: GameObject, bands: FrequencyBands) => {
    // Rainbow cycle based on combined frequencies
    const hue = ((bands.bass + bands.mid + bands.treble) / 3) * 360;
    entity.tint = `hsl(${hue}, 100%, 50%)`;
  },
  
  bassShake: (camera: Camera, bands: FrequencyBands) => {
    // Camera shake on bass kicks
    if (bands.bass > 0.7) {
      camera.x += (Math.random() - 0.5) * bands.bass * 20;
      camera.y += (Math.random() - 0.5) * bands.bass * 20;
    }
  }
};

interface GameObject {
  x: number;
  y: number;
  rotation: number;
  scale: number;
  scaleY?: number;
  opacity: number;
  color?: string;
  tint?: string;
  glowIntensity?: number;
  glowColor?: string;
  baseY?: number;
}

interface FrequencyBands {
  bass: number;
  lowMid: number;
  mid: number;
  highMid: number;
  treble: number;
}

interface Point {
  x: number;
  y: number;
}

interface Camera {
  x: number;
  y: number;
}
```

---

### Phase 4: AI-Generated Beat Sync

#### 4.1 Enhanced Server Analysis

**File**: `packages/server/src/services/enhancedAudioAnalysis.ts`

```typescript
import { analyzeAudio } from './audioAnalysis.js';
import type { AudioAnalysis, BeatInfo } from '@audiovisual-art-tool/shared';

export interface EnhancedAudioAnalysis extends AudioAnalysis {
  kickDrums: BeatInfo[];
  snares: BeatInfo[];
  hiHats: BeatInfo[];
  drops: BeatInfo[];
  buildups: { startTime: number; endTime: number; intensity: number }[];
  energyProfile: number[]; // Energy level every 100ms
}

export async function enhancedAnalyzeAudio(filePath: string): Promise<EnhancedAudioAnalysis> {
  // Get base analysis
  const baseAnalysis = await analyzeAudio(filePath);
  
  // Classify beats by frequency characteristics
  const { kickDrums, snares, hiHats } = classifyBeats(baseAnalysis.beats);
  
  // Detect drops (sudden energy increases)
  const drops = detectDrops(baseAnalysis.segments);
  
  // Detect buildups
  const buildups = detectBuildups(baseAnalysis.segments);
  
  // Create energy profile
  const energyProfile = createEnergyProfile(baseAnalysis.segments, baseAnalysis.duration);
  
  return {
    ...baseAnalysis,
    kickDrums,
    snares,
    hiHats,
    drops,
    buildups,
    energyProfile
  };
}

function classifyBeats(beats: BeatInfo[]) {
  // Simple heuristic: alternate between kick and snare
  const kickDrums: BeatInfo[] = [];
  const snares: BeatInfo[] = [];
  const hiHats: BeatInfo[] = [];
  
  beats.forEach((beat, i) => {
    if (i % 4 === 0) {
      kickDrums.push(beat);
    } else if (i % 2 === 0) {
      snares.push(beat);
    } else {
      hiHats.push(beat);
    }
  });
  
  return { kickDrums, snares, hiHats };
}

function detectDrops(segments: AudioSegment[]): BeatInfo[] {
  const drops: BeatInfo[] = [];
  
  for (let i = 1; i < segments.length; i++) {
    const prevIntensity = segments[i - 1].intensity;
    const currIntensity = segments[i].intensity;
    
    // Drop = sudden 2x increase in intensity
    if (currIntensity > prevIntensity * 2 && currIntensity > 0.7) {
      drops.push({
        time: segments[i].startTime,
        confidence: 1,
        energy: currIntensity
      });
    }
  }
  
  return drops;
}

function detectBuildups(segments: AudioSegment[]) {
  const buildups = [];
  
  let buildupStart = -1;
  let buildupEnergy = 0;
  
  for (let i = 0; i < segments.length - 1; i++) {
    const currIntensity = segments[i].intensity;
    const nextIntensity = segments[i + 1].intensity;
    
    // Building up
    if (nextIntensity > currIntensity * 1.1) {
      if (buildupStart === -1) {
        buildupStart = segments[i].startTime;
        buildupEnergy = currIntensity;
      }
    } else if (buildupStart !== -1) {
      // Buildup ended
      buildups.push({
        startTime: buildupStart,
        endTime: segments[i].endTime,
        intensity: buildupEnergy
      });
      buildupStart = -1;
    }
  }
  
  return buildups;
}

function createEnergyProfile(segments: AudioSegment[], duration: number): number[] {
  const profile: number[] = [];
  const step = 0.1; // 100ms intervals
  
  for (let t = 0; t < duration; t += step) {
    const segment = segments.find(s => s.startTime <= t && s.endTime > t);
    profile.push(segment?.intensity || 0);
  }
  
  return profile;
}
```

---

### Phase 5: Export with Audio Sync

#### 5.1 Enhanced Export Function

```typescript
async function exportGameWithAudio() {
  const analysis = await enhancedAnalyzeAudio(audioFile);
  
  const html = generateGameHTML({
    name: currentProject.name,
    canvasData: canvas.toDataURL('image/png'),
    assets: currentProject.assets,
    audioData: {
      url: audioFileUrl,
      bpm: analysis.bpm,
      beats: analysis.beats,
      kicks: analysis.kickDrums,
      snares: analysis.snares,
      drops: analysis.drops
    }
  });
  
  downloadFile(html, `${currentProject.name}_audio_reactive.html`, 'text/html');
}
```

**Generated HTML includes**:
```html
<script>
// Embedded beat data
const beatMap = {
  bpm: 128,
  kicks: [0.5, 1.0, 1.5, 2.0],
  snares: [0.75, 1.75, 2.75],
  drops: [8.0, 24.0, 48.0]
};

// Audio reactive game loop
function gameLoop(timestamp) {
  const currentTime = audio.currentTime;
  
  // Check if on a kick
  const onKick = beatMap.kicks.some(k => 
    Math.abs(currentTime - k) < 0.05
  );
  
  if (onKick) {
    // Trigger kick effect
    gameObjects.forEach(obj => {
      obj.scale = 1.2;
      setTimeout(() => obj.scale = 1, 100);
    });
  }
  
  requestAnimationFrame(gameLoop);
}
</script>
```

---

## UI Design: Audio Reactive Panel

### Visual Design

```
┌─────────────────────────────────────────┐
│  🎵 AUDIO REACTIVE MODE                 │
├─────────────────────────────────────────┤
│                                          │
│  [Upload Music]  ▶️ Play  ⏸️ Pause      │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │ 🎼 Waveform Preview                │ │
│  │ ▁▃▅▇█▇▅▃▁ ▁▃▅▇█▇▅▃▁ ▁▃▅▇█          │ │
│  └────────────────────────────────────┘ │
│                                          │
│  FREQUENCY VISUALIZER                   │
│  ┌────────────────────────────────────┐ │
│  │ ████████████████████                │ │
│  │ ████████████████████████            │ │
│  │ ████████████████████████████        │ │
│  │ ████████████████████████████████    │ │
│  └────────────────────────────────────┘ │
│   Bass    Mid     High    Treble        │
│                                          │
│  REACTIVITY: [=========>     ] 70%      │
│                                          │
│  EFFECT PRESETS:                        │
│  ○ Pulse on Beat                        │
│  ● Casino Vibes (Active)                │
│  ○ Particle Burst                       │
│  ○ Color Spectrum                       │
│  ○ Custom...                            │
│                                          │
│  [Apply to All Assets]                  │
│  [Record Performance]                   │
│                                          │
└─────────────────────────────────────────┘
```

---

## Example Use Cases

### 1. **Slot Machine Game**
```
Music: High-energy casino music
Effects:
- Reels spin on kick drums
- Win lights flash on snare
- Background pulses with bass
- Coins drop particles on high notes
```

### 2. **Rhythm Platformer**
```
Music: Electronic dance music
Effects:
- Platforms appear on beat
- Player jumps higher on kick
- Obstacles pulse with mid-range
- Background colors shift with frequency
```

### 3. **Music Video Game**
```
Music: User's favorite track
Effects:
- Characters dance to BPM
- Camera zooms on drops
- Particle effects on buildup
- Screen shake on bass
```

### 4. **Meme Generator with Sound**
```
Music: Viral TikTok audio
Effects:
- Emojis bounce to beat
- Text size pulses with bass
- Background flashes on drop
- Export as video with perfect sync
```

---

## Performance Optimizations

### 1. **Throttle Analysis**
```javascript
// Only analyze every 3rd frame
let frameCount = 0;
function shouldAnalyze() {
  return (frameCount++ % 3) === 0;
}
```

### 2. **Use OffscreenCanvas**
```javascript
const offscreen = canvas.transferControlToOffscreen();
const worker = new Worker('audio-worker.js');
worker.postMessage({ canvas: offscreen }, [offscreen]);
```

### 3. **Cache Beat Markers**
```javascript
const beatCache = new Map();
function getNearestBeat(time) {
  const cacheKey = Math.floor(time * 10);
  if (!beatCache.has(cacheKey)) {
    beatCache.set(cacheKey, findNearestBeat(time));
  }
  return beatCache.get(cacheKey);
}
```

### 4. **Reduce FFT Size for Lower Latency**
```javascript
// For real-time: 512 or 256
analyser.fftSize = 512; // Lower = faster, less detail

// For recording: 2048 or 4096
analyser.fftSize = 2048; // Higher = slower, more detail
```

---

## Implementation Timeline

### Week 1: Core Engine
- ✅ AudioReactiveEngine class
- ✅ Frequency band detection
- ✅ Beat classification (kick/snare/hihat)
- ✅ Basic visualizer

### Week 2: ThunderVerse Studio Integration
- ✅ Add audio upload UI
- ✅ Integrate reactive loop
- ✅ 5 effect presets
- ✅ Real-time preview

### Week 3: Game Creator Integration
- ✅ AudioReactiveControls component
- ✅ Level editor integration
- ✅ Entity behavior system
- ✅ Export with audio sync

### Week 4: Polish & Effects
- ✅ 10+ effect presets
- ✅ Custom effect builder
- ✅ Performance optimizations
- ✅ Tutorial/documentation

---

## Success Metrics

### User Engagement
- **Time to first sync**: < 30 seconds
- **Effect satisfaction**: > 4.5/5 stars
- **Feature usage**: > 60% of users try audio reactive mode

### Performance
- **FPS**: Maintain 60fps with audio reactive
- **Audio latency**: < 50ms from beat to visual
- **CPU usage**: < 30% on modern hardware

### Business
- **Export rate**: 3x more projects with audio
- **Session time**: 2x longer with music
- **Viral potential**: Audio-synced games share 5x more

---

## Next Steps

### Immediate (This Week)
1. **Test existing audio analysis** - Run on 10 different tracks
2. **Prototype frequency visualizer** - Add to ThunderVerse Studio
3. **Create 3 effect presets** - Pulse, Bounce, Color
4. **User feedback** - Show prototype to 5 users

### Short Term (Next 2 Weeks)
1. **Build AudioReactiveEngine** - Complete TypeScript implementation
2. **Integrate with canvas** - Apply effects to game assets
3. **Add export with audio** - Generate synced HTML
4. **Performance testing** - Ensure 60fps

### Medium Term (Next Month)
1. **10+ effect library** - Casino, visualizer, game effects
2. **Custom effect builder** - Let users create own effects
3. **AI suggestions** - Recommend effects based on music genre
4. **Community showcase** - Feature best audio-reactive games

---

## Conclusion

**The Vision**: Turn every game into a music visualizer, every soundtrack into an experience.

**The Reality**: You already have the infrastructure—audio analysis, beat detection, canvas rendering. We just need to connect them with real-time Web Audio API.

**The Impact**: Games that dance, characters that groove, experiences that sync perfectly—all without tedious manual editing.

**Ready to make games that feel the music! 🎵🎮⚡**

---

## Resources

### Web Audio API
- MDN: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API
- Tutorial: https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API

### Beat Detection
- Essentia.js (SuperFlux): Already referenced in QGame doc
- BeatDetektor: https://github.com/aadsm/JavaScript-ID3-Reader

### Inspiration
- Audiosurf: Game that generates tracks from music
- Beat Saber: VR rhythm game
- Crypt of the NecroDancer: Roguelike + rhythm game
- Geometry Dash: User-created rhythm platformers
