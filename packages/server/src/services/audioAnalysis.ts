import ffmpeg from 'fluent-ffmpeg';
import { readFileSync } from 'fs';
import type { AudioAnalysis, BeatInfo, AudioSegment } from '@audiovisual-art-tool/shared';

/**
 * Analyzes audio file to extract beats, tempo, and segments
 */
export async function analyzeAudio(filePath: string): Promise<AudioAnalysis> {
  const duration = await getAudioDuration(filePath);
  const audioBuffer = await decodeAudioFile(filePath);
  
  // Detect beats using simple energy-based algorithm
  const beats = detectBeats(audioBuffer, duration);
  
  // Calculate BPM from detected beats
  const bpm = calculateBPM(beats);
  
  // Create segments based on beats
  const segments = createSegments(beats, duration);

  return {
    duration,
    bpm,
    beats,
    segments,
  };
}

function getAudioDuration(filePath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata.format.duration || 0);
      }
    });
  });
}

async function decodeAudioFile(filePath: string): Promise<Float32Array> {
  // This is a simplified version. In production, you'd use proper audio decoding
  // For now, we'll create a mock analysis based on file reading
  return new Promise((resolve, reject) => {
    try {
      // Read file to get some basic data
      const buffer = readFileSync(filePath);
      
      // Create mock audio buffer for beat detection
      // In production, use proper audio decoding library
      const samples = new Float32Array(buffer.length);
      for (let i = 0; i < samples.length; i++) {
        samples[i] = (buffer[i] - 128) / 128;
      }
      
      resolve(samples);
    } catch (error) {
      reject(error);
    }
  });
}

function detectBeats(audioBuffer: Float32Array, duration: number): BeatInfo[] {
  const beats: BeatInfo[] = [];
  const sampleRate = audioBuffer.length / duration;
  const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
  const hopSize = Math.floor(windowSize / 2);
  
  // Calculate energy for each window
  const energies: number[] = [];
  for (let i = 0; i < audioBuffer.length - windowSize; i += hopSize) {
    let energy = 0;
    for (let j = 0; j < windowSize; j++) {
      energy += Math.abs(audioBuffer[i + j]);
    }
    energies.push(energy / windowSize);
  }
  
  // Find peaks in energy (potential beats)
  const threshold = energies.reduce((a, b) => a + b, 0) / energies.length * 1.5;
  
  for (let i = 1; i < energies.length - 1; i++) {
    const energy = energies[i];
    const prevEnergy = energies[i - 1];
    const nextEnergy = energies[i + 1];
    
    // Peak detection
    if (energy > threshold && energy > prevEnergy && energy > nextEnergy) {
      const time = (i * hopSize) / sampleRate;
      beats.push({
        time,
        confidence: Math.min((energy / threshold), 1),
        energy,
      });
    }
  }
  
  return beats;
}

function calculateBPM(beats: BeatInfo[]): number {
  if (beats.length < 2) return 120; // Default BPM
  
  // Calculate intervals between consecutive beats
  const intervals: number[] = [];
  for (let i = 1; i < beats.length; i++) {
    intervals.push(beats[i].time - beats[i - 1].time);
  }
  
  // Calculate average interval
  const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  
  // Convert to BPM
  return Math.round(60 / avgInterval);
}

function createSegments(beats: BeatInfo[], duration: number): AudioSegment[] {
  const segments: AudioSegment[] = [];
  
  for (let i = 0; i < beats.length; i++) {
    const startTime = beats[i].time;
    const endTime = i < beats.length - 1 ? beats[i + 1].time : duration;
    
    segments.push({
      startTime,
      endTime,
      intensity: beats[i].energy,
      features: {
        energy: beats[i].energy,
      },
    });
  }
  
  return segments;
}
