import ffmpeg from 'fluent-ffmpeg';
import { existsSync } from 'fs';
import { getUploadPath, getVideoPath, getImagePath } from '../utils/storage.js';
export async function composeVideo(request) {
    const { audioFile, keyFrames, settings } = request;
    const audioPath = getUploadPath(audioFile);
    if (!existsSync(audioPath)) {
        throw new Error('Audio file not found');
    }
    // Sort keyframes by time
    const sortedFrames = [...keyFrames].sort((a, b) => a.time - b.time);
    // Create video from keyframes
    const outputFilename = `video-${Date.now()}.mp4`;
    const outputPath = getVideoPath(outputFilename);
    await createVideoFromFrames(sortedFrames, audioPath, outputPath, settings);
    const duration = await getVideoDuration(outputPath);
    return {
        videoUrl: `/outputs/videos/${outputFilename}`,
        duration,
    };
}
async function createVideoFromFrames(keyFrames, audioPath, outputPath, settings) {
    return new Promise((resolve, reject) => {
        // Create a complex filter for transitions between images
        const filterComplex = buildFilterComplex(keyFrames, settings);
        const command = ffmpeg();
        // Add all keyframe images as inputs
        keyFrames.forEach((frame) => {
            const imagePath = getImagePath(frame.id + '.png');
            if (existsSync(imagePath)) {
                command.input(imagePath);
            }
        });
        // Add audio as last input
        command.input(audioPath);
        command
            .complexFilter(filterComplex)
            .outputOptions([
            `-r ${settings.fps}`,
            '-pix_fmt yuv420p',
            '-c:v libx264',
            '-preset medium',
            '-crf 23',
            '-c:a aac',
            '-b:a 192k',
            '-shortest',
        ])
            .output(outputPath)
            .on('end', () => resolve())
            .on('error', (err) => reject(err))
            .run();
    });
}
function buildFilterComplex(keyFrames, settings) {
    const filters = [];
    const { width, height } = settings.resolution;
    // Scale all images to target resolution
    keyFrames.forEach((_, index) => {
        filters.push(`[${index}:v]scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
            `pad=${width}:${height}:-1:-1:color=black[v${index}]`);
    });
    // Create transitions between frames
    let currentStream = 'v0';
    for (let i = 1; i < keyFrames.length; i++) {
        const prevFrame = keyFrames[i - 1];
        const currentFrame = keyFrames[i];
        const duration = currentFrame.time - prevFrame.time;
        const transitionDur = Math.min(currentFrame.transitionDuration, duration / 2);
        const outputLabel = i === keyFrames.length - 1 ? 'out' : `t${i}`;
        // Apply transition based on type
        const transitionFilter = getTransitionFilter(currentStream, `v${i}`, outputLabel, currentFrame.transition, transitionDur, prevFrame.time);
        filters.push(transitionFilter);
        currentStream = outputLabel;
    }
    return filters;
}
function getTransitionFilter(input1, input2, output, transitionType, duration, offset) {
    switch (transitionType) {
        case 'fade':
        case 'dissolve':
            return `[${input1}][${input2}]xfade=transition=fade:duration=${duration}:offset=${offset}[${output}]`;
        case 'slide':
            return `[${input1}][${input2}]xfade=transition=slideleft:duration=${duration}:offset=${offset}[${output}]`;
        case 'zoom':
            return `[${input1}][${input2}]xfade=transition=zoomin:duration=${duration}:offset=${offset}[${output}]`;
        default:
            return `[${input1}][${input2}]xfade=transition=fade:duration=${duration}:offset=${offset}[${output}]`;
    }
}
function getVideoDuration(videoPath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(videoPath, (err, metadata) => {
            if (err) {
                reject(err);
            }
            else {
                resolve(metadata.format.duration || 0);
            }
        });
    });
}
//# sourceMappingURL=videoComposition.js.map