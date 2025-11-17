import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'
import { api } from '../services/api'

interface PreviewProps {
  onBack: () => void
}

export function Preview({ onBack }: PreviewProps) {
  const [generating, setGenerating] = useState(false)
  const [progress, setProgress] = useState<string>('')
  const [progressPercent, setProgressPercent] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const project = useProjectStore((state) => state.project)

  const handleGenerateVideo = async () => {
    if (!project) return

    setGenerating(true)
    setProgress('Initializing generation...')
    setProgressPercent(0)

    try {
      // Generate images for each keyframe
      for (let i = 0; i < project.keyFrames.length; i++) {
        const kf = project.keyFrames[i]
        setProgress(`🎨 Generating image ${i + 1}/${project.keyFrames.length}...`)
        setProgressPercent((i / (project.keyFrames.length + 1)) * 100)
        
        await api.generateImage({
          prompt: kf.prompt,
          style: kf.style,
          width: project.settings.resolution.width,
          height: project.settings.resolution.height,
        })
      }

      setProgress('🎬 Composing video with audio...')
      setProgressPercent(90)
      
      const result = await api.composeVideo({
        projectId: project.id,
        audioFile: project.audioFile,
        keyFrames: project.keyFrames,
        settings: project.settings,
      })

      setVideoUrl(result.videoUrl)
      setProgress('✅ Video complete!')
      setProgressPercent(100)
    } catch (error) {
      console.error('Generation error:', error)
      setProgress('❌ Error: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setGenerating(false)
    }
  }

  const handleExportDeforum = () => {
    if (!project) return
    
    // Create Deforum script
    const deforumScript = {
      W: project.settings.resolution.width,
      H: project.settings.resolution.height,
      fps: project.settings.fps,
      prompts: project.keyFrames.reduce((acc, kf) => {
        acc[Math.floor(kf.time * project.settings.fps)] = `${kf.prompt}, ${kf.style} style`
        return acc
      }, {} as Record<number, string>),
      animation_mode: "2D",
      max_frames: Math.ceil((project.audioAnalysis?.duration || 0) * project.settings.fps),
      zoom: "0:(1.0)",
      angle: "0:(0)",
      translation_x: "0:(0)",
      translation_y: "0:(0)"
    }

    const blob = new Blob([JSON.stringify(deforumScript, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${project.name}_deforum.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="generate-view">
      <div className="generate-header">
        <button className="btn-back" onClick={onBack}>
          ← Back to Editor
        </button>
        <h2>Generate & Export</h2>
      </div>

      <div className="generate-content">
        {!videoUrl ? (
          <div className="generate-card">
            <div className="generate-preview">
              <div className="preview-icon">🎬</div>
              <h3>Ready to Generate</h3>
              <p>{project?.keyFrames.length || 0} keyframes configured</p>
            </div>

            {generating && (
              <div className="progress-container">
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="progress-text">{progress}</p>
              </div>
            )}

            <div className="generate-actions">
              <button
                onClick={handleGenerateVideo}
                disabled={generating || !project?.keyFrames.length}
                className="btn-primary btn-large"
              >
                {generating ? 'Generating...' : '🎨 Generate Video'}
              </button>
              
              <button
                onClick={handleExportDeforum}
                disabled={!project?.keyFrames.length}
                className="btn-secondary btn-large"
              >
                📄 Export Deforum Script
              </button>
            </div>

            <div className="generation-info">
              <div className="info-item">
                <span className="info-label">Resolution</span>
                <span className="info-value">
                  {project?.settings.resolution.width}x{project?.settings.resolution.height}
                </span>
              </div>
              <div className="info-item">
                <span className="info-label">Frame Rate</span>
                <span className="info-value">{project?.settings.fps} fps</span>
              </div>
              <div className="info-item">
                <span className="info-label">Est. Time</span>
                <span className="info-value">
                  ~{((project?.keyFrames.length || 0) * 15 / 60).toFixed(1)} min
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="video-result">
            <div className="video-container">
              <video src={videoUrl} controls autoPlay loop />
            </div>
            
            <div className="result-actions">
              <a href={videoUrl} download className="btn-primary btn-large">
                💾 Download Video
              </a>
              <button 
                className="btn-secondary btn-large"
                onClick={() => {
                  setVideoUrl(null)
                  setProgress('')
                  setProgressPercent(0)
                }}
              >
                🔄 Generate Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
