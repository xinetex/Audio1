// ═══════════════════════════════════════════════════════════════
// AI RECIPE GENERATOR - Music Video Production Planner
// ═══════════════════════════════════════════════════════════════

class RecipeGenerator {
    constructor() {
        this.aestheticLibrary = this.initAestheticLibrary();
        this.promptTemplates = this.initPromptTemplates();
        this.transitionLibrary = this.initTransitionLibrary();
    }

    // ═══════════════════════════════════════════════════════════
    // MAIN RECIPE GENERATION
    // ═══════════════════════════════════════════════════════════

    async generateRecipe(audioAnalysis, userPreferences = {}) {
        console.log('🎬 Generating video recipe...');
        
        const recipe = {
            version: '1.0',
            created_at: new Date().toISOString(),
            metadata: this.extractMetadata(audioAnalysis),
            visual_style: this.determineAesthetic(audioAnalysis, userPreferences),
            shot_list: [],
            assembly_instructions: {}
        };

        // Plan shots for each section
        for (const section of audioAnalysis.structure) {
            const shots = this.planSection(section, audioAnalysis, recipe.visual_style);
            recipe.shot_list.push(...shots);
        }

        // Add impact moments (drops, builds)
        this.addKeyMoments(recipe, audioAnalysis);

        // Ensure visual flow
        this.ensureVisualContinuity(recipe);

        // Generate assembly instructions
        recipe.assembly_instructions = this.generateAssemblyInstructions(recipe, audioAnalysis);

        console.log(`✅ Recipe complete: ${recipe.shot_list.length} shots planned`);
        return recipe;
    }

    // ═══════════════════════════════════════════════════════════
    // AESTHETIC DETERMINATION
    // ═══════════════════════════════════════════════════════════

    determineAesthetic(audioAnalysis, userPreferences) {
        const { bpm, energy, structure } = audioAnalysis;
        const avgEnergy = this.calculateAverageEnergy(structure);

        // User override
        if (userPreferences.aesthetic) {
            return this.aestheticLibrary[userPreferences.aesthetic];
        }

        // Rule-based aesthetic matching
        if (avgEnergy > 0.8 && bpm > 120) {
            return this.aestheticLibrary['cyberpunk-rave'];
        } else if (avgEnergy > 0.6 && bpm > 110) {
            return this.aestheticLibrary['neon-abstract'];
        } else if (avgEnergy < 0.4 && bpm < 100) {
            return this.aestheticLibrary['dreamy-ethereal'];
        } else if (avgEnergy < 0.3) {
            return this.aestheticLibrary['minimal-calm'];
        } else {
            return this.aestheticLibrary['vibrant-dynamic'];
        }
    }

    initAestheticLibrary() {
        return {
            'cyberpunk-rave': {
                name: 'Cyberpunk Rave',
                color_palette: ['#ff006e', '#00f5ff', '#7209b7', '#00ff88', '#ff0080'],
                keywords: ['neon', 'digital', 'glitch', 'holographic', 'cyberpunk', 'futuristic'],
                motion_intensity: 'extreme',
                camera_style: 'aggressive-handheld',
                subjects: [
                    'neon geometric shapes pulsing violently',
                    'holographic particles exploding',
                    'digital glitch waves rippling through space',
                    'laser beams cutting through dense fog',
                    'abstract circuit patterns flowing rapidly',
                    'matrix-style digital rain cascading',
                    'chromatic aberration geometric tunnels'
                ]
            },
            'neon-abstract': {
                name: 'Neon Abstract',
                color_palette: ['#ff006e', '#00f5ff', '#7209b7', '#ffbe0b'],
                keywords: ['neon', 'abstract', 'fluid', 'vivid', 'electric'],
                motion_intensity: 'high',
                camera_style: 'smooth-dynamic',
                subjects: [
                    'neon liquid pouring in slow motion',
                    'abstract neon shapes morphing',
                    'electric plasma waves flowing',
                    'vibrant geometric patterns expanding',
                    'neon paint splashes in zero gravity',
                    'glowing fluid simulations swirling'
                ]
            },
            'dreamy-ethereal': {
                name: 'Dreamy Ethereal',
                color_palette: ['#a8dadc', '#f1faee', '#e63946', '#457b9d', '#1d3557'],
                keywords: ['soft', 'dreamy', 'ethereal', 'floating', 'peaceful', 'clouds'],
                motion_intensity: 'low',
                camera_style: 'slow-drift',
                subjects: [
                    'soft pastel clouds morphing gently',
                    'ethereal light rays piercing through mist',
                    'floating geometric crystals rotating slowly',
                    'smooth gradient waves flowing',
                    'delicate particles drifting upward',
                    'dreamy bokeh lights twinkling'
                ]
            },
            'minimal-calm': {
                name: 'Minimal Calm',
                color_palette: ['#264653', '#2a9d8f', '#e9c46a', '#f4a261', '#e76f51'],
                keywords: ['minimal', 'calm', 'simple', 'clean', 'meditative'],
                motion_intensity: 'minimal',
                camera_style: 'static-contemplative',
                subjects: [
                    'single geometric shape rotating slowly',
                    'minimal line patterns breathing',
                    'simple color gradients shifting',
                    'zen-like abstract forms',
                    'clean geometric compositions'
                ]
            },
            'vibrant-dynamic': {
                name: 'Vibrant Dynamic',
                color_palette: ['#06ffa5', '#fffb00', '#ff006e', '#8338ec'],
                keywords: ['vibrant', 'dynamic', 'energetic', 'colorful', 'bold'],
                motion_intensity: 'medium-high',
                camera_style: 'dynamic',
                subjects: [
                    'colorful abstract shapes dancing',
                    'vibrant particle explosions',
                    'dynamic geometric patterns',
                    'bold color waves colliding',
                    'energetic fluid simulations'
                ]
            }
        };
    }

    // ═══════════════════════════════════════════════════════════
    // SHOT PLANNING
    // ═══════════════════════════════════════════════════════════

    planSection(section, audioAnalysis, visualStyle) {
        const shots = [];
        const { type, start, end, energy } = section;
        const duration = end - start;

        // Shot density based on energy
        const shotDuration = this.calculateShotDuration(energy, type);
        const numShots = Math.ceil(duration / shotDuration);

        console.log(`  📹 Planning ${numShots} shots for ${type} (${duration.toFixed(1)}s, energy: ${energy.toFixed(2)})`);

        for (let i = 0; i < numShots; i++) {
            const shotStart = start + (i * shotDuration);
            const actualDuration = Math.min(shotDuration, end - shotStart);

            shots.push({
                id: `shot_${String(shots.length + 1).padStart(3, '0')}`,
                timestamp: shotStart,
                duration: actualDuration,
                section: type,
                mochi_prompt: this.generateMochiPrompt(section, i, visualStyle, audioAnalysis),
                visual_theme: this.selectVisualTheme(energy, type, i),
                energy_level: energy,
                transition_in: this.selectTransition(energy, 'in', type),
                transition_out: this.selectTransition(energy, 'out', type),
                effects: this.selectEffects(energy, type),
                num_frames: Math.round(actualDuration * 24) // 24fps for Mochi
            });
        }

        return shots;
    }

    calculateShotDuration(energy, sectionType) {
        // High energy = shorter cuts, low energy = longer shots
        if (sectionType === 'drop' || sectionType === 'buildup') {
            return energy > 0.8 ? 2 : 3;
        } else if (sectionType === 'intro' || sectionType === 'outro') {
            return 6;
        } else if (energy > 0.7) {
            return 3;
        } else if (energy > 0.4) {
            return 5;
        } else {
            return 7;
        }
    }

    // ═══════════════════════════════════════════════════════════
    // MOCHI PROMPT GENERATION
    // ═══════════════════════════════════════════════════════════

    generateMochiPrompt(section, shotIndex, visualStyle, audioAnalysis) {
        const { type, energy } = section;
        
        // Select subject from aesthetic library
        const subjects = visualStyle.subjects;
        const subject = subjects[shotIndex % subjects.length];
        
        // Motion style based on energy
        const motion = this.getMotionStyle(energy);
        
        // Lighting based on section type
        const lighting = this.getLighting(type, energy);
        
        // Camera movement
        const camera = this.getCameraMovement(energy, visualStyle.camera_style);
        
        // Quality modifiers
        const quality = 'cinematic, high quality, 4K, smooth motion, professional';
        
        return `${subject}, ${motion}, ${camera}, ${lighting}, ${quality}`;
    }

    getMotionStyle(energy) {
        if (energy > 0.8) {
            return 'fast aggressive motion, rapid movement, intense dynamics';
        } else if (energy > 0.6) {
            return 'dynamic flowing motion, energetic movement';
        } else if (energy > 0.4) {
            return 'smooth moderate motion, gentle flow';
        } else {
            return 'slow deliberate motion, calm drift';
        }
    }

    getLighting(sectionType, energy) {
        const lightingMap = {
            'intro': 'soft ambient lighting, gentle glow',
            'verse': 'balanced lighting, natural illumination',
            'buildup': 'dramatic lighting building intensity, growing brightness',
            'drop': 'explosive lighting, intense flashes, high contrast',
            'chorus': 'vibrant colorful lighting, energetic illumination',
            'break': 'moody atmospheric lighting, dim ambiance',
            'outro': 'fading gentle lighting, soft sunset glow'
        };
        
        return lightingMap[sectionType] || 'balanced cinematic lighting';
    }

    getCameraMovement(energy, cameraStyle) {
        const movements = {
            'aggressive-handheld': [
                'aggressive handheld camera shake',
                'rapid camera movements',
                'intense dolly zoom',
                'dynamic whip pan'
            ],
            'smooth-dynamic': [
                'smooth camera dolly',
                'elegant crane shot',
                'flowing steadicam',
                'gentle camera orbit'
            ],
            'slow-drift': [
                'slow camera drift',
                'subtle camera float',
                'gentle push in',
                'minimal camera sway'
            ],
            'static-contemplative': [
                'static camera',
                'locked-off composition',
                'subtle camera breathe'
            ],
            'dynamic': [
                'dynamic camera movement',
                'sweeping camera arc',
                'smooth tracking shot'
            ]
        };

        const options = movements[cameraStyle] || movements['dynamic'];
        const intensity = energy > 0.7 ? 0 : energy > 0.4 ? 1 : 2;
        return options[Math.min(intensity, options.length - 1)];
    }

    selectVisualTheme(energy, sectionType, shotIndex) {
        const themes = {
            high: ['explosive', 'intense', 'chaotic', 'aggressive'],
            medium: ['dynamic', 'flowing', 'vibrant', 'energetic'],
            low: ['calm', 'gentle', 'serene', 'peaceful']
        };

        const energyLevel = energy > 0.7 ? 'high' : energy > 0.4 ? 'medium' : 'low';
        const themeList = themes[energyLevel];
        return themeList[shotIndex % themeList.length];
    }

    // ═══════════════════════════════════════════════════════════
    // TRANSITIONS & EFFECTS
    // ═══════════════════════════════════════════════════════════

    selectTransition(energy, direction, sectionType) {
        if (sectionType === 'drop') {
            return direction === 'in' ? 'explosion' : 'hard-cut';
        } else if (energy > 0.7) {
            return direction === 'in' ? 'quick-cut' : 'glitch';
        } else if (energy > 0.4) {
            return direction === 'in' ? 'dissolve' : 'fade';
        } else {
            return direction === 'in' ? 'slow-fade' : 'dissolve';
        }
    }

    selectEffects(energy, sectionType) {
        const effects = [];

        if (energy > 0.8) {
            effects.push('chromatic-aberration-heavy', 'screen-shake', 'bloom-intense');
        } else if (energy > 0.6) {
            effects.push('chromatic-aberration-medium', 'bloom', 'glow');
        } else if (energy > 0.4) {
            effects.push('chromatic-aberration-light', 'subtle-bloom', 'vignette');
        } else {
            effects.push('soft-glow', 'gentle-vignette');
        }

        if (sectionType === 'drop') {
            effects.push('flash', 'radial-blur');
        }

        return effects;
    }

    initTransitionLibrary() {
        return {
            'fade': { duration: 1.0, type: 'alpha' },
            'dissolve': { duration: 0.8, type: 'crossfade' },
            'quick-cut': { duration: 0.1, type: 'hard' },
            'hard-cut': { duration: 0, type: 'hard' },
            'glitch': { duration: 0.3, type: 'glitch' },
            'explosion': { duration: 0.5, type: 'radial' },
            'slow-fade': { duration: 2.0, type: 'alpha' },
            'zoom-blur': { duration: 0.5, type: 'zoom' }
        };
    }

    // ═══════════════════════════════════════════════════════════
    // KEY MOMENTS (DROPS, BUILDS, BREAKS)
    // ═══════════════════════════════════════════════════════════

    addKeyMoments(recipe, audioAnalysis) {
        const keyMoments = audioAnalysis.structure.filter(s =>
            ['drop', 'buildup', 'break'].includes(s.type)
        );

        console.log(`  ⚡ Adding ${keyMoments.length} key impact moments`);

        keyMoments.forEach(moment => {
            const impactShot = {
                id: `impact_${moment.type}_${moment.start.toFixed(0)}`,
                timestamp: moment.start,
                duration: moment.type === 'drop' ? 2 : 1.5,
                section: moment.type,
                mochi_prompt: this.generateImpactPrompt(moment, recipe.visual_style),
                visual_theme: 'impact-moment',
                energy_level: 1.0,
                transition_in: 'explosion',
                transition_out: 'hard-cut',
                effects: ['screen-shake-extreme', 'flash-white', 'chromatic-aberration-extreme', 'radial-blur'],
                num_frames: Math.round(2 * 24),
                is_key_moment: true
            };

            // Insert at correct position
            const insertIndex = recipe.shot_list.findIndex(s => s.timestamp >= moment.start);
            if (insertIndex !== -1) {
                // Replace shot at this timestamp
                recipe.shot_list.splice(insertIndex, 1, impactShot);
            } else {
                recipe.shot_list.push(impactShot);
            }
        });
    }

    generateImpactPrompt(moment, visualStyle) {
        const impactPrompts = {
            'drop': [
                'massive explosion of neon particles, shockwave expanding, extreme intensity',
                'reality shattering into fractal pieces, kaleidoscope explosion',
                'supernova burst of colored energy, universe collapsing',
                'digital world glitching and reconstructing, matrix breakdown'
            ],
            'buildup': [
                'tension building with accelerating particles, anticipation growing',
                'energy accumulating into vortex, spiral intensifying',
                'compressed spring about to release, pressure mounting'
            ],
            'break': [
                'sudden silence visualized as frozen particles, time stop',
                'empty void with single floating element, isolation',
                'calm after storm, settling dust particles'
            ]
        };

        const prompts = impactPrompts[moment.type] || impactPrompts['drop'];
        const prompt = prompts[Math.floor(Math.random() * prompts.length)];
        return `${prompt}, cinematic drama, 4K quality, smooth motion, high impact`;
    }

    // ═══════════════════════════════════════════════════════════
    // VISUAL CONTINUITY
    // ═══════════════════════════════════════════════════════════

    ensureVisualContinuity(recipe) {
        console.log('  🎨 Ensuring visual continuity...');
        
        for (let i = 1; i < recipe.shot_list.length; i++) {
            const prev = recipe.shot_list[i - 1];
            const curr = recipe.shot_list[i];

            // If energy jump is too large, smooth transition
            const energyDiff = Math.abs(curr.energy_level - prev.energy_level);
            if (energyDiff > 0.4 && !curr.is_key_moment) {
                curr.transition_in = 'glitch-dissolve';
                console.log(`    Smoothed transition at ${curr.timestamp.toFixed(1)}s (energy jump: ${energyDiff.toFixed(2)})`);
            }

            // Avoid too many hard cuts in a row
            if (i >= 2) {
                const prevPrev = recipe.shot_list[i - 2];
                if (prev.transition_out === 'hard-cut' && curr.transition_in === 'hard-cut') {
                    curr.transition_in = 'quick-cut';
                }
            }
        }
    }

    // ═══════════════════════════════════════════════════════════
    // ASSEMBLY INSTRUCTIONS
    // ═══════════════════════════════════════════════════════════

    generateAssemblyInstructions(recipe, audioAnalysis) {
        return {
            beat_sync: {
                mode: 'strict',
                beat_threshold: 0.05,
                snap_to_beats: true
            },
            transitions: this.mapSectionTransitions(audioAnalysis.structure),
            effects_timeline: this.generateEffectsTimeline(recipe, audioAnalysis),
            audio_reactive: {
                bass_drives: 'scale',
                mids_drive: 'rotation',
                highs_drive: 'brightness',
                kick_triggers: 'flash'
            },
            output: {
                resolution: '1920x1080',
                fps: 60,
                codec: 'libx264',
                crf: 18,
                audio_bitrate: '320k'
            }
        };
    }

    mapSectionTransitions(structure) {
        const transitions = {};
        for (let i = 0; i < structure.length - 1; i++) {
            const from = structure[i].type;
            const to = structure[i + 1].type;
            const key = `${from}_to_${to}`;
            
            transitions[key] = this.selectSectionTransition(from, to);
        }
        return transitions;
    }

    selectSectionTransition(from, to) {
        const transitionMap = {
            'intro_verse': 'slow-dissolve',
            'verse_buildup': 'quick-cuts',
            'buildup_drop': 'explosion',
            'drop_chorus': 'zoom-blur',
            'chorus_verse': 'dissolve',
            'verse_outro': 'slow-fade'
        };

        return transitionMap[`${from}_${to}`] || 'dissolve';
    }

    generateEffectsTimeline(recipe, audioAnalysis) {
        const timeline = [];

        // Add effects for key moments
        const keyShots = recipe.shot_list.filter(s => s.is_key_moment);
        keyShots.forEach(shot => {
            timeline.push({
                time: shot.timestamp,
                event: shot.section,
                effects: shot.effects
            });
        });

        return timeline;
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    extractMetadata(audioAnalysis) {
        return {
            duration: audioAnalysis.duration,
            bpm: audioAnalysis.bpm,
            num_beats: audioAnalysis.beats.length,
            num_sections: audioAnalysis.structure.length,
            average_energy: this.calculateAverageEnergy(audioAnalysis.structure)
        };
    }

    calculateAverageEnergy(structure) {
        const totalEnergy = structure.reduce((sum, s) => sum + (s.energy || 0), 0);
        return totalEnergy / structure.length;
    }

    initPromptTemplates() {
        // For future expansion
        return {};
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = RecipeGenerator;
}
