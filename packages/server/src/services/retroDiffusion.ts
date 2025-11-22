import fetch from 'node-fetch';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface RetroDiffusionRequest {
  prompt: string;
  style?: string;
  model?: string;
  width?: number;
  height?: number;
  negative_prompt?: string;
  steps?: number;
  cfg_scale?: number;
}

interface RetroDiffusionResponse {
  imageUrl: string;
  model: string;
  prompt: string;
}

const RETRO_DIFFUSION_API = 'https://api.retrodiffusion.ai/v1';

// Model selection based on desired output size
const MODEL_MAPPING = {
  '16x16': 'RetroDiffusion16xModel',
  '32x32': 'RetroDiffusion32xModel',
  '64x64': 'RetroDiffusion64xModel',
  '128x128': 'RetroDiffusion128xModel',
  '256x256': 'RetroDiffusion32xModel',
  '512x512': 'RetroDiffusion64xModel',
  '1024x1024': 'RetroDiffusion128xModel'
};

// Style-specific prompt enhancements
const STYLE_PROMPTS = {
  '8bit': 'NES style, 8-bit game sprite, retro gaming',
  '16bit': 'SNES style, 16-bit game sprite, detailed pixel art',
  'gameboy': 'Game Boy style, 4 color palette, classic handheld',
  'minecraft': 'Minecraft style, blocky, voxel art',
  'arcade': 'arcade game style, classic arcade sprite',
  'pixel': 'pixel art style, game asset'
};

// Recommended negative prompts for pixel art
const NEGATIVE_PROMPT = 'muted, dull, hazy, muddy colors, blurry, mutated, deformed, noise, stock image, borders, frame, watermark, text, signature, username, cropped, out of frame, smooth, anti-aliased';

/**
 * Generate pixel art using Retro Diffusion API
 */
export async function generateRetroDiffusion(
  request: RetroDiffusionRequest
): Promise<RetroDiffusionResponse> {
  const apiKey = process.env.RETRO_DIFFUSION_API_KEY;
  
  if (!apiKey) {
    throw new Error('RETRO_DIFFUSION_API_KEY not configured');
  }

  // Enhance prompt with pixel art keywords
  const enhancedPrompt = enhancePrompt(request.prompt, request.style);
  
  // Select appropriate model based on size
  const size = `${request.width || 256}x${request.height || 256}`;
  const model = request.model || MODEL_MAPPING[size] || 'RetroDiffusion32xModel';
  
  console.log(`🎨 Generating pixel art with Retro Diffusion...`);
  console.log(`   Model: ${model}`);
  console.log(`   Size: ${size}`);
  console.log(`   Prompt: ${enhancedPrompt}`);

  try {
    // Make API request to Retro Diffusion
    const response = await fetch(`${RETRO_DIFFUSION_API}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: enhancedPrompt,
        negative_prompt: request.negative_prompt || NEGATIVE_PROMPT,
        model: model,
        width: request.width || 256,
        height: request.height || 256,
        steps: request.steps || 20,
        cfg_scale: request.cfg_scale || 7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Retro Diffusion API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json() as any;
    
    // Download and save the image locally
    const imageUrl = await downloadAndSaveImage(data.image_url || data.output?.[0]);
    
    console.log(`✅ Pixel art generated successfully: ${imageUrl}`);

    return {
      imageUrl,
      model: 'retro-diffusion',
      prompt: enhancedPrompt
    };
  } catch (error) {
    console.error('Retro Diffusion generation failed:', error);
    throw error;
  }
}

/**
 * Enhance prompt with pixel art specific keywords
 */
function enhancePrompt(basePrompt: string, style?: string): string {
  let enhanced = basePrompt;
  
  // Add style-specific keywords
  if (style && STYLE_PROMPTS[style]) {
    enhanced = `${basePrompt}, ${STYLE_PROMPTS[style]}`;
  }
  
  // Always include "pixel art" multiple times for best results
  if (!enhanced.toLowerCase().includes('pixel art')) {
    enhanced = `detailed pixel art of ${enhanced}, pixel art style, pixel art`;
  } else {
    enhanced = `${enhanced}, pixel art`;
  }
  
  return enhanced;
}

/**
 * Download image from URL and save locally
 */
async function downloadAndSaveImage(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  
  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.status}`);
  }

  const buffer = await response.buffer();
  
  // Generate unique filename
  const timestamp = Date.now();
  const filename = `retro-diffusion-${timestamp}.png`;
  const outputDir = path.join(__dirname, '../../../../outputs/images');
  
  // Ensure output directory exists
  await fs.mkdir(outputDir, { recursive: true });
  
  const filePath = path.join(outputDir, filename);
  await fs.writeFile(filePath, buffer);
  
  // Return URL path that can be served by Express
  return `/outputs/images/${filename}`;
}

/**
 * Test Retro Diffusion API connection
 */
export async function testRetroDiffusionAPI(): Promise<boolean> {
  const apiKey = process.env.RETRO_DIFFUSION_API_KEY;
  
  if (!apiKey) {
    console.error('❌ RETRO_DIFFUSION_API_KEY not configured');
    return false;
  }

  try {
    console.log('🧪 Testing Retro Diffusion API connection...');
    
    const response = await generateRetroDiffusion({
      prompt: 'test sprite',
      style: '8bit',
      width: 32,
      height: 32
    });
    
    console.log('✅ Retro Diffusion API test successful!');
    console.log(`   Generated image: ${response.imageUrl}`);
    return true;
  } catch (error) {
    console.error('❌ Retro Diffusion API test failed:', error);
    return false;
  }
}
