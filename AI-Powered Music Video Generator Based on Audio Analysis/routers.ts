import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { 
  createProject, 
  getUserProjects, 
  getProjectById, 
  updateProject, 
  deleteProject,
  saveMusicAnalysis,
  getMusicAnalysis,
  getProjectVideoSegments,
  getFinalVideo
} from "./db";
import { storagePut } from "./storage";
import { analyzeAudioFile, generateVideoPrompts } from "./audioAnalysisService";
import { randomBytes } from "crypto";
import path from "path";
import fs from "fs/promises";
import os from "os";
import { generateVideoAsync, checkVideoStatus } from "./videoGenerationService";
import { createVideoSegment, updateVideoSegment } from "./db";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  project: router({
    // Create a new project
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1).max(255),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await createProject({
          userId: ctx.user.id,
          title: input.title,
          status: "pending",
        });
        return project;
      }),

    // List user's projects
    list: protectedProcedure.query(async ({ ctx }) => {
      const projects = await getUserProjects(ctx.user.id);
      return projects;
    }),

    // Get project details with analysis and segments
    get: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        const analysis = await getMusicAnalysis(project.id);
        const segments = await getProjectVideoSegments(project.id);
        const finalVideo = await getFinalVideo(project.id);
        
        return {
          project,
          analysis,
          segments,
          finalVideo,
        };
      }),

    // Delete project
    delete: protectedProcedure
      .input(z.object({
        id: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.id);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        await deleteProject(input.id);
        return { success: true };
      }),

    // Upload audio file
    uploadAudio: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        fileName: z.string(),
        fileData: z.string(), // base64 encoded
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        // Decode base64 file data
        const fileBuffer = Buffer.from(input.fileData, 'base64');
        
        // Generate unique file key
        const randomSuffix = randomBytes(8).toString('hex');
        const ext = path.extname(input.fileName);
        const fileKey = `audio/${ctx.user.id}/${input.projectId}/${randomSuffix}${ext}`;
        
        // Upload to S3
        const { url } = await storagePut(fileKey, fileBuffer, 'audio/mpeg');
        
        // Update project with audio file info
        await updateProject(input.projectId, {
          audioFileKey: fileKey,
          audioFileUrl: url,
          audioFileName: input.fileName,
          status: "pending",
        });
        
        return { url, fileKey };
      }),

    // Analyze audio file
    analyzeAudio: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        if (!project.audioFileUrl) {
          throw new Error("No audio file uploaded");
        }
        
        // Update status to analyzing
        await updateProject(input.projectId, { status: "analyzing" });
        
        try {
          // Download audio file to temp location
          const response = await fetch(project.audioFileUrl);
          const audioBuffer = Buffer.from(await response.arrayBuffer());
          
          const tempDir = os.tmpdir();
          const tempFilePath = path.join(tempDir, `audio_${input.projectId}_${Date.now()}${path.extname(project.audioFileName || '.mp3')}`);
          
          await fs.writeFile(tempFilePath, audioBuffer);
          
          // Analyze audio
          const analysisResult = await analyzeAudioFile(tempFilePath);
          
          // Clean up temp file
          await fs.unlink(tempFilePath);
          
          // Save analysis to database
          await saveMusicAnalysis({
            projectId: input.projectId,
            tempo: analysisResult.tempo,
            musicalKey: analysisResult.musicalKey,
            energy: analysisResult.energy,
            mood: analysisResult.mood,
            structure: analysisResult.structure,
            beats: analysisResult.beats,
            spectralFeatures: analysisResult.spectralFeatures,
            analysisData: analysisResult.detailedFeatures || {},
          });
          
          // Update project duration and status
          await updateProject(input.projectId, {
            audioFileDuration: analysisResult.duration,
            status: "pending",
          });
          
          // Generate video prompts
          const prompts = generateVideoPrompts(analysisResult);
          
          return {
            analysis: analysisResult,
            prompts,
          };
        } catch (error) {
          await updateProject(input.projectId, {
            status: "failed",
            errorMessage: error instanceof Error ? error.message : "Analysis failed",
          });
          throw error;
        }
      }),
  }),

  video: router({
    // Generate video segments for a project
    generateSegments: protectedProcedure
      .input(z.object({
        projectId: z.number(),
        prompts: z.array(z.object({
          segmentIndex: z.number(),
          startTime: z.number(),
          endTime: z.number(),
          prompt: z.string(),
        })),
      }))
      .mutation(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        // Update project status
        await updateProject(input.projectId, { status: "generating" });
        
        // Create video segment records and start generation
        const segments = [];
        
        for (const promptData of input.prompts) {
          // Create segment record
          const segment = await createVideoSegment({
            projectId: input.projectId,
            segmentIndex: promptData.segmentIndex,
            prompt: promptData.prompt,
            startTime: promptData.startTime,
            endTime: promptData.endTime,
            status: "pending",
          });
          
          // Start video generation asynchronously
          try {
            const duration = promptData.endTime - promptData.startTime;
            const result = await generateVideoAsync({
              prompt: promptData.prompt,
              duration: Math.min(duration, 6), // Cap at 6 seconds per segment
            });
            
            // Update segment with Replicate ID
            await updateVideoSegment(segment.id, {
              replicateId: result.id,
              status: "processing",
            });
            
            segments.push({ ...segment, replicateId: result.id });
          } catch (error) {
            await updateVideoSegment(segment.id, {
              status: "failed",
              errorMessage: error instanceof Error ? error.message : "Generation failed",
            });
          }
        }
        
        return { segments };
      }),

    // Check generation progress
    checkProgress: protectedProcedure
      .input(z.object({
        projectId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        const project = await getProjectById(input.projectId);
        
        if (!project) {
          throw new Error("Project not found");
        }
        
        if (project.userId !== ctx.user.id) {
          throw new Error("Unauthorized");
        }
        
        const segments = await getProjectVideoSegments(input.projectId);
        
        // Check status of each segment
        const segmentsWithStatus = await Promise.all(
          segments.map(async (segment) => {
            if (segment.replicateId && segment.status === "processing") {
              try {
                const status = await checkVideoStatus(segment.replicateId);
                
                if (status.status === "succeeded" && status.output) {
                  // Update segment with video URL
                  const videoUrl = Array.isArray(status.output) ? status.output[0] : status.output;
                  await updateVideoSegment(segment.id, {
                    videoFileUrl: videoUrl,
                    status: "completed",
                    completedAt: new Date(),
                  });
                  
                  return { ...segment, status: "completed", videoFileUrl: status.output };
                } else if (status.status === "failed") {
                  await updateVideoSegment(segment.id, {
                    status: "failed",
                    errorMessage: status.error || "Generation failed",
                  });
                  
                  return { ...segment, status: "failed", errorMessage: status.error };
                }
              } catch (error) {
                console.error("Error checking segment status:", error);
              }
            }
            
            return segment;
          })
        );
        
        // Calculate overall progress
        const total = segments.length;
        const completed = segmentsWithStatus.filter(s => s.status === "completed").length;
        const failed = segmentsWithStatus.filter(s => s.status === "failed").length;
        const processing = segmentsWithStatus.filter(s => s.status === "processing").length;
        
        // Update project status if all segments are done
        if (completed + failed === total) {
          await updateProject(input.projectId, {
            status: failed > 0 ? "failed" : "completed",
          });
        }
        
        return {
          total,
          completed,
          failed,
          processing,
          segments: segmentsWithStatus,
        };
      }),
  }),
});

export type AppRouter = typeof appRouter;
