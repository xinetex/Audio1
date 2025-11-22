# Music Video Generation App - Research Findings

## Video Generation Technology: Mochi 1

### Overview
- **Mochi 1** is a state-of-the-art open-source video generation model by Genmo
- 10 billion parameter diffusion model
- Apache 2.0 license (permissive, commercial use allowed)
- Generates videos at 480p resolution
- Strong prompt adherence and high-fidelity motion

### Technical Specifications

#### Hardware Requirements
- **Single GPU**: Requires ~60GB VRAM (H100 recommended)
- **Multi-GPU**: Can split across multiple GPUs
- **ComfyUI optimization**: Can run on <20GB VRAM (but less flexible)
- **Challenge**: Very high VRAM requirements for local deployment

#### Model Architecture
- **AsymmDiT**: Asymmetric Diffusion Transformer (10B parameters)
- **AsymmVAE**: Video compression model (362M parameters)
  - 128x compression ratio
  - 8x8 spatial compression
  - 6x temporal compression
  - 12-channel latent space

#### Generation Capabilities
- Text-to-video generation
- 31 frames default output
- Configurable resolution (default 480x848)
- Supports LoRA fine-tuning
- Optimized for photorealistic styles (not animated content)

### API Usage
```python
from genmo.mochi_preview.pipelines import MochiSingleGPUPipeline

pipeline = MochiSingleGPUPipeline(...)
video = pipeline(
    height=480,
    width=848,
    num_frames=31,
    num_inference_steps=64,
    prompt="your prompt here",
    seed=12345,
)
```

### Limitations
- Requires significant VRAM (60GB for single GPU)
- 480p resolution only
- Optimized for photorealistic content
- Can have minor warping with extreme motion
- Not suitable for animated/cartoon styles

## Alternative Approaches for Music Video Generation

### Cloud-Based APIs (More Practical)
Since local Mochi deployment requires 60GB VRAM (H100 GPU), we should consider:

1. **Replicate API** - Hosts Mochi and other video models
2. **Genmo.ai API** - Official Mochi playground API
3. **RunPod/Modal** - Serverless GPU inference
4. **Stability AI** - Stable Video Diffusion API
5. **OpenAI** - Future video generation capabilities

### Hybrid Approach (Recommended)
- Use cloud APIs for video generation (Replicate/Genmo)
- Build sophisticated music analysis engine locally
- Create intelligent prompt generation system
- Assemble and synchronize video clips with music

## Music Analysis Requirements

### Audio Analysis Libraries
- **librosa**: Tempo, beat detection, spectral analysis
- **essentia**: Advanced music information retrieval
- **madmom**: Beat tracking, tempo estimation
- **pydub**: Audio file manipulation
- **aubio**: Real-time audio analysis

### Analysis Features Needed
1. **Tempo/BPM detection**
2. **Beat tracking** (downbeats, measures)
3. **Energy/intensity analysis**
4. **Spectral features** (brightness, timbre)
5. **Structural segmentation** (intro, verse, chorus, bridge, outro)
6. **Mood/emotion detection**
7. **Key/scale detection**
8. **Dynamic range analysis**

## Application Architecture Considerations

### Frontend
- Modern UI inspired by colorpalette.pro (OKLCH color space, glassmorphism)
- Drag-and-drop audio upload
- Real-time visualization of music analysis
- Video generation progress tracking
- Preview and download capabilities

### Backend
- Audio file processing and analysis
- Intelligent prompt generation based on music features
- Video generation API orchestration
- Video assembly and synchronization
- Queue management for long-running tasks

### Database
- Store user projects
- Cache analysis results
- Track generation history
- Manage API usage/credits

## Replicate API - Video Generation Options

### Available Models (No Mochi Found)
Replicate does not currently host the Mochi model, but offers several alternative video generation APIs:

1. **MiniMax Video-01** (Hailuo) - 609k runs
   - Text-to-video and image-to-video
   - 6-second video generation
   - Character consistency support
   
2. **Wan Video 2.5** - Multiple variants
   - Text-to-video with audio generation
   - Image-to-video with background audio
   - Fast variants available
   
3. **Lightricks LTX-Video** - 160k runs
   - DiT-based video generation
   - Real-time generation (24 FPS at 768x512)
   - Text-to-video and image-to-video
   
4. **Tencent Hunyuan-Video** - 114k runs
   - State-of-the-art text-to-video
   - High-quality realistic motion
   
5. **Haiper Video 2** - 10k runs
   - 4s and 6s videos from prompt or image

### Recommendation for Implementation
Since Mochi requires 60GB VRAM and is not available on Replicate, the best approach is:

1. **Use Replicate API** with LTX-Video or Hunyuan-Video for video generation
2. **Build sophisticated music analysis** locally with Python libraries
3. **Generate intelligent prompts** based on music analysis
4. **Orchestrate video generation** through Replicate API
5. **Assemble final video** with proper synchronization to music

This hybrid approach allows us to:
- Avoid massive hardware requirements
- Focus on sophisticated music analysis and prompt engineering
- Use production-ready video generation APIs
- Build a scalable, deployable application
