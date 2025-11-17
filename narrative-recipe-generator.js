// ═══════════════════════════════════════════════════════════════
// NARRATIVE-DRIVEN RECIPE GENERATOR
// Inspired by ScripThreads screenplay analysis for music videos
// ═══════════════════════════════════════════════════════════════

class NarrativeRecipeGenerator {
    constructor() {
        this.visualCharacters = this.initVisualCharacters();
        this.narrativeStructures = this.initNarrativeStructures();
    }

    // ═══════════════════════════════════════════════════════════
    // VISUAL CHARACTER SYSTEM
    // (Like screenplay characters, but visual themes/motifs)
    // ═══════════════════════════════════════════════════════════

    initVisualCharacters() {
        return {
            'neon-hero': {
                name: 'Neon Hero',
                description: 'Primary visual motif - neon geometric shapes',
                presence_pattern: 'hyper-present', // In almost every shot
                visual_traits: ['geometric', 'neon', 'pulsing', 'abstract'],
                color_palette: ['#ff006e', '#00f5ff', '#7209b7'],
                subjects: [
                    'neon geometric shapes pulsing rhythmically',
                    'glowing abstract forms rotating',
                    'electric geometric patterns flowing'
                ]
            },
            'particle-ensemble': {
                name: 'Particle Ensemble',
                description: 'Supporting visual - particle systems',
                presence_pattern: 'episodic', // Appears in specific sections
                visual_traits: ['particles', 'swarm', 'organic', 'flowing'],
                color_palette: ['#00ff88', '#ffbe0b', '#ff006e'],
                subjects: [
                    'particle swarms forming patterns',
                    'glowing particles exploding',
                    'ethereal particle clouds morphing'
                ]
            },
            'liquid-protagonist': {
                name: 'Liquid Protagonist',
                description: 'Fluid simulations as main character',
                presence_pattern: 'parallel-narrative', // Alternates with others
                visual_traits: ['liquid', 'fluid', 'flowing', 'morphing'],
                color_palette: ['#a8dadc', '#457b9d', '#e63946'],
                subjects: [
                    'liquid metal flowing in slow motion',
                    'fluid simulations swirling',
                    'viscous liquid morphing shapes'
                ]
            },
            'glitch-antagonist': {
                name: 'Glitch Antagonist',
                description: 'Disruption and chaos element',
                presence_pattern: 'impact-moments', // Only at drops/builds
                visual_traits: ['glitch', 'distortion', 'chaos', 'digital'],
                color_palette: ['#ff0080', '#00f5ff', '#000000'],
                subjects: [
                    'reality glitching and fragmenting',
                    'digital corruption spreading',
                    'matrix-style digital breakdown'
                ]
            },
            'camera-narrator': {
                name: 'Camera Narrator',
                description: 'Camera movement as storytelling device',
                presence_pattern: 'continuous', // Always present via movement
                visual_traits: ['dynamic', 'cinematic', 'flowing'],
                movements: [
                    'smooth dolly push revealing detail',
                    'orbiting crane shot around subject',
                    'handheld drift following motion',
                    'slow zoom building tension'
                ]
            }
        };
    }

    // ═══════════════════════════════════════════════════════════
    // NARRATIVE STRUCTURE TEMPLATES
    // ═══════════════════════════════════════════════════════════

    initNarrativeStructures() {
        return {
            'hyper-present-hero': {
                name: 'Single Visual Motif (Hyper-Present)',
                description: 'One main visual element dominates every shot',
                character_distribution: {
                    primary: 95,    // Main motif in 95% of shots
                    secondary: 30,  // Supporting elements
                    tertiary: 10    // Occasional variations
                },
                example: 'Like Taxi Driver - protagonist in every scene',
                best_for: ['intense', 'focused', 'character-study', 'minimal']
            },
            'ensemble': {
                name: 'Visual Ensemble',
                description: 'Multiple visual themes share equal presence',
                character_distribution: {
                    primary: 70,
                    secondary: 65,
                    tertiary: 60,
                    quaternary: 55
                },
                example: 'Like The Big Chill - balanced character presence',
                best_for: ['complex', 'rich', 'layered', 'dynamic']
            },
            'parallel-narratives': {
                name: 'Alternating Visual Stories',
                description: 'Two or more visual themes alternate',
                character_distribution: {
                    threadA: 50,  // Alternates
                    threadB: 50,  // Alternates
                    bridge: 20    // Connects them
                },
                example: 'Like Lord of the Rings - parallel storylines',
                best_for: ['epic', 'contrast', 'journey', 'duality']
            },
            'episodic': {
                name: 'Episodic Segments',
                description: 'Distinct visual chapters',
                character_distribution: {
                    chapter1_visual: 100,  // Exclusive to chapter 1
                    chapter2_visual: 100,  // Exclusive to chapter 2
                    chapter3_visual: 100,  // Exclusive to chapter 3
                    recurring_motif: 30    // Appears in all chapters
                },
                example: 'Like Mishima - four distinct segments',
                best_for: ['storytelling', 'evolution', 'transformation']
            }
        };
    }

    // ═══════════════════════════════════════════════════════════
    // GENERATE NARRATIVE-DRIVEN RECIPE
    // ═══════════════════════════════════════════════════════════

    async generateNarrativeRecipe(audioAnalysis, userPreferences = {}) {
        console.log('🎬 Generating narrative-driven recipe...');

        // Step 1: Choose narrative structure based on audio
        const structure = this.selectNarrativeStructure(audioAnalysis);
        
        // Step 2: Cast visual "characters" (themes/motifs)
        const visualCast = this.castVisualCharacters(audioAnalysis, structure);
        
        // Step 3: Plan character thread timeline
        const characterThreads = this.planCharacterThreads(visualCast, audioAnalysis, structure);
        
        // Step 4: Generate shots based on character interactions
        const shotList = this.generateShotsFromThreads(characterThreads, audioAnalysis);
        
        // Step 5: Ensure visual continuity (like ScripThreads analysis)
        this.ensureVisualContinuity(shotList, characterThreads);
        
        const recipe = {
            version: '2.0-narrative',
            created_at: new Date().toISOString(),
            narrative_structure: structure,
            visual_cast: visualCast,
            character_threads: characterThreads,
            shot_list: shotList,
            metadata: {
                duration: audioAnalysis.duration,
                bpm: audioAnalysis.bpm,
                total_shots: shotList.length,
                narrative_type: structure.name
            }
        };

        console.log(`✅ Narrative recipe complete: ${structure.name} with ${visualCast.length} visual characters`);
        return recipe;
    }

    // ═══════════════════════════════════════════════════════════
    // NARRATIVE STRUCTURE SELECTION
    // ═══════════════════════════════════════════════════════════

    selectNarrativeStructure(audioAnalysis) {
        const { bpm, structure, beats } = audioAnalysis;
        const avgEnergy = this.calculateAverageEnergy(structure);
        const complexity = structure.length;

        // High energy, simple structure = Hyper-present hero
        if (avgEnergy > 0.8 && complexity <= 3) {
            return this.narrativeStructures['hyper-present-hero'];
        }
        
        // Multiple distinct sections = Episodic
        else if (complexity >= 5 && this.hasDistinctSections(structure)) {
            return this.narrativeStructures['episodic'];
        }
        
        // Medium energy, moderate complexity = Parallel narratives
        else if (avgEnergy > 0.5 && complexity >= 4) {
            return this.narrativeStructures['parallel-narratives'];
        }
        
        // Default = Ensemble
        else {
            return this.narrativeStructures['ensemble'];
        }
    }

    hasDistinctSections(structure) {
        const energyVariance = this.calculateEnergyVariance(structure);
        return energyVariance > 0.15; // High variance = distinct sections
    }

    calculateEnergyVariance(structure) {
        const energies = structure.map(s => s.energy || 0.5);
        const avg = energies.reduce((sum, e) => sum + e, 0) / energies.length;
        const variance = energies.reduce((sum, e) => sum + Math.pow(e - avg, 2), 0) / energies.length;
        return Math.sqrt(variance);
    }

    // ═══════════════════════════════════════════════════════════
    // VISUAL CHARACTER CASTING
    // ═══════════════════════════════════════════════════════════

    castVisualCharacters(audioAnalysis, structure) {
        const cast = [];

        if (structure.name === 'Single Visual Motif (Hyper-Present)') {
            // One main character, minimal support
            cast.push({
                character: this.visualCharacters['neon-hero'],
                role: 'protagonist',
                presence_target: 95
            });
            cast.push({
                character: this.visualCharacters['particle-ensemble'],
                role: 'supporting',
                presence_target: 20
            });
        }
        
        else if (structure.name === 'Visual Ensemble') {
            // Multiple balanced characters
            cast.push({
                character: this.visualCharacters['neon-hero'],
                role: 'co-lead',
                presence_target: 70
            });
            cast.push({
                character: this.visualCharacters['liquid-protagonist'],
                role: 'co-lead',
                presence_target: 65
            });
            cast.push({
                character: this.visualCharacters['particle-ensemble'],
                role: 'co-lead',
                presence_target: 60
            });
            cast.push({
                character: this.visualCharacters['glitch-antagonist'],
                role: 'supporting',
                presence_target: 30
            });
        }
        
        else if (structure.name === 'Alternating Visual Stories') {
            // Two parallel threads
            cast.push({
                character: this.visualCharacters['neon-hero'],
                role: 'thread-A',
                presence_target: 50,
                thread_id: 'A'
            });
            cast.push({
                character: this.visualCharacters['liquid-protagonist'],
                role: 'thread-B',
                presence_target: 50,
                thread_id: 'B'
            });
            cast.push({
                character: this.visualCharacters['glitch-antagonist'],
                role: 'bridge',
                presence_target: 20,
                thread_id: 'BOTH'
            });
        }
        
        else if (structure.name === 'Episodic Segments') {
            // Different character per chapter
            cast.push({
                character: this.visualCharacters['neon-hero'],
                role: 'chapter-1',
                presence_target: 100,
                chapter: 1
            });
            cast.push({
                character: this.visualCharacters['liquid-protagonist'],
                role: 'chapter-2',
                presence_target: 100,
                chapter: 2
            });
            cast.push({
                character: this.visualCharacters['particle-ensemble'],
                role: 'chapter-3',
                presence_target: 100,
                chapter: 3
            });
            cast.push({
                character: this.visualCharacters['camera-narrator'],
                role: 'recurring',
                presence_target: 100, // Camera always present
                chapter: 'all'
            });
        }

        return cast;
    }

    // ═══════════════════════════════════════════════════════════
    // CHARACTER THREAD PLANNING (like ScripThreads visualization)
    // ═══════════════════════════════════════════════════════════

    planCharacterThreads(visualCast, audioAnalysis, structure) {
        const threads = [];
        const { duration, beats, structure: sections } = audioAnalysis;

        visualCast.forEach(castMember => {
            const thread = {
                character_id: castMember.character.name,
                color: castMember.character.color_palette[0],
                presence_target: castMember.presence_target,
                appearances: []
            };

            // Calculate when this character should appear
            if (structure.name === 'Single Visual Motif (Hyper-Present)') {
                // Protagonist in almost every shot
                if (castMember.role === 'protagonist') {
                    thread.appearances = beats.map((beat, i) => ({
                        time: beat,
                        duration: beats[i + 1] ? beats[i + 1] - beat : 2,
                        intensity: this.getEnergyAtTime(beat, audioAnalysis)
                    }));
                }
            }
            
            else if (structure.name === 'Alternating Visual Stories') {
                // Alternating pattern
                const threadPattern = castMember.thread_id === 'A' ? [true, false] : [false, true];
                beats.forEach((beat, i) => {
                    if (threadPattern[i % 2] || castMember.thread_id === 'BOTH') {
                        thread.appearances.push({
                            time: beat,
                            duration: beats[i + 1] ? beats[i + 1] - beat : 2,
                            co_occurrence: castMember.thread_id === 'BOTH' ? ['thread-A', 'thread-B'] : []
                        });
                    }
                });
            }
            
            else if (structure.name === 'Episodic Segments') {
                // Only in assigned chapter
                sections.forEach((section, idx) => {
                    if (castMember.chapter === 'all' || castMember.chapter === idx + 1) {
                        const sectionBeats = beats.filter(b => b >= section.start && b < section.end);
                        sectionBeats.forEach((beat, i) => {
                            thread.appearances.push({
                                time: beat,
                                duration: sectionBeats[i + 1] ? sectionBeats[i + 1] - beat : 2,
                                chapter: idx + 1
                            });
                        });
                    }
                });
            }
            
            else {
                // Ensemble - distribute evenly
                const targetCount = Math.floor(beats.length * (castMember.presence_target / 100));
                const step = Math.floor(beats.length / targetCount);
                
                for (let i = 0; i < beats.length; i += step) {
                    if (thread.appearances.length >= targetCount) break;
                    thread.appearances.push({
                        time: beats[i],
                        duration: beats[i + 1] ? beats[i + 1] - beats[i] : 2
                    });
                }
            }

            threads.push(thread);
        });

        return threads;
    }

    // ═══════════════════════════════════════════════════════════
    // SHOT GENERATION FROM CHARACTER THREADS
    // ═══════════════════════════════════════════════════════════

    generateShotsFromThreads(characterThreads, audioAnalysis) {
        const shots = [];
        const allAppearances = [];

        // Collect all appearances from all threads
        characterThreads.forEach(thread => {
            thread.appearances.forEach(app => {
                allAppearances.push({
                    ...app,
                    character: thread.character_id,
                    color: thread.color
                });
            });
        });

        // Sort by time
        allAppearances.sort((a, b) => a.time - b.time);

        // Generate shot for each appearance
        allAppearances.forEach((appearance, i) => {
            const character = characterThreads.find(t => t.character_id === appearance.character);
            const energy = this.getEnergyAtTime(appearance.time, audioAnalysis);

            shots.push({
                id: `shot_${String(i + 1).padStart(3, '0')}`,
                timestamp: appearance.time,
                duration: appearance.duration,
                visual_character: appearance.character,
                mochi_prompt: this.generateCharacterPrompt(appearance.character, energy, appearance),
                energy_level: energy,
                co_occurring_characters: appearance.co_occurrence || [],
                effects: this.selectEffectsForCharacter(appearance.character, energy),
                num_frames: Math.round(appearance.duration * 24)
            });
        });

        return shots.sort((a, b) => a.timestamp - b.timestamp);
    }

    generateCharacterPrompt(characterName, energy, appearance) {
        // Find character definition
        const char = Object.values(this.visualCharacters).find(c => c.name === characterName);
        if (!char) return 'abstract visual effects';

        const subject = char.subjects[Math.floor(Math.random() * char.subjects.length)];
        const motion = energy > 0.7 ? 'fast aggressive motion' : energy > 0.4 ? 'smooth flowing motion' : 'slow deliberate motion';
        const camera = 'dynamic camera movement';
        const quality = 'cinematic, high quality, 4K, smooth motion';

        return `${subject}, ${motion}, ${camera}, ${quality}`;
    }

    selectEffectsForCharacter(characterName, energy) {
        const char = Object.values(this.visualCharacters).find(c => c.name === characterName);
        if (!char) return [];

        const effects = [];
        
        if (char.visual_traits.includes('glitch')) {
            effects.push('glitch-heavy', 'chromatic-aberration-extreme');
        } else if (char.visual_traits.includes('liquid')) {
            effects.push('fluid-distortion', 'displacement-map');
        } else if (char.visual_traits.includes('neon')) {
            effects.push('bloom-intense', 'glow');
        }

        if (energy > 0.8) {
            effects.push('screen-shake', 'radial-blur');
        }

        return effects;
    }

    // ═══════════════════════════════════════════════════════════
    // VISUAL CONTINUITY (prevent jarring transitions)
    // ═══════════════════════════════════════════════════════════

    ensureVisualContinuity(shotList, characterThreads) {
        console.log('  🎨 Ensuring visual continuity...');

        for (let i = 1; i < shotList.length; i++) {
            const prev = shotList[i - 1];
            const curr = shotList[i];

            // If switching between very different visual characters, smooth transition
            if (prev.visual_character !== curr.visual_character) {
                const similarity = this.calculateVisualSimilarity(prev.visual_character, curr.visual_character);
                
                if (similarity < 0.3) {
                    curr.transition_in = 'cross-dissolve-slow';
                    console.log(`    Smoothed transition at ${curr.timestamp.toFixed(1)}s (low similarity: ${similarity.toFixed(2)})`);
                }
            }
        }
    }

    calculateVisualSimilarity(char1Name, char2Name) {
        const c1 = Object.values(this.visualCharacters).find(c => c.name === char1Name);
        const c2 = Object.values(this.visualCharacters).find(c => c.name === char2Name);
        
        if (!c1 || !c2) return 0.5;

        // Compare visual traits
        const commonTraits = c1.visual_traits.filter(t => c2.visual_traits.includes(t));
        return commonTraits.length / Math.max(c1.visual_traits.length, c2.visual_traits.length);
    }

    // ═══════════════════════════════════════════════════════════
    // UTILITIES
    // ═══════════════════════════════════════════════════════════

    getEnergyAtTime(time, audioAnalysis) {
        if (!audioAnalysis.energyCurve) return 0.5;
        const point = audioAnalysis.energyCurve.find(e => Math.abs(e.time - time) < 0.5);
        return point ? point.normalized : 0.5;
    }

    calculateAverageEnergy(structure) {
        const totalEnergy = structure.reduce((sum, s) => sum + (s.energy || 0), 0);
        return totalEnergy / structure.length;
    }
}

// ═══════════════════════════════════════════════════════════════
// EXPORT
// ═══════════════════════════════════════════════════════════════

if (typeof module !== 'undefined' && module.exports) {
    module.exports = NarrativeRecipeGenerator;
}
