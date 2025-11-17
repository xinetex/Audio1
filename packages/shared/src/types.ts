export interface BeatInfo {
  time: number; // Time in seconds
  confidence: number;
  energy: number;
}

export interface AudioAnalysis {
  duration: number;
  bpm: number;
  beats: BeatInfo[];
  segments: AudioSegment[];
}

export interface AudioSegment {
  startTime: number;
  endTime: number;
  intensity: number;
  features: {
    energy: number;
    spectralCentroid?: number;
    spectralRolloff?: number;
  };
}

export interface KeyFrame {
  id: string;
  time: number;
  prompt: string;
  style: string;
  intensity: number;
  transition: TransitionType;
  transitionDuration: number;
}

export type TransitionType = 'fade' | 'dissolve' | 'cut' | 'zoom' | 'slide';

export interface VideoProject {
  id: string;
  name: string;
  audioFile: string;
  audioAnalysis?: AudioAnalysis;
  keyFrames: KeyFrame[];
  settings: ProjectSettings;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectSettings {
  resolution: {
    width: number;
    height: number;
  };
  fps: number;
  autoGenerateOnBeats: boolean;
  defaultStyle: string;
  defaultTransition: TransitionType;
}

export type ProjectStatus = 
  | 'idle'
  | 'analyzing_audio'
  | 'generating_images'
  | 'composing_video'
  | 'completed'
  | 'error';

export interface GenerateImageRequest {
  prompt: string;
  style: string;
  width: number;
  height: number;
  seed?: number;
}

export interface GenerateImageResponse {
  imageUrl: string;
  seed: number;
}

export interface ComposeVideoRequest {
  projectId: string;
  audioFile: string;
  keyFrames: KeyFrame[];
  settings: ProjectSettings;
}

export interface ComposeVideoResponse {
  videoUrl: string;
  duration: number;
}
