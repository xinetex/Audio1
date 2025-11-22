import express from 'express';
import { 
  generateMusicVisualizer, 
  VISUALIZER_RECIPES,
  type VisualizerRequest 
} from '../services/musicVisualizer.js';

export const visualizerRouter = express.Router();

/**
 * GET /api/visualizer/recipes
 * Get all available visualizer recipe presets
 */
visualizerRouter.get('/recipes', (_req, res) => {
  const recipes = Object.entries(VISUALIZER_RECIPES).map(([id, recipe]) => ({
    id,
    name: recipe.name,
    description: recipe.description,
    preview: {
      sprites: recipe.sprites.map(s => s.sprite),
      background: recipe.effects.backgroundColor
    }
  }));
  
  res.json({ recipes });
});

/**
 * GET /api/visualizer/recipes/:id
 * Get specific recipe details
 */
visualizerRouter.get('/recipes/:id', (req, res) => {
  const recipe = VISUALIZER_RECIPES[req.params.id];
  
  if (!recipe) {
    return res.status(404).json({ error: 'Recipe not found' });
  }
  
  res.json({ recipe });
});

/**
 * POST /api/visualizer/generate
 * Generate music visualizer video
 */
visualizerRouter.post('/generate', async (req, res) => {
  try {
    const request: VisualizerRequest = req.body;
    
    if (!request.audioFile) {
      return res.status(400).json({ error: 'Audio file required' });
    }
    
    if (!request.recipe) {
      return res.status(400).json({ error: 'Recipe required' });
    }
    
    const result = await generateMusicVisualizer(request);
    res.json(result);
  } catch (error) {
    console.error('Visualizer generation error:', error);
    res.status(500).json({
      error: 'Failed to generate visualizer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

/**
 * POST /api/visualizer/generate-preset
 * Generate visualizer with preset recipe (simplified API)
 */
visualizerRouter.post('/generate-preset', async (req, res) => {
  try {
    const { audioFile, recipeId, sprites, settings } = req.body;
    
    if (!audioFile) {
      return res.status(400).json({ error: 'Audio file required' });
    }
    
    if (!recipeId) {
      return res.status(400).json({ error: 'Recipe ID required' });
    }
    
    const baseRecipe = VISUALIZER_RECIPES[recipeId];
    if (!baseRecipe) {
      return res.status(404).json({ error: 'Recipe not found' });
    }
    
    // Allow custom sprites to override preset
    const recipe = { ...baseRecipe };
    if (sprites && Array.isArray(sprites)) {
      recipe.sprites = sprites.map((sprite: string, i: number) => ({
        sprite,
        behavior: baseRecipe.sprites[i]?.behavior || 'pulse',
        baseSize: baseRecipe.sprites[i]?.baseSize || 48
      }));
    }
    
    const request: VisualizerRequest = {
      audioFile,
      recipe,
      settings: {
        width: settings?.width || 1280,
        height: settings?.height || 720,
        fps: settings?.fps || 30,
        duration: settings?.duration
      }
    };
    
    const result = await generateMusicVisualizer(request);
    res.json(result);
  } catch (error) {
    console.error('Preset visualizer generation error:', error);
    res.status(500).json({
      error: 'Failed to generate visualizer',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});
