#!/usr/bin/env python3
"""
Audio Analysis Engine for Music Video Generator
Analyzes audio files to extract tempo, beats, energy, mood, and structure
"""

import sys
import json
import numpy as np
import librosa
import warnings
warnings.filterwarnings('ignore')

def analyze_audio(audio_path):
    """
    Comprehensive audio analysis using librosa
    Returns detailed analysis results as JSON
    """
    try:
        # Load audio file
        y, sr = librosa.load(audio_path, sr=22050, mono=True)
        duration = librosa.get_duration(y=y, sr=sr)
        
        # Tempo and beat tracking
        tempo, beat_frames = librosa.beat.beat_track(y=y, sr=sr)
        beat_times = librosa.frames_to_time(beat_frames, sr=sr).tolist()
        
        # Onset detection for rhythm changes
        onset_env = librosa.onset.onset_strength(y=y, sr=sr)
        onset_frames = librosa.onset.onset_detect(onset_envelope=onset_env, sr=sr)
        onset_times = librosa.frames_to_time(onset_frames, sr=sr).tolist()
        
        # Spectral features
        spectral_centroids = librosa.feature.spectral_centroid(y=y, sr=sr)[0]
        spectral_rolloff = librosa.feature.spectral_rolloff(y=y, sr=sr)[0]
        spectral_contrast = librosa.feature.spectral_contrast(y=y, sr=sr)
        
        # Chroma features for harmony
        chroma = librosa.feature.chroma_stft(y=y, sr=sr)
        
        # Energy analysis (RMS)
        rms = librosa.feature.rms(y=y)[0]
        
        # Zero crossing rate
        zcr = librosa.feature.zero_crossing_rate(y)[0]
        
        # Calculate aggregate features
        brightness = float(np.mean(spectral_centroids))
        timbre = float(np.mean(spectral_rolloff))
        contrast = spectral_contrast.mean(axis=1).tolist()
        energy = float(np.mean(rms))
        
        # Estimate key using chroma features
        chroma_mean = chroma.mean(axis=1)
        key_index = int(np.argmax(chroma_mean))
        keys = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
        estimated_key = keys[key_index]
        
        # Determine mood based on features
        mood = determine_mood(tempo, energy, brightness)
        
        # Structural segmentation
        structure = segment_structure(y, sr, beat_times, duration)
        
        # Prepare analysis results
        analysis = {
            "duration": float(duration),
            "tempo": float(tempo),
            "musicalKey": estimated_key,
            "energy": energy,
            "mood": mood,
            "beats": beat_times,
            "onsets": onset_times,
            "structure": structure,
            "spectralFeatures": {
                "brightness": brightness,
                "timbre": timbre,
                "contrast": contrast
            },
            "detailedFeatures": {
                "rmsEnergy": rms.tolist(),
                "zeroCrossingRate": zcr.tolist(),
                "spectralCentroids": spectral_centroids.tolist(),
                "spectralRolloff": spectral_rolloff.tolist(),
                "chroma": chroma.tolist()
            }
        }
        
        return analysis
        
    except Exception as e:
        return {
            "error": str(e),
            "success": False
        }

def determine_mood(tempo, energy, brightness):
    """
    Determine mood based on musical features
    """
    if tempo > 140 and energy > 0.15:
        return "energetic"
    elif tempo < 80 and energy < 0.08:
        return "calm"
    elif brightness < 1500 and energy < 0.1:
        return "dark"
    elif tempo > 110 and brightness > 2000:
        return "uplifting"
    elif tempo < 100 and brightness > 1800:
        return "dreamy"
    else:
        return "balanced"

def segment_structure(y, sr, beat_times, duration):
    """
    Segment audio into structural parts (intro, verse, chorus, etc.)
    Uses self-similarity matrix and novelty detection
    """
    try:
        # Compute chroma features for structure analysis
        chroma = librosa.feature.chroma_cqt(y=y, sr=sr)
        
        # Compute self-similarity matrix
        rec = librosa.segment.recurrence_matrix(chroma, mode='affinity')
        
        # Detect segment boundaries
        boundaries = librosa.segment.agglomerative(chroma, k=5)
        boundary_times = librosa.frames_to_time(boundaries, sr=sr)
        
        # Create structure segments
        segments = []
        segment_types = ['intro', 'verse', 'chorus', 'verse', 'chorus', 'bridge', 'chorus', 'outro']
        
        for i in range(len(boundary_times) - 1):
            segment_type = segment_types[min(i, len(segment_types) - 1)]
            segments.append({
                "type": segment_type,
                "startTime": float(boundary_times[i]),
                "endTime": float(boundary_times[i + 1])
            })
        
        # Add final segment
        if len(boundary_times) > 0:
            segments.append({
                "type": "outro",
                "startTime": float(boundary_times[-1]),
                "endTime": float(duration)
            })
        
        # If no segments detected, create simple intro/main/outro structure
        if len(segments) == 0:
            intro_end = min(duration * 0.1, 10.0)
            outro_start = max(duration * 0.9, duration - 10.0)
            
            segments = [
                {"type": "intro", "startTime": 0.0, "endTime": intro_end},
                {"type": "main", "startTime": intro_end, "endTime": outro_start},
                {"type": "outro", "startTime": outro_start, "endTime": duration}
            ]
        
        return segments
        
    except Exception as e:
        # Fallback to simple structure
        intro_end = min(duration * 0.1, 10.0)
        outro_start = max(duration * 0.9, duration - 10.0)
        
        return [
            {"type": "intro", "startTime": 0.0, "endTime": intro_end},
            {"type": "main", "startTime": intro_end, "endTime": outro_start},
            {"type": "outro", "startTime": outro_start, "endTime": duration}
        ]

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print(json.dumps({"error": "Usage: python audio_analyzer.py <audio_file_path>"}))
        sys.exit(1)
    
    audio_path = sys.argv[1]
    result = analyze_audio(audio_path)
    print(json.dumps(result, indent=2))
