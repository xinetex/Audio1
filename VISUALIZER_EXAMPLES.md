# 🎵 Music Visualizer Examples

## Quick Start

### 1. Get Available Recipes

```bash
curl http://localhost:3001/api/visualizer/recipes
```

**Response**:
```json
{
  "recipes": [
    {
      "id": "meme-pump",
      "name": "🚀 Moon Shot",
      "description": "Rockets and coins pumping to the moon",
      "preview": {
        "sprites": ["🚀", "💎", "📈", "🌙"],
        "background": "#0a0014"
      }
    },
    {
      "id": "party-mode",
      "name": "🎉 Party Vibes",
      "description": "High energy celebration mode",
      "preview": {
        "sprites": ["🎉", "⭐", "💥", "🔥"],
        "background": "#ff006e"
      }
    }
    // ... 3 more recipes
  ]
}
```

---

## Example 1: Meme Coin Pump Visualizer

**Scenario**: You want to create a hype video for your DogeCoin launch.

```javascript
// Upload audio first
const formData = new FormData();
formData.append('audio', audioFile);
const uploadRes = await fetch('http://localhost:3001/api/audio/upload', {
  method: 'POST',
  body: formData
});
const { filename } = await uploadRes.json();

// Generate visualizer with your meme coin sprites
const visualizerRes = await fetch('http://localhost:3001/api/visualizer/generate-preset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioFile: filename,
    recipeId: 'meme-pump', // 🚀 Moon Shot theme
    sprites: ['🐶', '🚀', '💰', '🌙'], // Custom DogeCoin sprites
    settings: {
      width: 1920, // Full HD
      height: 1080,
      fps: 30,
      duration: 15 // 15 second clip
    }
  })
});

const result = await visualizerRes.json();
console.log(`Video ready: ${result.videoUrl}`);
console.log(`BPM detected: ${result.audioAnalysis.bpm}`);
```

**Output**: 15-second HD video with your sprites pulsing, orbiting, and bouncing to the beat.

---

## Example 2: Party Mode for Community Celebration

**Scenario**: Your coin just hit 100M market cap. Celebrate!

```bash
curl -X POST http://localhost:3001/api/visualizer/generate-preset \
  -H "Content-Type: application/json" \
  -d '{
    "audioFile": "celebration-music.mp3",
    "recipeId": "party-mode",
    "sprites": ["🎉", "⭐", "💯", "🔥"],
    "settings": {
      "width": 1280,
      "height": 720,
      "fps": 60
    }
  }'
```

**Result**: High-energy visualizer with:
- Particles exploding everywhere
- Colors pulsing between hot pink and cyan
- Chromatic aberration for glitchy vibe
- All sprites scatter-dancing to the bass

---

## Example 3: Chill Vibes for Marketing

**Scenario**: Need a calm, professional promo video.

```javascript
await fetch('http://localhost:3001/api/visualizer/generate-preset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioFile: 'lofi-beat.mp3',
    recipeId: 'chill-vibes',
    sprites: ['🌊', '✨', '🎵', '💫'],
    settings: {
      width: 1080,
      height: 1920, // Vertical for Instagram Stories
      fps: 30,
      duration: 30
    }
  })
});
```

**Features**:
- Smooth wave motions
- Gradient background (deep purple → soft blue)
- Subtle bloom glow
- Perfect for Instagram/TikTok

---

## Example 4: Custom Recipe for Maximum Control

**Scenario**: You want full creative control.

```javascript
const customRecipe = {
  name: 'My Custom Vibe',
  description: 'Unique brand aesthetic',
  sprites: [
    { sprite: '🐶', behavior: 'pulse', baseSize: 80 },
    { sprite: '💎', behavior: 'orbit', baseSize: 48 },
    { sprite: '🔥', behavior: 'scatter', baseSize: 56 },
    { sprite: '🚀', behavior: 'spin', baseSize: 64 }
  ],
  effects: {
    background: 'radial',
    backgroundColor: '#000000',
    secondaryColor: '#ff006e',
    particles: true,
    trails: true,
    bloom: true,
    chromatic: false,
    scanlines: true,
    vignette: true
  },
  audioReactivity: {
    bassIntensity: 2.0,  // Extra sensitive to bass
    midIntensity: 1.0,
    highIntensity: 0.5,
    beatSensitivity: 0.9 // Tight beat sync
  }
};

await fetch('http://localhost:3001/api/visualizer/generate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioFile: 'custom-track.mp3',
    recipe: customRecipe,
    settings: {
      width: 1280,
      height: 720,
      fps: 30
    }
  })
});
```

---

## Sprite Behaviors Explained

### Pulse
Scales sprite size with bass frequency. Perfect for:
- Main character/mascot
- Emphasizing drops
- Power-ups

### Spin
Rotates continuously, speed increases with energy:
- Coins/tokens
- Power symbols
- Energetic elements

### Bounce
Vertical bouncing motion, synced to beats:
- Characters jumping
- Coins collecting
- Victory animations

### Wave
Smooth sine wave horizontal motion:
- Flowing elements
- Water/liquid themes
- Calm vibes

### Scatter
Sprites explode outward from center with energy:
- Fireworks/celebration
- Market volatility
- Chaos energy

### Orbit
Circular motion around screen center:
- Satellites/planets
- Circling effects
- Hypnotic patterns

### Rain
Falls from top of screen continuously:
- Raining coins
- Stars falling
- Ambient effects

### Shake
Random jitter, intensity increases with high frequencies:
- Glitch effects
- Excitement/chaos
- Technical vibes

---

## Recipe Presets Cheat Sheet

| Recipe | Best For | Vibe | Effects |
|--------|----------|------|---------|
| **meme-pump** | Token launches, pump hype | Energetic, futuristic | Radial bg, bloom, trails, scanlines |
| **party-mode** | Celebrations, milestones | High energy, chaotic | Chromatic, particles, pulse bg |
| **chill-vibes** | Marketing, professional | Smooth, calming | Gradient, bloom, trails |
| **retro-arcade** | Gaming theme, nostalgia | 8-bit, retro | Solid bg, scanlines, chromatic |
| **crypto-chaos** | Market updates, volatility | Wild, unpredictable | All effects, green matrix vibes |

---

## Tips & Tricks

### 1. Match Sprite Count to Beat Complexity
- **Simple beat**: 2-3 sprites
- **Complex rhythm**: 4-6 sprites
- **Chaotic**: 6+ sprites

### 2. Audio Reactivity Settings
- **Bass-heavy music** (trap, dubstep): `bassIntensity: 2.0`
- **Melodic music** (house, trance): `midIntensity: 1.5`
- **High-energy** (drum & bass): `highIntensity: 1.5`

### 3. Social Media Optimization
- **Instagram Feed**: 1080x1080, 30fps, 15-30s
- **Instagram Stories**: 1080x1920, 30fps, 15s max
- **TikTok**: 1080x1920, 30fps, 15-60s
- **Twitter**: 1280x720, 30fps, 2:20 max
- **YouTube Shorts**: 1080x1920, 60fps, 60s max

### 4. Performance Tips
- Lower FPS (24-30) for faster rendering
- Reduce resolution for drafts (720p)
- Disable heavy effects (bloom, chromatic) for speed

---

## Workflow Example: Full Pipeline

```javascript
// 1. Upload audio
const audioFormData = new FormData();
audioFormData.append('audio', myAudioFile);
const { filename } = await (await fetch('/api/audio/upload', {
  method: 'POST',
  body: audioFormData
})).json();

// 2. Analyze audio (optional, but useful)
const analysis = await (await fetch('/api/audio/analyze', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ audioFile: filename })
})).json();

console.log(`Detected BPM: ${analysis.bpm}`);
console.log(`Duration: ${analysis.duration}s`);
console.log(`Beat count: ${analysis.beats.length}`);

// 3. Generate visualizer
const { videoUrl } = await (await fetch('/api/visualizer/generate-preset', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    audioFile: filename,
    recipeId: 'meme-pump',
    sprites: ['🐶', '🚀', '💰', '🌙'],
    settings: {
      width: 1920,
      height: 1080,
      fps: 30
    }
  })
})).json();

// 4. Download video
window.location.href = `http://localhost:3001${videoUrl}`;
```

---

## Need Help?

- **List all recipes**: `GET /api/visualizer/recipes`
- **Get recipe details**: `GET /api/visualizer/recipes/meme-pump`
- **Check server health**: `GET /api/health`

**Let's make your meme coin go viral! 🚀**
