import { useEffect, useRef, useState } from 'react'
import WaveSurfer from 'wavesurfer.js'
import { useProjectStore } from '../store/projectStore'
import type { KeyFrame } from '@audiovisual-art-tool/shared'

export function Timeline() {
  const waveformRef = useRef<HTMLDivElement>(null)
  const wavesurfer = useRef<WaveSurfer | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  const project = useProjectStore((state) => state.project)
  const audioFile = useProjectStore((state) => state.audioFile)
  const setCurrentTime = useProjectStore((state) => state.setCurrentTime)
  const addKeyFrame = useProjectStore((state) => state.addKeyFrame)

  useEffect(() => {
    if (!waveformRef.current || !audioFile) return

    wavesurfer.current = WaveSurfer.create({
      container: waveformRef.current,
      waveColor: '#4a9eff',
      progressColor: '#1e88e5',
      cursorColor: '#ff6b6b',
      height: 128,
      normalize: true,
      backend: 'WebAudio',
    })

    const url = URL.createObjectURL(audioFile)
    wavesurfer.current.load(url)

    wavesurfer.current.on('audioprocess', (time) => {
      setCurrentTime(time)
    })

    wavesurfer.current.on('seek', (position) => {
      const time = wavesurfer.current!.getDuration() * position
      setCurrentTime(time)
    })

    return () => {
      wavesurfer.current?.destroy()
      URL.revokeObjectURL(url)
    }
  }, [audioFile, setCurrentTime])

  const handlePlayPause = () => {
    if (wavesurfer.current) {
      wavesurfer.current.playPause()
      setIsPlaying(!isPlaying)
    }
  }

  const handleAddKeyFrame = () => {
    const currentTime = wavesurfer.current?.getCurrentTime() || 0
    const newKeyFrame: KeyFrame = {
      id: `kf-${Date.now()}`,
      time: currentTime,
      prompt: 'Abstract visualization',
      style: 'cinematic',
      intensity: 0.5,
      transition: 'fade',
      transitionDuration: 1,
    }
    addKeyFrame(newKeyFrame)
  }

  return (
    <div className="timeline">
      <div className="timeline-controls">
        <button onClick={handlePlayPause} className="btn-primary">
          {isPlaying ? '⏸ Pause' : '▶ Play'}
        </button>
        <button onClick={handleAddKeyFrame} className="btn-secondary">
          ➕ Add Keyframe
        </button>
      </div>

      <div className="timeline-content">
        <div ref={waveformRef} className="waveform" />
        
        {project?.audioAnalysis?.beats && (
          <div className="beat-markers">
            {project.audioAnalysis.beats.slice(0, 50).map((beat, idx) => (
              <div
                key={idx}
                className="beat-marker"
                style={{
                  left: `${(beat.time / (project.audioAnalysis?.duration || 1)) * 100}%`,
                }}
              />
            ))}
          </div>
        )}

        {project?.keyFrames && (
          <div className="keyframe-markers">
            {project.keyFrames.map((kf) => (
              <div
                key={kf.id}
                className="keyframe-marker"
                style={{
                  left: `${(kf.time / (project.audioAnalysis?.duration || 1)) * 100}%`,
                }}
                title={kf.prompt}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
