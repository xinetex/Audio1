import Replicate from "replicate";

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN || "",
});

export interface VideoGenerationOptions {
  prompt: string;
  duration?: number; // seconds
  aspectRatio?: string;
  fps?: number;
}

export interface VideoGenerationResult {
  id: string;
  status: "starting" | "processing" | "succeeded" | "failed" | "canceled";
  output?: string | string[]; // URL(s) to generated video
  error?: string;
}

/**
 * Generate video using Replicate API (LTX-Video model)
 * @param options - Video generation options
 * @returns Promise with generation result
 */
export async function generateVideo(options: VideoGenerationOptions): Promise<VideoGenerationResult> {
  try {
    const { prompt, duration = 5, aspectRatio = "16:9", fps = 24 } = options;
    
    // Use LTX-Video model (fast, real-time generation)
    const output = await replicate.run(
      "lightricks/ltx-video" as any,
      {
        input: {
          prompt,
          num_frames: duration * fps,
          width: aspectRatio === "16:9" ? 768 : 512,
          height: aspectRatio === "16:9" ? 432 : 512,
          num_inference_steps: 30,
        }
      }
    );
    
    // Extract video URL from output
    let videoUrl: string;
    if (Array.isArray(output)) {
      videoUrl = output[0] as string;
    } else if (typeof output === 'string') {
      videoUrl = output;
    } else {
      throw new Error("Unexpected output format from Replicate");
    }
    
    return {
      id: "completed",
      status: "succeeded",
      output: videoUrl,
    };
  } catch (error) {
    console.error("[Video Generation] Error:", error);
    return {
      id: "failed",
      status: "failed",
      error: error instanceof Error ? error.message : "Video generation failed",
    };
  }
}

/**
 * Generate video asynchronously and return prediction ID
 * @param options - Video generation options
 * @returns Promise with prediction ID for status tracking
 */
export async function generateVideoAsync(options: VideoGenerationOptions): Promise<{
  id: string;
  status: string;
}> {
  try {
    const { prompt, duration = 5, aspectRatio = "16:9", fps = 24 } = options;
    
    const prediction = await replicate.predictions.create({
      model: "lightricks/ltx-video",
      version: "latest" as any,
      input: {
        prompt,
        num_frames: duration * fps,
        width: aspectRatio === "16:9" ? 768 : 512,
        height: aspectRatio === "16:9" ? 432 : 512,
        num_inference_steps: 30,
      },
    });
    
    return {
      id: prediction.id,
      status: prediction.status,
    };
  } catch (error) {
    console.error("[Video Generation] Error starting async generation:", error);
    throw error;
  }
}

/**
 * Check status of video generation
 * @param predictionId - Replicate prediction ID
 * @returns Promise with current status
 */
export async function checkVideoStatus(predictionId: string): Promise<VideoGenerationResult> {
  try {
    const prediction = await replicate.predictions.get(predictionId);
    
    let output: string | undefined;
    if (prediction.output) {
      if (Array.isArray(prediction.output)) {
        output = prediction.output[0] as string;
      } else if (typeof prediction.output === 'string') {
        output = prediction.output;
      }
    }
    
    return {
      id: prediction.id,
      status: prediction.status as any,
      output,
      error: prediction.error ? String(prediction.error) : undefined,
    };
  } catch (error) {
    console.error("[Video Generation] Error checking status:", error);
    throw error;
  }
}

/**
 * Assemble multiple video segments into a single video
 * This is a placeholder - actual implementation would use ffmpeg
 * @param segmentUrls - Array of video segment URLs
 * @param audioUrl - URL to audio file
 * @returns Promise with final video URL
 */
export async function assembleVideo(
  segmentUrls: string[],
  audioUrl: string
): Promise<string> {
  // TODO: Implement actual video assembly using ffmpeg
  // For now, return the first segment as a placeholder
  console.log("[Video Assembly] Would assemble:", segmentUrls.length, "segments with audio:", audioUrl);
  
  if (segmentUrls.length === 0) {
    throw new Error("No video segments to assemble");
  }
  
  // In a real implementation, this would:
  // 1. Download all video segments
  // 2. Download audio file
  // 3. Concatenate video segments using ffmpeg
  // 4. Add audio track to final video
  // 5. Upload final video to S3
  // 6. Return S3 URL
  
  return segmentUrls[0];
}
