import { spawn } from 'child_process';
import path from 'path';

export interface AudioAnalysisResult {
  duration: number;
  tempo: number;
  musicalKey: string;
  energy: number;
  mood: string;
  beats: number[];
  onsets: number[];
  structure: Array<{
    type: string;
    startTime: number;
    endTime: number;
  }>;
  spectralFeatures: {
    brightness: number;
    timbre: number;
    contrast: number[];
  };
  detailedFeatures?: {
    rmsEnergy: number[];
    zeroCrossingRate: number[];
    spectralCentroids: number[];
    spectralRolloff: number[];
    chroma: number[][];
  };
}

/**
 * Analyze audio file using Python librosa
 * @param audioFilePath - Absolute path to the audio file
 * @returns Promise with analysis results
 */
export async function analyzeAudioFile(audioFilePath: string): Promise<AudioAnalysisResult> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(__dirname, 'audio_analyzer.py');
    
    // Spawn Python process
    const pythonProcess = spawn('python3', [scriptPath, audioFilePath]);
    
    let stdout = '';
    let stderr = '';
    
    pythonProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });
    
    pythonProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });
    
    pythonProcess.on('close', (code) => {
      if (code !== 0) {
        console.error('[Audio Analysis] Python stderr:', stderr);
        reject(new Error(`Audio analysis failed with code ${code}: ${stderr}`));
        return;
      }
      
      try {
        const result = JSON.parse(stdout);
        
        if (result.error) {
          reject(new Error(`Audio analysis error: ${result.error}`));
          return;
        }
        
        resolve(result as AudioAnalysisResult);
      } catch (error) {
        console.error('[Audio Analysis] Failed to parse output:', stdout);
        reject(new Error(`Failed to parse analysis results: ${error}`));
      }
    });
    
    pythonProcess.on('error', (error) => {
      reject(new Error(`Failed to start Python process: ${error.message}`));
    });
  });
}

/**
 * Generate video prompts based on music analysis
 * @param analysis - Music analysis results
 * @returns Array of prompts for video segments
 */
export function generateVideoPrompts(analysis: AudioAnalysisResult): Array<{
  segmentIndex: number;
  startTime: number;
  endTime: number;
  prompt: string;
}> {
  const prompts: Array<{
    segmentIndex: number;
    startTime: number;
    endTime: number;
    prompt: string;
  }> = [];
  
  const { tempo, energy, mood, structure } = analysis;
  
  // Define visual styles based on mood
  const moodStyles: Record<string, string> = {
    energetic: 'vibrant colors, dynamic movement, high-energy action',
    calm: 'soft pastel colors, gentle movement, serene atmosphere',
    dark: 'low-key lighting, mysterious shadows, moody atmosphere',
    uplifting: 'warm golden tones, ascending camera movement, bright atmosphere',
    dreamy: 'ethereal lighting, soft focus, floating elements',
    balanced: 'natural colors, steady movement, balanced composition'
  };
  
  // Define camera movements based on tempo
  const getCameraMovement = (bpm: number): string => {
    if (bpm < 80) return 'slow dolly movement, contemplative pacing';
    if (bpm < 120) return 'steady camera movement, natural pacing';
    return 'dynamic camera movement, rapid cuts, energetic pacing';
  };
  
  // Define environments based on segment type
  const segmentEnvironments: Record<string, string[]> = {
    intro: [
      'misty mountain landscape at dawn',
      'vast desert with rolling dunes',
      'futuristic cityscape at night',
      'serene forest with sunlight filtering through trees'
    ],
    verse: [
      'urban street with neon lights',
      'coastal cliff overlooking the ocean',
      'abstract geometric space',
      'lush garden with flowing water'
    ],
    chorus: [
      'grand canyon with dramatic lighting',
      'city rooftop at sunset',
      'cosmic nebula with swirling colors',
      'waterfall cascading into a pool'
    ],
    bridge: [
      'abandoned industrial space',
      'surreal dreamscape',
      'underground cave with crystals',
      'floating islands in the sky'
    ],
    outro: [
      'horizon at twilight',
      'peaceful lake reflecting stars',
      'fading into clouds',
      'empty road stretching into distance'
    ],
    main: [
      'dynamic urban environment',
      'natural landscape with movement',
      'abstract visual patterns',
      'architectural spaces'
    ]
  };
  
  const style = moodStyles[mood] || moodStyles.balanced;
  const cameraMovement = getCameraMovement(tempo);
  
  structure.forEach((segment, index) => {
    const environments = segmentEnvironments[segment.type] || segmentEnvironments.main;
    const environment = environments[index % environments.length];
    
    // Determine intensity based on energy
    const intensity = energy > 0.15 ? 'intense, dramatic' : energy > 0.08 ? 'moderate, engaging' : 'subtle, gentle';
    
    // Build prompt
    const prompt = `Cinematic ${segment.type} scene featuring ${environment}, ${cameraMovement}, ${style}, ${intensity}, photorealistic, high quality, 4K`;
    
    prompts.push({
      segmentIndex: index,
      startTime: segment.startTime,
      endTime: segment.endTime,
      prompt
    });
  });
  
  return prompts;
}
