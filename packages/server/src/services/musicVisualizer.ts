/**
 * Music Visualizer Engine
 * Audio-reactive sprite animations with effect recipes
 */

import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getUploadPath, getVideoPath } from '../utils/storage.js';
import { analyzeAudio } from './audioAnalysis.js';

export interface VisualizerSprite {
  sprite: string; // emoji or image URL
  behavior: SpriteBehavior;
  baseSize: number;
}

export type SpriteBehavior = 
  | 'pulse' // Scale with bass
  | 'spin' // Rotate with beats
  | 'bounce' // Jump on beats
  | 'wave' // Sine wave motion
  | 'scatter' // Explode/contract with energy
  | 'orbit' // Circle around center
  | 'rain' // Fall from top
  | 'shake' // Vibrate with high frequencies;

export interface VisualizerRecipe {
  name: string;
  description: string;
  sprites: VisualizerSprite[];
  effects: {
    background: 'solid' | 'gradient' | 'radial' | 'pulse';
    backgroundColor: string;
    secondaryColor?: string;
    particles: boolean;
    trails: boolean;
    bloom: boolean;
    chromatic: boolean;
    scanlines: boolean;
    vignette: boolean;
  };
  audioReactivity: {
    bassIntensity: number; // 0-2
    midIntensity: number; // 0-2
    highIntensity: number; // 0-2
    beatSensitivity: number; // 0-1
  };
}

export interface VisualizerRequest {
  audioFile: string;
  recipe: VisualizerRecipe;
  settings: {
    width: number;
    height: number;
    fps: number;
    duration?: number; // Optional, auto-detect from audio
  };
}

export interface VisualizerResponse {
  videoUrl: string;
  duration: number;
  frameCount: number;
  audioAnalysis: {
    bpm: number;
    beats: number[];
    energy: number[];
  };
}

/**
 * Preset visualizer recipes for common meme coin styles
 */
export const VISUALIZER_RECIPES: Record<string, VisualizerRecipe> = {
  'meme-pump': {
    name: '🚀 Moon Shot',
    description: 'Rockets and coins pumping to the moon',
    sprites: [
      { sprite: '🚀', behavior: 'pulse', baseSize: 64 },
      { sprite: '💎', behavior: 'orbit', baseSize: 48 },
      { sprite: '📈', behavior: 'bounce', baseSize: 56 },
      { sprite: '🌙', behavior: 'wave', baseSize: 72 }
    ],
    effects: {
      background: 'radial',
      backgroundColor: '#0a0014',
      secondaryColor: '#7209b7',
      particles: true,
      trails: true,
      bloom: true,
      chromatic: false,
      scanlines: true,
      vignette: true
    },
    audioReactivity: {
      bassIntensity: 1.5,
      midIntensity: 1.0,
      highIntensity: 0.8,
      beatSensitivity: 0.7
    }
  },

  'party-mode': {
    name: '🎉 Party Vibes',
    description: 'High energy celebration mode',
    sprites: [
      { sprite: '🎉', behavior: 'scatter', baseSize: 48 },
      { sprite: '⭐', behavior: 'rain', baseSize: 32 },
      { sprite: '💥', behavior: 'pulse', baseSize: 64 },
      { sprite: '🔥', behavior: 'spin', baseSize: 56 }
    ],
    effects: {
      background: 'pulse',
      backgroundColor: '#ff006e',
      secondaryColor: '#00f5ff',
      particles: true,
      trails: false,
      bloom: true,
      chromatic: true,
      scanlines: false,
      vignette: false
    },
    audioReactivity: {
      bassIntensity: 2.0,
      midIntensity: 1.5,
      highIntensity: 1.2,
      beatSensitivity: 0.9
    }
  },

  'chill-vibes': {
    name: '🌊 Chill Wave',
    description: 'Smooth flowing animations',
    sprites: [
      { sprite: '🌊', behavior: 'wave', baseSize: 64 },
      { sprite: '✨', behavior: 'orbit', baseSize: 24 },
      { sprite: '🎵', behavior: 'bounce', baseSize: 48 },
      { sprite: '💫', behavior: 'rain', baseSize: 32 }
    ],
    effects: {
      background: 'gradient',
      backgroundColor: '#0a0014',
      secondaryColor: '#667eea',
      particles: false,
      trails: true,
      bloom: true,
      chromatic: false,
      scanlines: true,
      vignette: true
    },
    audioReactivity: {
      bassIntensity: 0.8,
      midIntensity: 1.0,
      highIntensity: 0.6,
      beatSensitivity: 0.4
    }
  },

  'retro-arcade': {
    name: '👾 Retro Arcade',
    description: '8-bit gaming nostalgia',
    sprites: [
      { sprite: '👾', behavior: 'bounce', baseSize: 56 },
      { sprite: '🎮', behavior: 'shake', baseSize: 48 },
      { sprite: '⚡', behavior: 'pulse', baseSize: 40 },
      { sprite: '🏆', behavior: 'spin', baseSize: 52 }
    ],
    effects: {
      background: 'solid',
      backgroundColor: '#1a0f2e',
      particles: false,
      trails: false,
      bloom: false,
      chromatic: true,
      scanlines: true,
      vignette: true
    },
    audioReactivity: {
      bassIntensity: 1.2,
      midIntensity: 1.0,
      highIntensity: 0.9,
      beatSensitivity: 0.8
    }
  },

  'crypto-chaos': {
    name: '💰 Crypto Chaos',
    description: 'Wild market volatility energy',
    sprites: [
      { sprite: '💰', behavior: 'scatter', baseSize: 48 },
      { sprite: '📊', behavior: 'shake', baseSize: 56 },
      { sprite: '🔥', behavior: 'pulse', baseSize: 64 },
      { sprite: '💎', behavior: 'orbit', baseSize: 40 }
    ],
    effects: {
      background: 'radial',
      backgroundColor: '#000000',
      secondaryColor: '#00ff00',
      particles: true,
      trails: true,
      bloom: true,
      chromatic: true,
      scanlines: false,
      vignette: true
    },
    audioReactivity: {
      bassIntensity: 1.8,
      midIntensity: 1.3,
      highIntensity: 1.0,
      beatSensitivity: 0.85
    }
  }
};

/**
 * Generate music visualizer video
 */
export async function generateMusicVisualizer(
  request: VisualizerRequest
): Promise<VisualizerResponse> {
  const { audioFile, recipe, settings } = request;
  
  // Analyze audio for beats and energy
  const audioPath = getUploadPath(audioFile);
  if (!existsSync(audioPath)) {
    throw new Error('Audio file not found');
  }

  const audioAnalysis = await analyzeAudio(audioPath);
  const duration = settings.duration || audioAnalysis.duration;

  // Create temporary directory for frame images
  const tempDir = join(process.cwd(), 'outputs', 'temp', `visualizer-${Date.now()}`);
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // Generate frames
  const frameCount = Math.ceil(duration * settings.fps);
  const frameImages: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const timestamp = i / settings.fps;
    const framePath = join(tempDir, `frame-${String(i).padStart(6, '0')}.png`);
    
    await renderVisualizerFrame(
      timestamp,
      audioAnalysis,
      recipe,
      settings,
      framePath
    );
    
    frameImages.push(framePath);
  }

  // Compose video with audio
  const outputFilename = `visualizer-${Date.now()}.mp4`;
  const outputPath = getVideoPath(outputFilename);

  await composeVisualizerVideo(frameImages, audioPath, outputPath, settings);

  return {
    videoUrl: `/outputs/videos/${outputFilename}`,
    duration,
    frameCount,
    audioAnalysis: {
      bpm: audioAnalysis.bpm,
      beats: audioAnalysis.beats,
      energy: audioAnalysis.segments.map(s => s.energy)
    }
  };
}

/**
 * Render a single visualizer frame with audio-reactive sprites
 */
async function renderVisualizerFrame(
  timestamp: number,
  audioAnalysis: any,
  recipe: VisualizerRecipe,
  settings: VisualizerRequest['settings'],
  outputPath: string
): Promise<void> {
  const canvas = createCanvas(settings.width, settings.height);
  const ctx = canvas.getContext('2d');

  // Get audio energy at this timestamp
  const energy = getEnergyAtTime(timestamp, audioAnalysis);
  const isBeat = isBeatAtTime(timestamp, audioAnalysis, recipe.audioReactivity.beatSensitivity);

  // Draw background
  drawBackground(ctx, settings.width, settings.height, recipe.effects, energy, timestamp);

  // Draw particles if enabled
  if (recipe.effects.particles) {
    drawParticles(ctx, settings.width, settings.height, energy, timestamp);
  }

  // Draw sprites with behaviors
  for (let i = 0; i < recipe.sprites.length; i++) {
    const sprite = recipe.sprites[i];
    await drawReactiveSprite(
      ctx,
      sprite,
      i,
      recipe.sprites.length,
      timestamp,
      energy,
      isBeat,
      recipe.audioReactivity,
      settings.width,
      settings.height
    );
  }

  // Apply post-processing effects
  if (recipe.effects.bloom) {
    applyBloom(ctx, settings.width, settings.height);
  }

  if (recipe.effects.scanlines) {
    applyScanlines(ctx, settings.width, settings.height);
  }

  if (recipe.effects.vignette) {
    applyVignette(ctx, settings.width, settings.height);
  }

  // Save frame
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
}

/**
 * Get audio energy at specific timestamp
 */
function getEnergyAtTime(timestamp: number, audioAnalysis: any): number {
  const segment = audioAnalysis.segments.find((s: any) => 
    timestamp >= s.start && timestamp < s.start + s.duration
  );
  return segment ? segment.energy : 0.5;
}

/**
 * Check if there's a beat at timestamp
 */
function isBeatAtTime(timestamp: number, audioAnalysis: any, sensitivity: number): boolean {
  const threshold = 0.1 / sensitivity;
  return audioAnalysis.beats.some((beatTime: number) => 
    Math.abs(beatTime - timestamp) < threshold
  );
}

/**
 * Draw audio-reactive background
 */
function drawBackground(
  ctx: any,
  width: number,
  height: number,
  effects: VisualizerRecipe['effects'],
  energy: number,
  timestamp: number
): void {
  const centerX = width / 2;
  const centerY = height / 2;

  switch (effects.background) {
    case 'solid':
      ctx.fillStyle = effects.backgroundColor;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'gradient':
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, effects.backgroundColor);
      gradient.addColorStop(1, effects.secondaryColor || effects.backgroundColor);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'radial':
      const radialGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, Math.max(width, height) * (0.5 + energy * 0.3)
      );
      radialGradient.addColorStop(0, effects.secondaryColor || '#7209b7');
      radialGradient.addColorStop(1, effects.backgroundColor);
      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);
      break;

    case 'pulse':
      const pulseColor = lerpColor(
        effects.backgroundColor,
        effects.secondaryColor || '#ff006e',
        energy * 0.5
      );
      ctx.fillStyle = pulseColor;
      ctx.fillRect(0, 0, width, height);
      break;
  }
}

/**
 * Draw particle effects
 */
function drawParticles(
  ctx: any,
  width: number,
  height: number,
  energy: number,
  timestamp: number
): void {
  const particleCount = Math.floor(20 + energy * 30);
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  
  for (let i = 0; i < particleCount; i++) {
    const seed = i * 123.456;
    const x = (Math.sin(timestamp * 0.5 + seed) * 0.5 + 0.5) * width;
    const y = (Math.cos(timestamp * 0.3 + seed * 1.5) * 0.5 + 0.5) * height;
    const size = 2 + energy * 4;
    
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Draw sprite with audio-reactive behavior
 */
async function drawReactiveSprite(
  ctx: any,
  sprite: VisualizerSprite,
  index: number,
  totalSprites: number,
  timestamp: number,
  energy: number,
  isBeat: boolean,
  reactivity: VisualizerRecipe['audioReactivity'],
  width: number,
  height: number
): Promise<void> {
  const centerX = width / 2;
  const centerY = height / 2;
  let x = centerX;
  let y = centerY;
  let scale = 1;
  let rotation = 0;
  let opacity = 1;

  // Apply behavior
  switch (sprite.behavior) {
    case 'pulse':
      scale = 1 + (energy * reactivity.bassIntensity) * 0.5;
      if (isBeat) scale *= 1.3;
      break;

    case 'spin':
      rotation = timestamp * Math.PI * (1 + energy * reactivity.midIntensity);
      scale = 1 + energy * 0.2;
      break;

    case 'bounce':
      const bouncePhase = timestamp * 2 + (index / totalSprites) * Math.PI * 2;
      y = centerY - Math.abs(Math.sin(bouncePhase)) * 100 * (1 + energy * reactivity.bassIntensity);
      if (isBeat) y -= 50;
      break;

    case 'wave':
      const wavePhase = timestamp * 2 + (index / totalSprites) * Math.PI * 2;
      x = centerX + Math.sin(wavePhase) * 150 * (1 + energy * 0.5);
      y = centerY + Math.cos(wavePhase * 0.7) * 100;
      break;

    case 'scatter':
      const angle = (index / totalSprites) * Math.PI * 2;
      const distance = 100 + energy * 200 * reactivity.bassIntensity;
      x = centerX + Math.cos(angle) * distance;
      y = centerY + Math.sin(angle) * distance;
      scale = 1 + energy * 0.5;
      break;

    case 'orbit':
      const orbitAngle = timestamp * Math.PI + (index / totalSprites) * Math.PI * 2;
      const orbitRadius = 150 + energy * 50 * reactivity.midIntensity;
      x = centerX + Math.cos(orbitAngle) * orbitRadius;
      y = centerY + Math.sin(orbitAngle) * orbitRadius;
      break;

    case 'rain':
      const fallSpeed = 200;
      const xOffset = (index / totalSprites) * width;
      x = xOffset;
      y = ((timestamp * fallSpeed + index * 100) % (height + 100)) - 50;
      opacity = 0.7 + energy * 0.3;
      break;

    case 'shake':
      const shakeAmount = 10 * energy * reactivity.highIntensity;
      x = centerX + (Math.random() - 0.5) * shakeAmount;
      y = centerY + (Math.random() - 0.5) * shakeAmount;
      if (isBeat) {
        x += (Math.random() - 0.5) * 30;
        y += (Math.random() - 0.5) * 30;
      }
      break;
  }

  // Draw sprite
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.translate(x, y);
  ctx.rotate(rotation);
  ctx.scale(scale, scale);

  const size = sprite.baseSize;

  if (sprite.sprite.length <= 2) {
    // Emoji
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sprite.sprite, 0, 0);
  } else {
    // Image
    try {
      const img = await loadImage(sprite.sprite);
      ctx.drawImage(img, -size / 2, -size / 2, size, size);
    } catch (err) {
      // Fallback to placeholder
      ctx.fillStyle = '#7209b7';
      ctx.fillRect(-size / 2, -size / 2, size, size);
    }
  }

  ctx.restore();
}

/**
 * Apply bloom glow effect
 */
function applyBloom(ctx: any, width: number, height: number): void {
  ctx.globalCompositeOperation = 'screen';
  ctx.globalAlpha = 0.3;
  ctx.filter = 'blur(10px)';
  ctx.drawImage(ctx.canvas, 0, 0);
  ctx.filter = 'none';
  ctx.globalCompositeOperation = 'source-over';
  ctx.globalAlpha = 1.0;
}

/**
 * Apply CRT scanlines
 */
function applyScanlines(ctx: any, width: number, height: number): void {
  ctx.globalAlpha = 0.1;
  ctx.fillStyle = '#000000';
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1);
  }
  ctx.globalAlpha = 1.0;
}

/**
 * Apply vignette effect
 */
function applyVignette(ctx: any, width: number, height: number): void {
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(width, height) * 0.7;

  const gradient = ctx.createRadialGradient(centerX, centerY, radius * 0.3, centerX, centerY, radius);
  gradient.addColorStop(0, 'rgba(0, 0, 0, 0)');
  gradient.addColorStop(1, 'rgba(0, 0, 0, 0.7)');

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}

/**
 * Linear interpolate between colors
 */
function lerpColor(color1: string, color2: string, t: number): string {
  // Simple hex color lerp (basic implementation)
  return color1; // Simplified for now
}

/**
 * Compose final video with FFmpeg
 */
async function composeVisualizerVideo(
  framePaths: string[],
  audioPath: string,
  outputPath: string,
  settings: VisualizerRequest['settings']
): Promise<void> {
  return new Promise((resolve, reject) => {
    const framePattern = framePaths[0].replace(/frame-\d+\.png$/, 'frame-%06d.png');

    ffmpeg()
      .input(framePattern)
      .inputFPS(settings.fps)
      .input(audioPath)
      .outputOptions([
        `-r ${settings.fps}`,
        '-pix_fmt yuv420p',
        '-c:v libx264',
        '-preset medium',
        '-crf 20',
        '-c:a aac',
        '-b:a 192k',
        '-shortest'
      ])
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}
