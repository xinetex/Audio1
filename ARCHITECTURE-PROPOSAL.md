# Professional AI Music Video Architecture Proposal

## Executive Summary

Audio1.TV needs a **node-based, layer-compositing, shader-driven system** to create truly professional AI-generated music videos. Current gaps: sparse beat coverage, no continuous motion, limited visual variety, no shader effects.

**Target**: Every millisecond of audio → visual response. Professional VJ-quality output.

---

## Current Limitations

### 1. **Sparse Coverage**
- ❌ Only hits major beats (every 2-4 beats)
- ❌ Dead air between clips
- ❌ No micro-timing adjustments

### 2. **Limited Motion**
- ❌ Static images with simple transitions
- ❌ No continuous animation layers
- ❌ No camera movement

### 3. **No Shader Pipeline**
- ❌ All effects are CSS/canvas-based
- ❌ No GPU acceleration
- ❌ Can't do chromatic aberration, bloom, distortion

### 4. **Poor Audio Mapping**
- ❌ Only uses beats, ignores frequency content
- ❌ No stem separation (bass/drums/vocals)
- ❌ Simple energy curves

---

## Proposed Architecture: Node-Based Compositor

### Core Concept: **Visual Programming Graph**

```
[Audio Input]
     ↓
[Stem Separator] → [Bass] → [Kick Trigger] → [Camera Shake]
     ↓              [Drums] → [Hi-hat] → [Particle Burst]
     ↓              [Vocals] → [Waveform] → [Lyric Sync]
     ↓              [Melody] → [Harmony] → [Color Shift]
     ↓
[Beat Detector] → [Primary Rhythm] → [Image Sequence]
     ↓              [Downbeats] → [Scene Change]
     ↓              [Fills] → [Transition FX]
     ↓
[Frequency Analyzer] → [Bass (20-250Hz)] → [Scale/Zoom]
                    → [Mid (250Hz-4kHz)] → [Rotation]
                    → [High (4kHz+)] → [Brightness]
                    ↓
                [All Layers] → [Shader Compositor] → [Final Output]
                                      ↓
                                [Post-FX Stack]:
                                - Bloom
                                - Chromatic Aberration
                                - Vignette
                                - Film Grain
                                - Color Grading
```

---

## 1. Multi-Layer System (Like After Effects)

### Layer Types

#### **A. Background Layers** (Always Active)
```javascript
{
  type: 'shader-background',
  shader: 'plasma-noise',
  params: {
    frequency: { audioMap: 'bass', range: [0.5, 5] },
    amplitude: { audioMap: 'mid', range: [0.1, 1] },
    speed: { audioMap: 'bpm', multiplier: 0.01 }
  },
  blend: 'normal',
  opacity: 0.3
}
```

**Shader Options**:
- `plasma-noise` - Organic fluid motion
- `voronoi-cells` - Cellular patterns
- `fbm-clouds` - Fractal noise clouds
- `audio-reactive-grid` - Frequency bars
- `particle-field` - GPU particles

#### **B. Image/Video Layers** (Beat-Synced)
```javascript
{
  type: 'image-sequence',
  assets: [...],
  timing: 'beat-grid', // Place on every beat
  transitions: {
    in: { type: 'zoom-blur', duration: 200 },
    out: { type: 'glitch-dissolve', duration: 300 }
  },
  effects: [
    { type: 'chromatic-aberration', amount: { audioMap: 'bass' } },
    { type: 'displacement', texture: 'noise', strength: { audioMap: 'kick' } }
  ]
}
```

#### **C. Motion Graphics Layers**
```javascript
{
  type: 'animated-shapes',
  generator: 'audio-reactive-circles',
  count: { audioMap: 'energy', range: [10, 100] },
  behavior: {
    position: 'spiral',
    rotation: { audioMap: 'mid-freq', speed: 2 },
    scale: { audioMap: 'bass', range: [0.5, 2] }
  }
}
```

#### **D. Text/Lyric Layers**
```javascript
{
  type: 'text-animation',
  source: 'lyrics',
  style: 'kinetic-typography',
  effects: [
    { type: 'word-reveal', timing: 'syllable-sync' },
    { type: 'glitch', trigger: 'snare-hits' },
    { type: '3d-extrude', depth: { audioMap: 'bass' } }
  ]
}
```

#### **E. Camera Layer** (Virtual)
```javascript
{
  type: 'camera',
  movements: [
    { type: 'shake', trigger: 'kick', intensity: 0.8 },
    { type: 'zoom', audioMap: 'energy', range: [1, 1.5] },
    { type: 'rotate', audioMap: 'mid-freq', speed: 0.5 },
    { type: 'dolly', pattern: 'sine-wave', frequency: 0.1 }
  ],
  fov: { audioMap: 'bass', range: [45, 90] }
}
```

---

## 2. Shader-Driven Effects (WebGL2)

### Post-Processing Stack

```glsl
// Example: Audio-Reactive Chromatic Aberration
uniform float bassLevel;
uniform float time;

void main() {
  vec2 uv = vUv;
  float offset = bassLevel * 0.01;
  
  vec3 color;
  color.r = texture2D(scene, uv + vec2(offset, 0)).r;
  color.g = texture2D(scene, uv).g;
  color.b = texture2D(scene, uv - vec2(offset, 0)).b;
  
  gl_FragColor = vec4(color, 1.0);
}
```

### Essential Shader Library

1. **Bloom** - Makes bright areas glow (key for neon aesthetic)
2. **Chromatic Aberration** - RGB split on bass hits
3. **Radial Blur** - Motion blur from center (drops/builds)
4. **Kaleidoscope** - Mirror/fractal effects
5. **Displacement Map** - Warp image based on audio texture
6. **Feedback** - Trail/echo effects
7. **Edge Detection** - Outline mode
8. **Color Grading LUT** - Professional color correction
9. **Datamosh** - Glitch compression artifacts
10. **Film Grain** - Analog texture

### Integration with Three.js

```javascript
// Composer setup
const composer = new THREE.EffectComposer(renderer);
composer.addPass(new THREE.RenderPass(scene, camera));

// Audio-reactive passes
const bloomPass = new THREE.UnrealBloomPass();
bloomPass.strength = audioData.bass * 3; // Dynamic
composer.addPass(bloomPass);

const aberrationPass = new ChromaticAberrationPass();
aberrationPass.offset.x = audioData.kick * 0.01;
composer.addPass(aberrationPass);
```

---

## 3. Stem Separation for Better Mapping

### Why Stems Matter

**Without stems**: One energy value controls everything  
**With stems**: Drums → particles, Bass → camera, Vocals → text

### Implementation Options

#### Option A: **Client-Side (Spleeter.js)**
```javascript
// Separate audio into stems
const stems = await Spleeter.separate(audioBuffer, {
  model: '4stems', // vocals, drums, bass, other
  outputFormat: 'float32'
});

// Map each stem independently
STATE.stems = {
  vocals: stems[0],
  drums: stems[1],
  bass: stems[2],
  other: stems[3]
};

// Different visual layer for each stem
layers.drums → particles
layers.bass → camera zoom
layers.vocals → lyric sync
layers.melody → color changes
```

**Pros**: Privacy, no server cost  
**Cons**: Heavy processing (20-40s), requires ML model download

#### Option B: **Server-Side API (Spleeter/Demucs)**
```javascript
// Upload to server, get stems back
const response = await fetch('/api/separate-stems', {
  method: 'POST',
  body: audioFile
});

const { stems } = await response.json();
// Cache stems in AgentCache.ai (larger payloads)
```

**Pros**: Fast, professional quality  
**Cons**: Cost, privacy concerns

#### Option C: **Hybrid - Frequency Band Approximation**
```javascript
// Fast approximation without full separation
const bands = {
  subBass: extractFreqRange(audioBuffer, 20, 60),    // Kick drum
  bass: extractFreqRange(audioBuffer, 60, 250),      // Bass guitar
  lowMid: extractFreqRange(audioBuffer, 250, 500),   // Snare
  mid: extractFreqRange(audioBuffer, 500, 2000),     // Vocals
  highMid: extractFreqRange(audioBuffer, 2000, 4000),// Cymbals
  high: extractFreqRange(audioBuffer, 4000, 20000)   // Air
};

// Good enough for most VJ effects
```

**Recommendation**: Start with Option C, add Option A as premium feature.

---

## 4. Continuous Motion System

### Problem: Current system has gaps between beats

### Solution: **Interpolated Animation Graph**

```javascript
// Instead of discrete clips...
const sequence = [
  { time: 0.5, asset: imgA },
  { time: 1.2, asset: imgB },
  { time: 1.8, asset: imgC }
];

// Create continuous motion graph
const motionGraph = new ContinuousMotion({
  keyframes: sequence,
  interpolation: 'smooth',
  fillGaps: true
});

// Every frame (60fps):
motionGraph.update(currentTime);
// Returns: asset, position, rotation, scale, opacity
```

### Motion Generators (Always Active)

```javascript
{
  name: 'BaselineMotion',
  layers: [
    {
      type: 'background-shader',
      continuous: true, // Never stops
      motion: 'sine-wave',
      frequency: bpm / 60,
      amplitude: { audioMap: 'energy' }
    },
    {
      type: 'particle-field',
      count: 1000,
      continuous: true,
      behavior: {
        position: 'flow-field',
        velocity: { audioMap: 'mid-freq' },
        turbulence: { audioMap: 'bass' }
      }
    },
    {
      type: 'camera-drift',
      continuous: true,
      pattern: 'perlin-noise',
      speed: 0.05,
      intensity: { audioMap: 'energy', range: [0.1, 0.5] }
    }
  ]
}
```

**Key**: Background layers = **always animating**. Foreground = **beat-triggered**.

---

## 5. AI Decision Engine (Node Logic)

### Current: Simple random selection  
### Proposed: **Rule-Based Decision Tree**

```javascript
class AIDirector {
  decideNextClip(context) {
    const { currentTime, energy, section, history, stems } = context;
    
    // Rule 1: Match energy
    let candidates = assets.filter(a => 
      a.energy === (energy > 0.7 ? 'high' : energy > 0.4 ? 'medium' : 'low')
    );
    
    // Rule 2: Avoid repetition
    const recent = history.slice(-5).map(h => h.assetId);
    candidates = candidates.filter(a => !recent.includes(a.id));
    
    // Rule 3: Match section type
    if (section.type === 'chorus') {
      candidates = candidates.filter(a => a.tags.includes('vibrant'));
    }
    
    // Rule 4: Color harmony
    const lastColor = history[history.length - 1]?.dominantColor;
    candidates = candidates.sort((a, b) => 
      colorDistance(a.dominantColor, lastColor) - 
      colorDistance(b.dominantColor, lastColor)
    );
    
    // Rule 5: Stem-specific logic
    if (stems.vocals.energy > 0.8) {
      // High vocals = show faces/text
      candidates = candidates.filter(a => 
        a.tags.includes('portrait') || a.tags.includes('text')
      );
    }
    
    return candidates[0]; // Top match
  }
  
  decideTransition(fromAsset, toAsset, beatStrength) {
    // Strong beat = hard cut or glitch
    if (beatStrength > 0.8) {
      return random(['hard-cut', 'glitch-dissolve', 'rgb-split']);
    }
    
    // Similar colors = smooth blend
    if (colorDistance(fromAsset.color, toAsset.color) < 0.3) {
      return 'cross-fade';
    }
    
    // Default = dissolve with displacement
    return 'displacement-dissolve';
  }
  
  decideEffectStack(currentTime, audioFeatures) {
    const effects = [];
    
    // Bass = chromatic aberration
    if (audioFeatures.bass > 0.7) {
      effects.push({ type: 'chromatic-aberration', strength: audioFeatures.bass });
    }
    
    // High energy = bloom
    if (audioFeatures.energy > 0.6) {
      effects.push({ type: 'bloom', strength: audioFeatures.energy * 2 });
    }
    
    // Mid frequencies = rotation
    if (audioFeatures.mid > 0.5) {
      effects.push({ type: 'rotate', angle: audioFeatures.mid * 360 });
    }
    
    return effects;
  }
}
```

---

## 6. Implementation Roadmap

### Phase 1: Foundation (Week 1)
- [ ] Refactor to multi-layer architecture
- [ ] Add Three.js EffectComposer
- [ ] Implement 3 basic shaders (bloom, chromatic aberration, displacement)
- [ ] Frequency band separation (Option C)
- [ ] Continuous background motion layer

### Phase 2: Core Features (Week 2)
- [ ] Node-based compositor UI (simple version)
- [ ] 10 shader effects library
- [ ] Particle system layer
- [ ] Camera movement system
- [ ] AI decision tree (basic rules)

### Phase 3: Polish (Week 3)
- [ ] Advanced transitions (20+ types)
- [ ] Stem separation (Option A - client-side)
- [ ] Color extraction + harmony matching
- [ ] Timeline scrubbing
- [ ] Real-time parameter adjustment

### Phase 4: Pro Features (Week 4+)
- [ ] Visual programming graph UI
- [ ] Custom shader editor
- [ ] Export preset templates
- [ ] Cloud rendering (for 4K/60fps)
- [ ] Community shader marketplace

---

## 7. Technical Stack Recommendations

### Core Libraries

```json
{
  "rendering": {
    "three.js": "r156+",
    "postprocessing": "^6.0", // Ready-made shader effects
    "gpu.js": "^2.0" // GPU compute for audio analysis
  },
  "audio": {
    "tone.js": "^14.0", // Advanced audio analysis
    "essentia.js": "^0.1", // ML audio features
    "audiomotion-analyzer": "^4.0" // Real-time FFT viz
  },
  "animation": {
    "anime.js": "^3.2", // Keep for text/UI
    "gsap": "^3.12", // For complex timelines
    "theatre.js": "^0.5" // Timeline editor (optional)
  },
  "shaders": {
    "glslify": "^7.0", // Modular shaders
    "three-shader-frog": "^1.0" // Visual shader editor
  }
}
```

### Recommended Architecture

```
audio1tv-ai-vj.html (UI)
     ↓
AudioEngine.js         → Tone.js, Essentia.js
     ↓
VisualEngine.js        → Three.js, EffectComposer
     ↓
LayerCompositor.js     → Multi-layer management
     ↓
ShaderLibrary.js       → GLSL shaders
     ↓
AIDirector.js          → Decision logic
     ↓
TimelineManager.js     → Sync everything
     ↓
Renderer.js            → Final output
```

---

## 8. Example: Complete Frame Render Logic

```javascript
function renderFrame(currentTime) {
  const audioData = analyzeAudioAtTime(currentTime);
  const decisions = aiDirector.getDecisions(currentTime, audioData);
  
  // Layer 1: Background shader (always active)
  backgroundLayer.update({
    time: currentTime,
    bass: audioData.stems.bass,
    frequency: audioData.bpm / 60
  });
  
  // Layer 2: Particle field (always active)
  particleLayer.update({
    count: map(audioData.energy, 0, 1, 100, 1000),
    velocity: audioData.stems.drums,
    color: getColorFromFrequency(audioData.dominant)
  });
  
  // Layer 3: Main image (beat-synced)
  const currentClip = decisions.activeClip;
  if (currentClip) {
    imageLayer.update({
      asset: currentClip.asset,
      transition: currentClip.transition,
      effects: decisions.effects,
      transform: {
        scale: 1 + audioData.bass * 0.5,
        rotate: audioData.mid * 45,
        position: cameraLayer.position
      }
    });
  }
  
  // Layer 4: Text/lyrics (if active)
  if (decisions.showText) {
    textLayer.update({
      text: decisions.currentLyric,
      style: decisions.textStyle,
      animation: decisions.textAnimation
    });
  }
  
  // Layer 5: Camera (virtual)
  cameraLayer.update({
    shake: audioData.stems.kick > 0.8 ? 0.05 : 0,
    zoom: 1 + audioData.bass * 0.2,
    rotation: Math.sin(currentTime * 0.5) * audioData.mid * 10
  });
  
  // Composite all layers
  const composited = compositor.combine([
    backgroundLayer,
    particleLayer,
    imageLayer,
    textLayer
  ], cameraLayer);
  
  // Post-process with shaders
  const final = postFX.apply(composited, decisions.effects);
  
  // Render to canvas
  renderer.render(final);
}
```

---

## 9. Quick Wins (Can Implement Today)

### A. Fill Every Beat
```javascript
// Instead of every 2-4 beats...
STATE.beats.forEach(beat => {
  sequence.push({
    time: beat,
    asset: selectAsset(beat),
    duration: nextBeat - beat, // Fill the gap
    transition: 'quick-fade'
  });
});
```

### B. Add Continuous Background
```javascript
// Always-on plasma shader
const bgShader = new THREE.ShaderMaterial({
  uniforms: {
    time: { value: 0 },
    bass: { value: 0 }
  },
  fragmentShader: `
    uniform float time;
    uniform float bass;
    
    void main() {
      vec2 uv = vUv * 3.0;
      float d = length(uv - vec2(0.5));
      float wave = sin(d * 10.0 - time + bass * 5.0);
      vec3 color = vec3(wave * 0.5 + 0.5, bass, 1.0 - bass);
      gl_FragColor = vec4(color, 1.0);
    }
  `
});
```

### C. Add Camera Shake
```javascript
// On every kick drum
if (audioData.bass > 0.8) {
  camera.position.x += (Math.random() - 0.5) * 0.05;
  camera.position.y += (Math.random() - 0.5) * 0.05;
}
```

### D. Layer Images with Shaders
```javascript
// Instead of flat images, add displacement
const displaceShader = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: imageTexture },
    tDisplacement: { value: noiseTexture },
    amount: { value: audioData.bass * 0.1 }
  }
});
```

---

## 10. Answer to Your Questions

### Q: "Does it work better with stems?"
**A**: **YES, 100%.** Stems allow:
- Kick drum → camera shake
- Hi-hat → particle bursts
- Bass → zoom/scale
- Vocals → lyric sync
- Melody → color shifts

Without stems, everything is mush.

### Q: "Nodes - does it need logic with nodes?"
**A**: **YES for pro users, NO for beginners.**
- Beginners: AI auto-generates node graph
- Advanced: Visual programming (like TouchDesigner)
- Export/import node presets

### Q: "What is the way AI agents want to build?"
**A**: **Declarative + Rule-Based**

```javascript
// AI thinks in terms of:
const videoStyle = {
  energy: 'high',
  aesthetic: 'cyberpunk',
  motion: 'continuous',
  layers: [
    { type: 'shader-bg', pattern: 'plasma' },
    { type: 'particles', count: 'energy-driven' },
    { type: 'images', timing: 'beat-grid' },
    { type: 'camera', movement: 'drunk-walk' }
  ],
  rules: [
    'bass > 0.8 → glitch effect',
    'chorus → bright colors',
    'drop → hard cut + zoom'
  ]
};
```

---

## Conclusion

**Current state**: Fun demo, but sparse and static  
**Proposed state**: Professional VJ tool with:
- ✅ Every beat covered
- ✅ Continuous motion (no dead air)
- ✅ Shader-driven effects
- ✅ Multi-layer compositing
- ✅ Stem-aware decisions
- ✅ Node-based flexibility

**Next step**: Choose between **Quick Wins** (today) or **Full Rewrite** (1-2 weeks).

I recommend: **Start with Quick Wins**, then migrate layer-by-layer to new architecture.

