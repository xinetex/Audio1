/**
 * Sprite Video Generator
 * Creates 8-bit style video shorts from game sprites
 */

import ffmpeg from 'fluent-ffmpeg';
import { createCanvas, loadImage } from 'canvas';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { getUploadPath, getVideoPath } from '../utils/storage.js';

export interface SpriteFrame {
  sprite: string; // emoji or image URL
  x: number;
  y: number;
  width: number;
  height: number;
  rotation?: number;
  scale?: number;
  opacity?: number;
}

export interface VideoFrame {
  time: number; // timestamp in seconds
  sprites: SpriteFrame[];
  background?: string;
  effects?: {
    crtScanlines?: boolean;
    pixelate?: number;
    vhs?: boolean;
    glitch?: boolean;
  };
}

export interface SpriteVideoRequest {
  frames: VideoFrame[];
  audioFile?: string;
  settings: {
    width: number;
    height: number;
    fps: number;
    duration: number;
    background: string;
    effects?: {
      crtScanlines?: boolean;
      pixelate?: number;
      vhsNoise?: boolean;
      chromaAberration?: boolean;
    };
  };
}

export interface SpriteVideoResponse {
  videoUrl: string;
  duration: number;
  frameCount: number;
}

/**
 * Generate video from sprite animation frames
 */
export async function generateSpriteVideo(
  request: SpriteVideoRequest
): Promise<SpriteVideoResponse> {
  const { frames, audioFile, settings } = request;
  
  // Create temporary directory for frame images
  const tempDir = join(process.cwd(), 'outputs', 'temp', `sprite-${Date.now()}`);
  if (!existsSync(tempDir)) {
    mkdirSync(tempDir, { recursive: true });
  }

  // Generate all frames as images
  const frameCount = Math.ceil(settings.duration * settings.fps);
  const frameImages: string[] = [];

  for (let i = 0; i < frameCount; i++) {
    const timestamp = i / settings.fps;
    const frameData = interpolateFrame(frames, timestamp);
    const framePath = join(tempDir, `frame-${String(i).padStart(6, '0')}.png`);
    
    await renderFrameToImage(frameData, settings, framePath);
    frameImages.push(framePath);
  }

  // Compose video from frames
  const outputFilename = `sprite-video-${Date.now()}.mp4`;
  const outputPath = getVideoPath(outputFilename);

  await composeVideoFromFrames(frameImages, audioFile, outputPath, settings);

  // Get final duration
  const duration = await getVideoDuration(outputPath);

  return {
    videoUrl: `/outputs/videos/${outputFilename}`,
    duration,
    frameCount
  };
}

/**
 * Interpolate between keyframes to get sprite positions at specific time
 */
function interpolateFrame(frames: VideoFrame[], timestamp: number): VideoFrame {
  // Find surrounding keyframes
  let prevFrame: VideoFrame | null = null;
  let nextFrame: VideoFrame | null = null;

  for (let i = 0; i < frames.length; i++) {
    if (frames[i].time <= timestamp) {
      prevFrame = frames[i];
    }
    if (frames[i].time > timestamp && !nextFrame) {
      nextFrame = frames[i];
      break;
    }
  }

  // If before first frame or after last frame, return closest
  if (!prevFrame) return frames[0];
  if (!nextFrame) return frames[frames.length - 1];

  // Interpolate between frames
  const t = (timestamp - prevFrame.time) / (nextFrame.time - prevFrame.time);
  
  return {
    time: timestamp,
    sprites: prevFrame.sprites.map((sprite, i) => {
      const nextSprite = nextFrame!.sprites[i];
      if (!nextSprite) return sprite;

      return {
        sprite: sprite.sprite,
        x: lerp(sprite.x, nextSprite.x, t),
        y: lerp(sprite.y, nextSprite.y, t),
        width: sprite.width,
        height: sprite.height,
        rotation: lerp(sprite.rotation || 0, nextSprite.rotation || 0, t),
        scale: lerp(sprite.scale || 1, nextSprite.scale || 1, t),
        opacity: lerp(sprite.opacity || 1, nextSprite.opacity || 1, t)
      };
    }),
    background: prevFrame.background,
    effects: prevFrame.effects
  };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Render a single frame to PNG image with 8-bit effects
 */
async function renderFrameToImage(
  frame: VideoFrame,
  settings: SpriteVideoRequest['settings'],
  outputPath: string
): Promise<void> {
  const canvas = createCanvas(settings.width, settings.height);
  const ctx = canvas.getContext('2d');

  // Draw background
  ctx.fillStyle = frame.background || settings.background;
  ctx.fillRect(0, 0, settings.width, settings.height);

  // Draw sprites
  for (const sprite of frame.sprites) {
    ctx.save();
    
    // Apply transformations
    ctx.globalAlpha = sprite.opacity || 1;
    ctx.translate(sprite.x + sprite.width / 2, sprite.y + sprite.height / 2);
    if (sprite.rotation) ctx.rotate(sprite.rotation);
    if (sprite.scale) ctx.scale(sprite.scale, sprite.scale);
    ctx.translate(-(sprite.width / 2), -(sprite.height / 2));

    // Draw sprite (emoji or image)
    if (sprite.sprite && sprite.sprite.length <= 2) {
      // Emoji
      ctx.font = `${sprite.height}px Arial`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sprite.sprite, sprite.width / 2, sprite.height / 2);
    } else if (sprite.sprite) {
      // Image URL
      try {
        const img = await loadImage(sprite.sprite);
        ctx.drawImage(img, 0, 0, sprite.width, sprite.height);
      } catch (err) {
        console.error('Failed to load sprite image:', sprite.sprite);
      }
    }

    ctx.restore();
  }

  // Apply 8-bit effects
  if (settings.effects?.crtScanlines || frame.effects?.crtScanlines) {
    applyScanlines(ctx, settings.width, settings.height);
  }

  if (settings.effects?.pixelate || frame.effects?.pixelate) {
    const pixelSize = settings.effects?.pixelate || frame.effects?.pixelate || 4;
    applyPixelation(ctx, settings.width, settings.height, pixelSize);
  }

  // Save frame
  const buffer = canvas.toBuffer('image/png');
  writeFileSync(outputPath, buffer);
}

/**
 * Apply CRT scanline effect
 */
function applyScanlines(ctx: any, width: number, height: number): void {
  ctx.globalAlpha = 0.15;
  ctx.fillStyle = '#000000';
  
  for (let y = 0; y < height; y += 2) {
    ctx.fillRect(0, y, width, 1);
  }
  
  ctx.globalAlpha = 1.0;
}

/**
 * Apply pixelation effect (downscale then upscale)
 */
function applyPixelation(ctx: any, width: number, height: number, pixelSize: number): void {
  const imageData = ctx.getImageData(0, 0, width, height);
  
  // Downscale
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      const idx = (y * width + x) * 4;
      const r = imageData.data[idx];
      const g = imageData.data[idx + 1];
      const b = imageData.data[idx + 2];
      
      // Fill block with average color
      for (let dy = 0; dy < pixelSize && y + dy < height; dy++) {
        for (let dx = 0; dx < pixelSize && x + dx < width; dx++) {
          const blockIdx = ((y + dy) * width + (x + dx)) * 4;
          imageData.data[blockIdx] = r;
          imageData.data[blockIdx + 1] = g;
          imageData.data[blockIdx + 2] = b;
        }
      }
    }
  }
  
  ctx.putImageData(imageData, 0, 0);
}

/**
 * Compose video from frame images using FFmpeg
 */
async function composeVideoFromFrames(
  framePaths: string[],
  audioFile: string | undefined,
  outputPath: string,
  settings: SpriteVideoRequest['settings']
): Promise<void> {
  return new Promise((resolve, reject) => {
    const command = ffmpeg();

    // Use pattern matching for frame sequence
    const framePattern = join(framePaths[0].replace(/frame-\d+\.png$/, 'frame-%06d.png'));
    
    command.input(framePattern)
      .inputFPS(settings.fps);

    // Add audio if provided
    if (audioFile) {
      const audioPath = getUploadPath(audioFile);
      if (existsSync(audioPath)) {
        command.input(audioPath);
      }
    }

    // Apply video filters for retro effects
    const filters: string[] = [];
    
    if (settings.effects?.chromaAberration) {
      filters.push('chromashift=cbh=-3:crh=3');
    }

    if (settings.effects?.vhsNoise) {
      filters.push('noise=alls=10:allf=t+u');
    }

    const videoFilters = filters.length > 0 ? filters.join(',') : null;

    command
      .outputOptions([
        `-r ${settings.fps}`,
        '-pix_fmt yuv420p',
        '-c:v libx264',
        '-preset medium',
        '-crf 23',
      ]);

    if (videoFilters) {
      command.videoFilters(videoFilters);
    }

    if (audioFile) {
      command.outputOptions([
        '-c:a aac',
        '-b:a 192k',
        '-shortest'
      ]);
    }

    command
      .output(outputPath)
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .run();
  });
}

/**
 * Get video duration using FFprobe
 */
function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

/**
 * Helper: Create simple game trailer from sprite sequence
 */
export async function createGameTrailer(
  sprites: { player: string; ghosts: string[]; pellets: string[] },
  settings: {
    width: number;
    height: number;
    duration: number;
    audioFile?: string;
  }
): Promise<SpriteVideoResponse> {
  const frames: VideoFrame[] = [];
  const fps = 30;

  // Intro: Player appears (0-1s)
  frames.push({
    time: 0,
    sprites: [{
      sprite: sprites.player,
      x: settings.width / 2 - 32,
      y: settings.height / 2 - 32,
      width: 64,
      height: 64,
      scale: 0,
      opacity: 0
    }],
    background: '#0a0014'
  });

  frames.push({
    time: 1,
    sprites: [{
      sprite: sprites.player,
      x: settings.width / 2 - 32,
      y: settings.height / 2 - 32,
      width: 64,
      height: 64,
      scale: 1,
      opacity: 1
    }],
    background: '#0a0014'
  });

  // Ghosts appear (1-2s)
  frames.push({
    time: 2,
    sprites: [
      {
        sprite: sprites.player,
        x: settings.width / 2 - 32,
        y: settings.height / 2 - 32,
        width: 64,
        height: 64,
        scale: 1,
        opacity: 1
      },
      ...sprites.ghosts.map((ghost, i) => ({
        sprite: ghost,
        x: 100 + i * 150,
        y: 100,
        width: 48,
        height: 48,
        scale: 1,
        opacity: 1
      }))
    ],
    background: '#0a0014',
    effects: { crtScanlines: true }
  });

  // Action sequence (2-4s)
  frames.push({
    time: 4,
    sprites: [
      {
        sprite: sprites.player,
        x: settings.width - 100,
        y: settings.height - 100,
        width: 64,
        height: 64,
        scale: 1.2,
        opacity: 1,
        rotation: Math.PI / 4
      },
      ...sprites.ghosts.map((ghost, i) => ({
        sprite: ghost,
        x: 50 + i * 100,
        y: settings.height - 150,
        width: 48,
        height: 48,
        scale: 0.8,
        opacity: 0.7
      }))
    ],
    background: '#0a0014',
    effects: { crtScanlines: true, pixelate: 2 }
  });

  return generateSpriteVideo({
    frames,
    audioFile: settings.audioFile,
    settings: {
      width: settings.width,
      height: settings.height,
      fps,
      duration: settings.duration,
      background: '#0a0014',
      effects: {
        crtScanlines: true,
        vhsNoise: false,
        chromaAberration: false
      }
    }
  });
}
