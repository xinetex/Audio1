# AUDIO1.TV PRO MAX - Anime.js Integration Plan

## Current State
- anime.js **IS loaded** (line 7: CDN link)
- **NOT being used** - only basic canvas rendering
- Massive untapped potential

## Anime.js Capabilities We Should Use

### 1. **Timeline Sequences** (Currently Missing)
```javascript
anime.timeline({
  easing: 'easeOutExpo',
  duration: 750
})
.add({
  targets: '.image-layer',
  translateX: [0, 250],
  scale: [1, 1.2],
  rotate: '1turn'
})
.add({
  targets: '.text-layer',
  opacity: [0, 1],
  translateY: [-50, 0]
}, '-=500'); // Start 500ms before previous ends
```

### 2. **Spring Physics** (Currently Missing)
```javascript
anime({
  targets: element,
  scale: [0, 1],
  duration: 800,
  easing: 'spring(1, 80, 10, 0)' // mass, stiffness, damping, velocity
});
```

### 3. **Stagger Effects** (Currently Missing)
```javascript
anime({
  targets: '.hashtag',
  translateY: [-100, 0],
  opacity: [0, 1],
  delay: anime.stagger(100) // Each element 100ms after previous
});
```

### 4. **Motion Paths** (Currently Missing)
```javascript
const path = anime.path('.svg-path');
anime({
  targets: '.image',
  translateX: path('x'),
  translateY: path('y'),
  rotate: path('angle')
});
```

## AI Animation Director System

### Intelligence Levels

**SMART Mode** (Default):
- Analyzes: BPM, energy curve, section type, beat strength
- Chooses easing based on energy: 
  - Low energy → `easeOutQuad`, `easeInOutSine`
  - High energy → `easeOutElastic`, `spring`
  - Chorus → `easeOutBounce`, rapid cuts
- Duration matches beat intervals
- Composition blends on overlapping clips

**AGGRESSIVE Mode**:
- Always uses `spring` or `easeOutElastic`
- Short durations (0.3-0.8s)
- Composition: `'blend'` for multi-layering
- Rapid-fire stagger on text

**SMOOTH Mode**:
- `easeInOutQuad`, `easeInOutCubic`
- Longer durations (2-4s)
- Gentle motion paths
- Fade compositions

**CHAOTIC Mode**:
- Random easings per clip
- Overlapping animations
- Glitch effects with `anime.random()`
- RGB split, distortion

**MINIMAL Mode**:
- Only `linear` and `easeInOut`
- No stagger
- Simple fades
- Clean cuts

### AI Decision Tree

```javascript
function getAIAnimation(clip, section, energy, bass) {
  const mode = STATE.settings.aiDirector;
  
  if (mode === 'smart') {
    // Analyze context
    if (section.type === 'chorus' && energy > 0.7) {
      return {
        easing: 'spring(1, 100, 8, 0)',
        duration: 300,
        effects: ['scale', 'rotate', 'glow']
      };
    } else if (section.type === 'verse' && energy < 0.4) {
      return {
        easing: 'easeOutQuad',
        duration: 2000,
        effects: ['fadeIn', 'slideUp']
      };
    }
    // ... more logic
  }
  
  // Other modes have preset behaviors
}
```

## Text Overlay Layer System

### Structure
```javascript
STATE.textOverlays = [
  {
    id: timestamp,
    text: "SUBSCRIBE NOW",
    position: 'bottomLeft', // or { x: 100, y: 200 }
    animation: 'spring',
    start: 10.5,
    duration: 3,
    style: {
      fontSize: 60,
      color: '#ff006e',
      fontWeight: 900
    }
  }
];
```

### Anime.js Implementation
```javascript
function renderTextOverlay(overlay, currentTime) {
  const progress = (currentTime - overlay.start) / overlay.duration;
  
  if (progress >= 0 && progress <= 1) {
    const element = createTextElement(overlay);
    
    anime({
      targets: element,
      ...getOverlayAnimation(overlay.animation),
      update: () => {
        // Draw to canvas
        drawTextToCanvas(element);
      }
    });
  }
}
```

### Available Animations
1. **fadeIn** - Opacity 0→1
2. **slideUp** - TranslateY +100→0
3. **slideDown** - TranslateY -100→0
4. **slideLeft** - TranslateX +200→0
5. **slideRight** - TranslateX -200→0
6. **bounce** - easeOutBounce scale
7. **elastic** - easeOutElastic arrival
8. **spring** - Spring physics entrance
9. **glitch** - Stagger + RGB split
10. **typewriter** - Char-by-char reveal with stagger

## Implementation Plan

### Phase 1: Core Anime.js Integration
- [ ] Replace canvas rendering with anime-powered DOM elements
- [ ] Add anime.timeline() for clip sequences
- [ ] Implement spring physics for transitions

### Phase 2: AI Director
- [ ] Build decision tree for animation selection
- [ ] Add energy/BPM/section analysis
- [ ] Create preset modes (aggressive, smooth, etc.)

### Phase 3: Text Overlay System
- [ ] Add UI modal for overlay creation
- [ ] Implement 10 animation types
- [ ] Add manual positioning controls

### Phase 4: Advanced Features
- [ ] Motion paths from SVG
- [ ] Stagger for multi-element scenes
- [ ] Morphing shapes for transitions

## Performance Considerations

- **Canvas vs DOM**: Anime.js works on DOM, but we can:
  1. Use offscreen DOM elements
  2. Capture with `drawImage(domElement)`
  3. Or create hybrid layer system

- **60fps Target**: anime.js uses requestAnimationFrame internally

- **Memory**: Limit active animations to current + next clip

## Example: Before/After

### BEFORE (Current):
```javascript
if (transition === 'zoom') {
  const zoomScale = 1 + bass * 0.2;
  ctx.scale(zoomScale, zoomScale);
}
```

### AFTER (With Anime.js):
```javascript
const animation = getAIAnimation(clip, section, energy, bass);

anime({
  targets: imageElement,
  scale: [1, 1 + bass * 0.5],
  rotate: '0.5turn',
  easing: animation.easing, // AI chooses this
  duration: animation.duration,
  composition: 'blend'
});
```

## Benefits
1. **Smoother animations** - Professional easing functions
2. **More creative** - Springs, bounces, elastic
3. **AI intelligence** - Context-aware animation choices
4. **Text overlays** - Professional call-to-actions, titles
5. **Less code** - Anime.js handles complexity
6. **Better timing** - Timeline sequences sync perfectly

## Next Steps
1. Add anime.js rendering layer (hybrid system)
2. Implement AI Director decision logic
3. Wire up text overlay UI
4. Add advanced effects (stagger, motion paths)
