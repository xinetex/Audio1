import { useEffect, useState } from 'react'
import { useProjectStore } from '../store/projectStore'

interface AudioAnalyzerProps {
  onComplete: () => void
}

export function AudioAnalyzer({ onComplete }: AudioAnalyzerProps) {
  const project = useProjectStore((state) => state.project)
  const [analyzing, setAnalyzing] = useState(true)

  useEffect(() => {
    // Simulate analysis completion
    const timer = setTimeout(() => {
      setAnalyzing(false)
    }, 1500)
    return () => clearTimeout(timer)
  }, [])

  if (!project?.audioAnalysis) {
    return <div className="analyzer-container">Loading...</div>
  }

  const { audioAnalysis } = project
  const beatIntensities = audioAnalysis.beats.slice(0, 100).map(b => b.energy)
  const maxIntensity = Math.max(...beatIntensities)

  return (
    <div className="analyzer-container">
      <div className="analyzer-content">
        <h2 className="analyzer-title">Audio Analysis Complete</h2>
        
        <div className="analyzer-grid">
          {/* Beat Visualization */}
          <div className="analyzer-card">
            <h3 className="card-title">Beat Detection</h3>
            <div className="beat-viz">
              {audioAnalysis.beats.slice(0, 100).map((beat, idx) => (
                <div
                  key={idx}
                  className="beat-indicator"
                  style={{
                    height: `${(beat.energy / maxIntensity) * 100}%`,
                    opacity: beat.confidence,
                  }}
                />
              ))}
            </div>
            <div className="card-stats">
              <div className="stat-item">
                <span className="stat-number">{audioAnalysis.beats.length}</span>
                <span className="stat-text">Total Beats</span>
              </div>
              <div className="stat-item">
                <span className="stat-number">{audioAnalysis.bpm}</span>
                <span className="stat-text">BPM</span>
              </div>
            </div>
          </div>

          {/* Segments */}
          <div className="analyzer-card">
            <h3 className="card-title">Audio Segments</h3>
            <div className="segments-viz">
              {audioAnalysis.segments.slice(0, 20).map((segment, idx) => (
                <div key={idx} className="segment-bar">
                  <div 
                    className="segment-fill"
                    style={{ 
                      width: `${segment.intensity * 100}%`,
                      background: `hsl(${segment.intensity * 120}, 70%, 50%)`
                    }}
                  />
                  <span className="segment-time">
                    {segment.startTime.toFixed(1)}s
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Overall Stats */}
          <div className="analyzer-card wide">
            <h3 className="card-title">Track Information</h3>
            <div className="track-stats">
              <div className="track-stat">
                <div className="stat-icon">⏱️</div>
                <div>
                  <div className="stat-value">{audioAnalysis.duration.toFixed(2)}s</div>
                  <div className="stat-label">Duration</div>
                </div>
              </div>
              <div className="track-stat">
                <div className="stat-icon">🎵</div>
                <div>
                  <div className="stat-value">{audioAnalysis.bpm}</div>
                  <div className="stat-label">Tempo (BPM)</div>
                </div>
              </div>
              <div className="track-stat">
                <div className="stat-icon">📊</div>
                <div>
                  <div className="stat-value">{audioAnalysis.segments.length}</div>
                  <div className="stat-label">Segments</div>
                </div>
              </div>
              <div className="track-stat">
                <div className="stat-icon">💥</div>
                <div>
                  <div className="stat-value">{audioAnalysis.beats.length}</div>
                  <div className="stat-label">Beat Markers</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="analyzer-actions">
          <button 
            className="btn-primary btn-large"
            onClick={onComplete}
            disabled={analyzing}
          >
            {analyzing ? 'Analyzing...' : 'Continue to Editor →'}
          </button>
        </div>
      </div>
    </div>
  )
}
