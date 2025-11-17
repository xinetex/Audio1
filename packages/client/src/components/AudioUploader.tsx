import { useState, useRef } from 'react'
import { useProjectStore } from '../store/projectStore'
import { api } from '../services/api'
import type { VideoProject } from '@audiovisual-art-tool/shared'

interface AudioUploaderProps {
  onComplete: () => void
}

export function AudioUploader({ onComplete }: AudioUploaderProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [progress, setProgress] = useState<string>('')
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const setProject = useProjectStore((state) => state.setProject)
  const setAudioFile = useProjectStore((state) => state.setAudioFile)
  const setAudioAnalysis = useProjectStore((state) => state.setAudioAnalysis)

  const processFile = async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      setProgress('📤 Uploading audio file...')
      const uploadResult = await api.uploadAudio(file)
      setAudioFile(file)

      setProgress('📊 Analyzing audio patterns...')
      const analysis = await api.analyzeAudio(uploadResult.filename)

      setProgress('🎨 Creating project...')
      const project: VideoProject = await api.createProject({
        name: file.name.replace(/\.[^/.]+$/, ''),
        audioFile: uploadResult.filename,
        settings: {
          resolution: { width: 1920, height: 1080 },
          fps: 30,
          autoGenerateOnBeats: true,
          defaultStyle: 'cinematic',
          defaultTransition: 'fade',
        },
      })

      setProject({ ...project, audioAnalysis: analysis })
      setAudioAnalysis(analysis)

      setProgress('✅ Ready!')
      setTimeout(onComplete, 500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process audio')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('audio/')) {
      await processFile(file)
    } else {
      setError('Please drop an audio file')
    }
  }

  return (
    <div className="uploader">
      <div className="uploader-content">
        <div className="uploader-hero">
          <div className="hero-icon">🎵</div>
          <h2>Upload Your Audio</h2>
          <p className="hero-subtitle">
            Transform any audio track into stunning AI-generated visuals
          </p>
        </div>

        <div 
          className={`upload-zone ${dragActive ? 'drag-active' : ''} ${loading ? 'disabled' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !loading && fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleFileChange}
            disabled={loading}
            style={{ display: 'none' }}
          />
          
          {!loading ? (
            <>
              <div className="upload-icon">📂</div>
              <p className="upload-text">Drop your audio file here or click to browse</p>
              <p className="upload-hint">Supports MP3, WAV, OGG, FLAC</p>
            </>
          ) : (
            <div className="upload-loading">
              <div className="spinner"></div>
              <p className="upload-progress">{progress}</p>
            </div>
          )}
        </div>

        {error && (
          <div className="upload-error">
            <span>⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <div className="uploader-features">
          <div className="feature">
            <span className="feature-icon">🎶</span>
            <div>
              <strong>Beat Detection</strong>
              <p>Automatic rhythm analysis</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">🤖</span>
            <div>
              <strong>AI Generation</strong>
              <p>Powered by Stable Diffusion</p>
            </div>
          </div>
          <div className="feature">
            <span className="feature-icon">⚡</span>
            <div>
              <strong>Real-time Preview</strong>
              <p>See your creation evolve</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
