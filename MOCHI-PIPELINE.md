# AI Recipe-Based Video Generation Pipeline
## Using Mochi + Audio1.TV

## Concept: "Recipe → Generate → Assemble"

Instead of real-time VJ, **AI analyzes audio → generates production recipe → batch-generates clips → assembles final video**.

**Timeline**: 20-30 minutes total (acceptable for professional output)

---

## Pipeline Architecture

```
[User Uploads Audio]
        ↓
[Audio Analysis] (30 seconds)
    - Beat detection
    - Stem separation
    - Structure detection
    - Energy mapping
    - Mood classification
        ↓
[AI Recipe Generator] (10 seconds)
    - Creates shot list
    - Generates Mochi prompts
    - Plans transitions
    - Assigns visual themes
        ↓
[Mochi Batch Generation] (15-20 minutes)
    - Generates 20-40 x 5-second clips
    - Runs in background
    - Progress UI updates
    - Caches in AgentCache.ai
        ↓
[Smart Assembly] (1-2 minutes)
    - Syncs clips to beats
    - Adds transitions
    - Applies shaders
    - Color grading
        ↓
[Final Video Export] (30 seconds)
    - 1080p/60fps
    - Download + Share
```

---

## Phase 1: Audio Analysis → Recipe

### Input: `song.mp3` (180 seconds)

### Output: JSON Recipe

```json
{
  "metadata": {
    "duration": 180,
    "bpm": 128,
    "key": "C major",
    "mood": "energetic-cyberpunk",
    "structure": [
      { "type": "intro", "start": 0, "end": 8, "energy": 0.3 },
      { "type": "verse", "start": 8, "end": 32, "energy": 0.5 },
      { "type": "buildup", "start": 32, "end": 40, "energy": 0.7 },
      { "type": "drop", "start": 40, "end": 56, "energy": 0.95 },
      { "type": "chorus", "start": 56, "end": 72, "energy": 0.85 }
    ]
  },
  
  "visual_style": {
    "aesthetic": "neon-cyberpunk-abstract",
    "color_palette": ["#ff006e", "#00f5ff", "#7209b7", "#00ff88"],
    "motion_intensity": "high",
    "camera_style": "dynamic-handheld"
  },
  
  "shot_list": [
    {
      "id": "shot_001",
      "timestamp": 0,
      "duration": 5,
      "section": "intro",
      "mochi_prompt": "slow motion abstract neon liquid flowing, dark cyberpunk background, particle effects, cinematic lighting, 4K quality",
      "visual_theme": "liquid-abstract",
      "energy_level": 0.3,
      "transition_in": "fade",
      "transition_out": "dissolve",
      "effects": ["bloom", "chromatic-aberration-light"]
    },
    {
      "id": "shot_002",
      "timestamp": 5,
      "duration": 3,
      "section": "intro",
      "mochi_prompt": "geometric neon shapes morphing, purple and cyan colors, smooth camera push, depth of field",
      "visual_theme": "geometric-morph",
      "energy_level": 0.35,
      "transition_in": "dissolve",
      "transition_out": "quick-cut",
      "effects": ["glow", "vignette"]
    },
    {
      "id": "shot_003",
      "timestamp": 8,
      "duration": 4,
      "section": "verse",
      "mochi_prompt": "digital rain falling like matrix, neon pink highlights, camera slowly rotating, cyberpunk city background",
      "visual_theme": "digital-rain",
      "energy_level": 0.5,
      "transition_in": "quick-cut",
      "transition_out": "glitch",
      "effects": ["pixelation", "scanlines"]
    }
    // ... 30-40 more shots
  ],
  
  "assembly_instructions": {
    "beat_sync": {
      "mode": "strict", // Cuts happen exactly on beats
      "beat_threshold": 0.05 // 50ms tolerance
    },
    "transitions": {
      "intro_to_verse": "slow-dissolve",
      "verse_to_buildup": "quick-cuts",
      "buildup_to_drop": "glitch-explosion",
      "drop_to_chorus": "zoom-blur"
    },
    "effects_timeline": [
      {
        "time": 40,
        "event": "drop",
        "effects": ["screen-shake", "flash", "chromatic-aberration-heavy"]
      },
      {
        "time": 72,
        "event": "chorus",
        "effects": ["color-shift", "bloom-pulse"]
      }
    ],
    "audio_reactive": {
      "bass_drives": "scale",
      "mids_drive": "rotation",
      "highs_drive": "brightness"
    }
  }
}
```

---

## Phase 2: AI Recipe Generator Logic

### Intelligent Shot Planning

```javascript
class RecipeGenerator {
  async generateRecipe(audioAnalysis) {
    const recipe = {
      metadata: audioAnalysis,
      visual_style: this.determineAesthetic(audioAnalysis),
      shot_list: [],
      assembly_instructions: {}
    };
    
    // Iterate through song structure
    for (const section of audioAnalysis.structure) {
      const shots = this.planSection(section, audioAnalysis);
      recipe.shot_list.push(...shots);
    }
    
    // Add special moment shots (drops, builds, breaks)
    this.addKeyMoments(recipe, audioAnalysis);
    
    // Optimize for visual flow
    this.ensureVisualContinuity(recipe);
    
    return recipe;
  }
  
  determineAesthetic(audio) {
    const { bpm, energy, mood, genre } = audio;
    
    // Rule-based aesthetic matching
    if (energy > 0.8 && bpm > 120) {
      return {
        aesthetic: "cyberpunk-rave",
        keywords: ["neon", "digital", "glitch", "particles"]
      };
    } else if (energy < 0.4 && bpm < 100) {
      return {
        aesthetic: "dreamy-abstract",
        keywords: ["soft", "flowing", "ethereal", "clouds"]
      };
    }
    // ... more rules
  }
  
  planSection(section, audioAnalysis) {
    const shots = [];
    const { type, start, end, energy } = section;
    const duration = end - start;
    
    // Shot density based on energy
    const shotDuration = energy > 0.7 ? 3 : energy > 0.4 ? 5 : 7;
    const numShots = Math.ceil(duration / shotDuration);
    
    for (let i = 0; i < numShots; i++) {
      const shotStart = start + (i * shotDuration);
      const prompt = this.generateMochiPrompt(section, i, audioAnalysis);
      
      shots.push({
        id: `shot_${String(shots.length + 1).padStart(3, '0')}`,
        timestamp: shotStart,
        duration: Math.min(shotDuration, end - shotStart),
        section: type,
        mochi_prompt: prompt,
        visual_theme: this.selectTheme(section, i),
        energy_level: energy,
        transition_in: this.selectTransition(energy, 'in'),
        transition_out: this.selectTransition(energy, 'out'),
        effects: this.selectEffects(energy, type)
      });
    }
    
    return shots;
  }
  
  generateMochiPrompt(section, shotIndex, audioAnalysis) {
    const { type, energy } = section;
    const { mood, aesthetic } = audioAnalysis;
    
    // Template-based prompt generation
    const subjects = this.getSubjects(aesthetic, energy);
    const motion = this.getMotionStyle(energy);
    const lighting = this.getLighting(type);
    const quality = "cinematic, high quality, 4K, smooth motion";
    
    return `${subjects}, ${motion}, ${lighting}, ${quality}`;
  }
  
  getSubjects(aesthetic, energy) {
    const pool = {
      'cyberpunk-rave': [
        'neon geometric shapes pulsing',
        'holographic particles swirling',
        'digital glitch waves rippling',
        'laser beams cutting through fog',
        'abstract circuit patterns flowing'
      ],
      'dreamy-abstract': [
        'soft clouds morphing',
        'liquid colors blending',
        'ethereal light rays',
        'floating geometric crystals',
        'smooth gradient waves'
      ]
    };
    
    const subjects = pool[aesthetic] || pool['cyberpunk-rave'];
    return subjects[Math.floor(Math.random() * subjects.length)];
  }
  
  addKeyMoments(recipe, audioAnalysis) {
    // Find drops, builds, breaks
    const keyMoments = audioAnalysis.structure.filter(s => 
      ['drop', 'buildup', 'break'].includes(s.type)
    );
    
    keyMoments.forEach(moment => {
      // Insert special high-impact shots
      const specialShot = {
        id: `special_${moment.type}_${moment.start}`,
        timestamp: moment.start,
        duration: 2,
        section: moment.type,
        mochi_prompt: this.generateImpactPrompt(moment),
        visual_theme: 'impact-moment',
        energy_level: 1.0,
        transition_in: 'explosion',
        transition_out: 'hard-cut',
        effects: ['screen-shake', 'flash', 'chromatic-aberration-extreme']
      };
      
      // Insert into shot list at correct position
      const insertIndex = recipe.shot_list.findIndex(s => s.timestamp >= moment.start);
      recipe.shot_list.splice(insertIndex, 0, specialShot);
    });
  }
  
  ensureVisualContinuity(recipe) {
    // Avoid jarring theme changes
    for (let i = 1; i < recipe.shot_list.length; i++) {
      const prev = recipe.shot_list[i - 1];
      const curr = recipe.shot_list[i];
      
      // If themes are too different, add transition shot
      const similarity = this.calculateThemeSimilarity(prev.visual_theme, curr.visual_theme);
      
      if (similarity < 0.3 && curr.energy_level - prev.energy_level > 0.3) {
        curr.transition_in = 'glitch-dissolve'; // Smooth jarring transitions
      }
    }
  }
}
```

---

## Phase 3: Mochi Batch Generation

### Backend Worker System

```javascript
// API endpoint: POST /api/generate-recipe
app.post('/api/generate-recipe', async (req, res) => {
  const { audioFile, userId } = req.body;
  
  // Step 1: Analyze audio
  const analysis = await analyzeAudio(audioFile);
  
  // Step 2: Generate recipe
  const recipe = await recipeGenerator.generateRecipe(analysis);
  
  // Step 3: Create job
  const jobId = uuidv4();
  await db.jobs.create({
    id: jobId,
    userId,
    recipe,
    status: 'queued',
    progress: 0,
    clips_generated: 0,
    clips_total: recipe.shot_list.length
  });
  
  // Step 4: Queue Mochi generation (background)
  await mochiQueue.add({ jobId, recipe });
  
  res.json({ jobId, recipe, estimated_time: recipe.shot_list.length * 30 });
});

// Worker: Mochi Generation
mochiQueue.process(async (job) => {
  const { jobId, recipe } = job.data;
  
  for (let i = 0; i < recipe.shot_list.length; i++) {
    const shot = recipe.shot_list[i];
    
    // Generate video with Mochi
    const videoPath = await generateMochiClip(shot);
    
    // Store in outputs/
    const storedPath = await storeClip(jobId, shot.id, videoPath);
    
    // Update progress
    await db.jobs.update(jobId, {
      progress: ((i + 1) / recipe.shot_list.length) * 100,
      clips_generated: i + 1
    });
    
    // Notify client via WebSocket
    io.to(jobId).emit('progress', {
      clips_generated: i + 1,
      clips_total: recipe.shot_list.length,
      latest_clip: storedPath
    });
  }
  
  // Mark complete
  await db.jobs.update(jobId, { status: 'ready_for_assembly' });
  io.to(jobId).emit('generation_complete');
});

// Mochi Python integration
async function generateMochiClip(shot) {
  const { mochi_prompt, duration, id } = shot;
  
  // Call Mochi Python script
  const result = await execAsync(`
    python3 ./demos/cli.py \\
      --model_dir weights/ \\
      --cpu_offload \\
      --prompt "${mochi_prompt}" \\
      --num_frames ${duration * 30} \\
      --height 480 \\
      --width 848 \\
      --output outputs/${id}.mp4
  `);
  
  return `outputs/${id}.mp4`;
}
```

### Frontend Progress UI

```javascript
// Real-time generation progress
async function startGeneration(audioFile) {
  // Upload audio + start recipe generation
  const response = await fetch('/api/generate-recipe', {
    method: 'POST',
    body: formData
  });
  
  const { jobId, recipe, estimated_time } = await response.json();
  
  // Show progress modal
  showProgressModal({
    totalClips: recipe.shot_list.length,
    estimatedTime: Math.ceil(estimated_time / 60), // minutes
    recipe: recipe
  });
  
  // Connect to WebSocket for live updates
  const socket = io.connect();
  socket.emit('join', jobId);
  
  socket.on('progress', (data) => {
    updateProgress(data.clips_generated, data.clips_total);
    
    // Show preview of latest clip
    if (data.latest_clip) {
      previewClip(data.latest_clip);
    }
  });
  
  socket.on('generation_complete', async () => {
    // Move to assembly phase
    await assembleVideo(jobId);
  });
}

function showProgressModal(data) {
  // UI shows:
  // - Recipe preview (shot list)
  // - Progress bar (X/Y clips generated)
  // - Estimated time remaining
  // - Live previews of generated clips
  // - Option to cancel
  
  document.getElementById('progressModal').innerHTML = `
    <div class="generation-progress">
      <h2>🎬 Generating Your Music Video</h2>
      <p>AI is creating ${data.totalClips} unique clips...</p>
      
      <div class="progress-bar">
        <div class="progress-fill" id="progressFill"></div>
      </div>
      
      <p id="progressText">0 / ${data.totalClips} clips generated</p>
      <p id="timeRemaining">Est. ${data.estimatedTime} minutes remaining</p>
      
      <div class="clip-preview-grid" id="clipPreviews">
        <!-- Live previews appear here -->
      </div>
      
      <div class="recipe-preview">
        <h3>📋 Shot List</h3>
        <ul>
          ${data.recipe.shot_list.map(shot => `
            <li>${shot.timestamp}s - ${shot.mochi_prompt.substring(0, 60)}...</li>
          `).join('')}
        </ul>
      </div>
      
      <button onclick="cancelGeneration()">Cancel</button>
    </div>
  `;
}
```

---

## Phase 4: Smart Assembly

### Final Video Composition

```javascript
async function assembleVideo(jobId) {
  const job = await db.jobs.get(jobId);
  const { recipe } = job;
  
  // Load all generated clips
  const clips = await loadClips(jobId);
  
  // Create FFmpeg complex filter
  const filterComplex = buildFilterComplex(recipe, clips);
  
  // Assemble with audio sync
  await ffmpeg({
    inputs: [
      ...clips.map(c => c.path),
      recipe.audioFile
    ],
    filterComplex,
    output: `outputs/${jobId}_final.mp4`,
    options: [
      '-c:v libx264',
      '-preset medium',
      '-crf 18',
      '-c:a aac',
      '-b:a 320k',
      '-r 60' // 60fps
    ]
  });
  
  return `outputs/${jobId}_final.mp4`;
}

function buildFilterComplex(recipe, clips) {
  let filters = [];
  let audioInput = clips.length; // Audio is last input
  
  for (let i = 0; i < recipe.shot_list.length; i++) {
    const shot = recipe.shot_list[i];
    const clip = clips[i];
    
    // Apply effects to each clip
    let videoFilter = `[${i}:v]`;
    
    // Scale to consistent size
    videoFilter += `scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2,`;
    
    // Apply shot-specific effects
    if (shot.effects.includes('bloom')) {
      videoFilter += `gblur=sigma=3,`;
    }
    if (shot.effects.includes('chromatic-aberration')) {
      videoFilter += `chromakey=color=black:similarity=0.1,`;
    }
    
    videoFilter += `trim=duration=${shot.duration},setpts=PTS-STARTPTS[v${i}]`;
    filters.push(videoFilter);
  }
  
  // Concatenate all clips with transitions
  let concatFilter = '';
  for (let i = 0; i < clips.length; i++) {
    concatFilter += `[v${i}]`;
  }
  concatFilter += `concat=n=${clips.length}:v=1:a=0[vout]`;
  filters.push(concatFilter);
  
  // Add audio
  filters.push(`[${audioInput}:a]anull[aout]`);
  
  return filters.join(';') + ';[vout][aout]';
}
```

---

## Phase 5: Caching & Optimization

### Cache Everything with AgentCache.ai

```javascript
// Cache generated clips (expensive!)
async function cacheClip(shot, videoPath) {
  const fingerprint = await hashShot(shot); // Hash of prompt + settings
  
  // Upload video to S3/CDN
  const url = await uploadToStorage(videoPath);
  
  // Store in AgentCache
  await agentCache.set({
    provider: 'mochi',
    model: 'mochi-1',
    messages: [{ role: 'user', content: shot.mochi_prompt }],
    response: JSON.stringify({ url, duration: shot.duration }),
    ttl: 60 * 60 * 24 * 90 // 90 days
  });
}

// Check cache before generating
async function generateOrFetchClip(shot) {
  const fingerprint = await hashShot(shot);
  
  // Try cache first
  const cached = await agentCache.get({
    provider: 'mochi',
    model: 'mochi-1',
    messages: [{ role: 'user', content: shot.mochi_prompt }]
  });
  
  if (cached.hit) {
    const { url } = JSON.parse(cached.response);
    return await downloadFromStorage(url);
  }
  
  // Generate new
  const videoPath = await generateMochiClip(shot);
  await cacheClip(shot, videoPath);
  return videoPath;
}
```

**Huge Win**: Popular prompts (like "neon cyberpunk abstract") get cached. Future users get instant results for common shots.

---

## User Experience Flow

### 1. Upload Audio
```
User: Uploads song.mp3 (180 seconds)
  ↓
UI: "Analyzing audio... 🎵"
  ↓
(10 seconds later)
  ↓
UI: Shows recipe preview + shot list
```

### 2. Review Recipe
```
UI: "📋 I've planned 35 shots for your video"
    
    [Shot List Preview]
    0:00 - Slow motion neon liquid...
    0:05 - Geometric shapes morphing...
    0:08 - Digital rain falling...
    ...
    
    Estimated generation time: 18 minutes
    
    [Edit Recipe] [Start Generation]
```

### 3. Background Generation
```
UI: "🎬 Generating... (5/35 clips complete)"
    
    [Progress: ████░░░░░░░░░░░░] 14%
    
    Time remaining: ~14 minutes
    
    [Live Preview Grid showing latest clips]
    
    You can close this tab - we'll email when done!
```

### 4. Assembly
```
(18 minutes later)
  ↓
UI: "✨ All clips generated! Assembling final video..."
  ↓
(2 minutes later)
  ↓
UI: "🎉 Your music video is ready!"
    
    [▶ Play Video]
    [Download 1080p]
    [Share Link]
    [Edit & Regenerate]
```

---

## Implementation Plan

### Week 1: Recipe Generator
- [ ] Audio analysis integration
- [ ] Recipe JSON schema
- [ ] Prompt template library
- [ ] Shot planning algorithm
- [ ] Visual continuity logic

### Week 2: Mochi Integration
- [ ] Set up Mochi locally (or Modal/RunPod)
- [ ] Python API wrapper
- [ ] Job queue (Bull/Redis)
- [ ] Progress tracking
- [ ] Clip storage (S3/local)

### Week 3: Assembly Pipeline
- [ ] FFmpeg filter builder
- [ ] Transition effects
- [ ] Audio sync logic
- [ ] Final rendering
- [ ] Export formats

### Week 4: UI & Optimization
- [ ] Progress modal
- [ ] Live clip previews
- [ ] Recipe editor
- [ ] AgentCache integration
- [ ] Email notifications

---

## Hardware Requirements

### Option A: Local (Your Machine)
- **GPU**: RTX 4090 (24GB) or better
- **RAM**: 32GB+
- **Time per clip**: ~30-45 seconds
- **Cost**: $0 (uses your GPU)

### Option B: Cloud (RunPod/Modal)
- **GPU**: H100 (80GB) rental
- **RAM**: 128GB
- **Time per clip**: ~10-15 seconds
- **Cost**: ~$2-3 per hour (~$1-2 per video)

### Option C: Hybrid
- Run locally if user has GPU
- Fall back to cloud if not
- Show cost estimate upfront

---

## Why This Approach Wins

✅ **Professional Quality**: Mochi generates cinematic video  
✅ **Coherent Story**: Recipe ensures visual flow  
✅ **Customizable**: Users can edit recipe before generation  
✅ **Scalable**: Cache common shots across users  
✅ **No Real-Time Pressure**: Take time to generate properly  
✅ **Open Source**: No API costs for Mochi  
✅ **Background Processing**: User doesn't wait watching progress bar  

---

## Next Steps

**Immediate**: Test Mochi locally
```bash
cd /Users/letstaco/Documents
git clone https://github.com/genmoai/mochi
cd mochi
pip install uv
uv venv .venv
source .venv/bin/activate
uv pip install -e .
python3 ./scripts/download_weights.py weights/
python3 ./demos/cli.py --model_dir weights/ --cpu_offload --prompt "neon geometric shapes pulsing, cyberpunk style, smooth camera movement"
```

**This Week**: Build recipe generator  
**Next Week**: Integrate Mochi  
**Week 3**: Assembly pipeline  
**Week 4**: Polish UI

---

**This is the future of AI music videos.** 20 minutes to generate professional output is nothing compared to days/weeks of manual editing.
