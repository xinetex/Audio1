import Replicate from 'replicate';
import { writeFileSync } from 'fs';
import { getImagePath } from '../utils/storage.js';
import type { GenerateImageRequest, GenerateImageResponse } from '@audiovisual-art-tool/shared';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || '',
});

export async function generateImage(
  request: GenerateImageRequest
): Promise<GenerateImageResponse> {
  try {
    // Combine prompt with style
    const fullPrompt = `${request.prompt}, ${request.style} style`;
    
    // Use SDXL model for high-quality image generation
    const output = await replicate.run(
      'stability-ai/sdxl:39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b',
      {
        input: {
          prompt: fullPrompt,
          width: request.width,
          height: request.height,
          seed: request.seed,
          num_outputs: 1,
          refine: 'expert_ensemble_refiner',
          scheduler: 'K_EULER',
          num_inference_steps: 25,
        },
      }
    ) as string[];

    if (!output || output.length === 0) {
      throw new Error('No image generated');
    }

    // Download and save the image
    const imageUrl = output[0];
    const filename = `image-${Date.now()}.png`;
    const localPath = getImagePath(filename);

    // Fetch and save image
    const response = await fetch(imageUrl);
    const buffer = await response.arrayBuffer();
    writeFileSync(localPath, Buffer.from(buffer));

    return {
      imageUrl: `/outputs/images/${filename}`,
      seed: request.seed || Math.floor(Math.random() * 1000000),
    };
  } catch (error) {
    console.error('Image generation error:', error);
    throw new Error('Failed to generate image');
  }
}
