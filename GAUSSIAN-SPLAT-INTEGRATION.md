# Gaussian Splatting Integration for Audio1.TV

## Overview

Gaussian Splatting (3DGS) can revolutionize the video assembly process by creating photorealistic 3D environments that respond to audio in real-time. Instead of just layering 2D video clips, we can build **3D spaces** where the camera flies through synchronized to the music.

---

## Why Gaussian Splats for Music Videos?

### Traditional Approach (Current)
- Mochi generates 2D video clips → Stitch with transitions → Limited camera control
- Each clip is a "black box" - can't re-render from different angles
- Transitions between clips can feel jarring

### Gaussian Splat Approach (Proposed)
- Generate 3D scenes as Gaussian Splat point clouds
- Camera flies through 3D space, synchronized to beats/energy
- Smooth, continuous motion through entire song
- Real-time audio-reactive camera paths
- Re-render from any angle without regenerating

---

## Integration Architecture

### Three-Tier Hybrid System

```
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: Background Gaussian Splat Environments            │
│  ─────────────────────────────────────────────────────────  │
│  • Low-mid energy sections                                   │
│  • Continuous 3D spaces (neon cities, abstract voids)        │
│  • Camera flies through synchronized to BPM                  │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: Mochi-Generated Video Overlays                    │
│  ─────────────────────────────────────────────────────────  │
│  • High energy moments (drops, buildups)                     │
│  • 3-5 second impact clips                                   │
│  • Composited on top with blend modes                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: Shader Post-Processing                            │
│  ─────────────────────────────────────────────────────────  │
│  • Bloom, chromatic aberration, feedback                     │
│  • Audio-reactive effects on final composite                 │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Implementation

### A. Gaussian Splat Generation Pipeline

**Option 1: Generate Splats from Text Prompts**
- Use **DreamGaussian** or **GaussianDreamer** to create 3DGS from text
- Input: Aesthetic prompt from recipe generator
- Output: `.ply` file with Gaussian point cloud
- Generation time: 5-10 minutes per scene

```bash
# DreamGaussian example
python main.py --text "neon cyberpunk city at night, vibrant purple and cyan lights" \
               --iters 1000 --save_path scenes/cyberpunk_city.ply
```

**Option 2: Pre-built Splat Library**
- Curate 20-30 pre-generated splat environments
- Categorized by aesthetic (cyberpunk, ethereal, abstract, nature, etc.)
- Instant loading, no generation wait time
- Users can upload custom `.ply` files

### B. Camera Path Synthesis

**Audio-Synchronized Camera Movement**
```javascript
class GaussianSplatCameraDirector {
    constructor(audioAnalysis, narrative) {
        this.beats = audioAnalysis.beats;
        this.energyCurve = audioAnalysis.energyCurve;
        this.narrative = narrative;
    }

    generateCameraPath(duration) {
        const keyframes = [];
        
        // Start position
        keyframes.push({
            time: 0,
            position: [0, 0, 5],
            rotation: [0, 0, 0],
            fov: 75
        });

        // Generate keyframe at each beat
        this.beats.forEach((beatTime, i) => {
            const energy = this.getEnergyAt(beatTime);
            
            // High energy = aggressive camera movement
            if (energy > 0.8) {
                keyframes.push({
                    time: beatTime,
                    position: this.generateAggressivePosition(),
                    rotation: this.generateSpinRotation(),
                    fov: 60 + (energy * 40) // Zoom in on drops
                });
            } 
            // Low energy = smooth glide
            else {
                keyframes.push({
                    time: beatTime,
                    position: this.generateSmoothPosition(i),
                    rotation: this.generateOrbitRotation(beatTime),
                    fov: 75
                });
            }
        });

        // Interpolate between keyframes with easing
        return this.interpolatePath(keyframes, duration);
    }

    generateAggressivePosition() {
        // Random position in sphere
        const radius = 3 + Math.random() * 5;
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        
        return [
            radius * Math.sin(phi) * Math.cos(theta),
            radius * Math.sin(phi) * Math.sin(theta),
            radius * Math.cos(phi)
        ];
    }

    generateSmoothPosition(index) {
        // Spiral path
        const t = index * 0.2;
        return [
            Math.cos(t) * 5,
            Math.sin(t * 0.5) * 2,
            t * 0.5
        ];
    }
}
```

### C. Real-Time Rendering Stack

**Option 1: Three.js + GaussianSplats3D**
```javascript
import * as GaussianSplats3D from '@mkkellogg/gaussian-splats-3d';

const viewer = new GaussianSplats3D.Viewer({
    cameraUp: [0, 1, 0],
    initialCameraPosition: [0, 0, 5],
    sharedMemoryForWorkers: false
});

viewer.addSplatScene('scenes/cyberpunk_city.ply', {
    progressiveLoad: true,
    rotation: [0, 0, 0, 1],
    position: [0, 0, 0]
})
.then(() => {
    // Start audio-synced camera path
    startCameraAnimation(cameraPath, audioElement);
});
```

**Option 2: PlayCanvas Engine**
- Built-in Gaussian Splat support (as of 2024)
- Better performance for complex scenes
- WebGPU acceleration

**Option 3: Pre-render with Nerfstudio**
```bash
# Render camera path to video frames
ns-render camera-path \
    --load-config outputs/cyberpunk/config.yml \
    --camera-path-filename camera_path.json \
    --output-path renders/cyberpunk_sequence/
```

---

## Assembly Workflow Integration

### Updated Recipe Format

```json
{
    "shot_list": [
        {
            "start_time": 0,
            "duration": 8,
            "type": "gaussian_splat",
            "splat_scene": "cyberpunk_city.ply",
            "camera_path": {
                "type": "smooth_orbit",
                "speed": 0.5,
                "center": [0, 2, 0]
            },
            "audio_reactive": {
                "fov_pulse": { "frequency": "beat", "intensity": 0.3 },
                "position_shake": { "frequency": "sub_bass", "intensity": 0.1 }
            }
        },
        {
            "start_time": 8,
            "duration": 3,
            "type": "mochi_overlay",
            "prompt": "explosive particle burst, neon pink and cyan",
            "blend_mode": "add",
            "opacity": 0.8
        },
        {
            "start_time": 11,
            "duration": 12,
            "type": "gaussian_splat",
            "splat_scene": "abstract_void.ply",
            "camera_path": {
                "type": "aggressive_fly_through",
                "speed": 2.0,
                "randomness": 0.6
            }
        }
    ],
    "visual_style": { /* ... */ },
    "assembly_instructions": { /* ... */ }
}
```

### Modified Assembly Pipeline

```
1. Audio Analysis (30s)
   ↓
2. Recipe Generation (10s)
   • Determines splat scenes vs Mochi clips
   • Plans camera paths
   ↓
3. Asset Preparation (5-20min)
   PARALLEL TASKS:
   • Generate/Load Gaussian Splats (5-10min if generating new)
   • Generate Mochi clips for overlays (15-20min)
   ↓
4. Camera Path Synthesis (10s)
   • Generate keyframes from audio analysis
   • Interpolate smooth paths
   ↓
5. Real-Time Assembly (2-3min)
   • Render splat scenes with camera paths
   • Composite Mochi overlays
   • Apply shader effects
   • Export to video
```

---

## Performance Considerations

### Rendering Options

**A. Client-Side Real-Time (Best Quality)**
- Requires WebGPU-capable browser
- RTX 3060+ recommended
- 30-60 FPS rendering
- Users see live preview before export

**B. Server-Side Pre-render (Most Reliable)**
- Headless rendering with Nerfstudio
- Consistent quality
- No user hardware dependency
- Slower (5-10min per scene)

**C. Hybrid (Recommended)**
- Pre-render splat backgrounds on server
- Real-time composite with Mochi clips on client
- Best of both worlds

### File Size Management

Gaussian Splat `.ply` files can be large (50-500MB per scene):

**Solution: Compressed Splat Format**
```javascript
// Use 16-bit quantization
const compressedSplat = quantizeSplatTo16Bit(originalSplat);
// Reduces file size by ~60% with minimal quality loss

// Progressive loading
viewer.addSplatScene('scene.ply', {
    progressiveLoad: true,  // Load low-res first, refine
    sphericalHarmonicsDegree: 0  // Start with 0, upgrade to 2
});
```

---

## Creative Possibilities

### 1. **Morphing Splat Scenes**
- Interpolate between two splat scenes during transitions
- "Cyberpunk city melts into ethereal forest"

### 2. **User-Generated Splats**
- Users upload photos → Convert to splat with Luma AI API
- "Turn your living room into a music video set"

### 3. **Splat Particles**
- Break splat into particle system on drops
- Points explode outward, reform on next beat

### 4. **Mixed Reality Compositing**
- Splat background + Mochi characters + Live footage
- Layer real drummer performance into splat environment

---

## Recommended Tools & Libraries

### Generation
- **DreamGaussian**: https://github.com/dreamgaussian/dreamgaussian
- **GaussianDreamer**: Text-to-3DGS in 15 minutes
- **Luma AI API**: Photos/video → Splat ($0.50/capture)

### Rendering
- **@mkkellogg/gaussian-splats-3d**: Three.js integration
- **PlayCanvas Engine**: WebGPU-optimized viewer
- **Nerfstudio**: High-quality offline rendering

### Optimization
- **INRIA Gaussian Splat Toolkit**: Compression utilities
- **gsplat.js**: Lightweight viewer (50KB gzipped)

---

## Integration Roadmap

### Phase 1: Proof of Concept (1 week)
- [ ] Integrate @mkkellogg/gaussian-splats-3d into Audio1.TV
- [ ] Create 5 pre-built splat scenes
- [ ] Implement basic camera path from beat array
- [ ] Render single scene with audio sync

### Phase 2: Recipe Integration (1 week)
- [ ] Modify recipe generator to include splat scenes
- [ ] Build camera path synthesis from energy curve
- [ ] Add splat/Mochi layer compositing
- [ ] Test full assembly pipeline

### Phase 3: Advanced Features (2 weeks)
- [ ] Text-to-splat generation via DreamGaussian
- [ ] Scene morphing/transitions
- [ ] User splat upload (.ply import)
- [ ] Real-time audio-reactive parameters

### Phase 4: Optimization (1 week)
- [ ] Implement progressive loading
- [ ] Add quality presets (low/med/high)
- [ ] Server-side pre-render option
- [ ] Compressed splat format

---

## Example Use Cases

### Use Case 1: Electronic Music Video (High Energy)
```
0:00-0:15  → Gaussian splat: Neon city flythrough (smooth)
0:15-0:18  → Mochi overlay: Explosive particle burst (add blend)
0:18-0:45  → Gaussian splat: Abstract tunnel (aggressive camera)
0:45-0:50  → Mochi overlay: Glitch effects (screen blend)
0:50-1:30  → Gaussian splat: Morphing void → crystalline structure
```

### Use Case 2: Chill Ambient Track (Low Energy)
```
0:00-2:00  → Single Gaussian splat: Ethereal forest
             • Camera: Slow orbit around center
             • FOV: Gentle breathing (0.9-1.1x BPM)
             • No Mochi overlays - pure splat journey
2:00-2:30  → Gaussian splat: Same scene, camera pulls up to sky
```

### Use Case 3: Narrative Music Video (Episodic)
```
Verse 1    → Gaussian splat: Bedroom interior
Chorus 1   → Mochi overlay: Character transformation
Verse 2    → Gaussian splat: City rooftop (morphed from bedroom)
Chorus 2   → Mochi overlay: Flying sequence
Bridge     → Gaussian splat: Abstract space (represents emotions)
Outro      → Return to bedroom splat, full circle
```

---

## Cost Analysis

### Pre-Built Splat Library Approach
- One-time cost: Generate 30 scenes @ 10 min each = 5 hours GPU time
- Ongoing cost: $0/video (scenes are reused)
- Best for MVP

### On-Demand Generation Approach
- DreamGaussian: ~10 min per scene on H100 = $0.30/scene
- Average video uses 3-5 scenes = $1-1.50/video
- Best for unlimited variety

### Hybrid Approach (Recommended)
- 20 pre-built scenes for common aesthetics
- On-demand generation for custom prompts
- Average cost: $0.30/video

---

## Technical Specifications

### Minimum Requirements
- WebGPU-capable browser (Chrome 113+, Edge 113+)
- 4GB VRAM (integrated GPU acceptable)
- 8GB RAM

### Recommended Requirements
- RTX 3060 or better (NVIDIA)
- 16GB RAM
- SSD storage (faster splat loading)

### Splat Scene Specifications
- File format: `.ply` (standard Gaussian Splat)
- Max points: 2-5 million (balance quality/performance)
- Quantization: 16-bit (60% smaller than 32-bit)
- Spherical harmonics: Degree 2 (color variation)

---

## Next Steps

1. **Prototype splat viewer** in Audio1.TV
   - Load single `.ply` file
   - Sync camera to beat array
   - Verify 60 FPS performance

2. **Create starter splat library**
   - Generate 5 scenes (cyberpunk, ethereal, abstract, nature, minimal)
   - Test loading times
   - Measure file sizes after compression

3. **Integrate with recipe generator**
   - Add `type: "gaussian_splat"` to shot schema
   - Generate camera paths from energy curve
   - Build compositor for splat + Mochi layers

4. **Build assembly pipeline**
   - Render splat scenes to video frames
   - Composite with Mochi clips
   - Apply shader effects
   - Export final video

Ready to proceed with the prototype? I can help integrate @mkkellogg/gaussian-splats-3d into `audio1tv-ai-vj.html`.
