import { useState } from 'react'
import { AudioUploader } from './components/AudioUploader'
import { Timeline } from './components/Timeline'
import { Controls } from './components/Controls'
import { Preview } from './components/Preview'
import { AudioAnalyzer } from './components/AudioAnalyzer'
import { EnvironmentStudio } from './components/EnvironmentStudio'
import { useProjectStore } from './store/projectStore'
import './App.css'

type ViewType = 'upload' | 'analyze' | 'edit' | 'generate' | 'environment'

function App() {
  const [view, setView] = useState<ViewType>('upload')
  const project = useProjectStore((state) => state.project)

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🎵</span>
            <h1>Audiovisual Art Studio</h1>
          </div>
          <p className="tagline">Transform sound into mesmerizing AI-generated visuals</p>
        </div>
        
        {project && view !== 'upload' && (
          <div className="header-nav">
            <button 
              className={view === 'analyze' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setView('analyze')}
            >
              📊 Analyze
            </button>
            <button 
              className={view === 'edit' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setView('edit')}
            >
              ✏️ Edit
            </button>
            <button 
              className={view === 'generate' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setView('generate')}
            >
              🎬 Generate
            </button>
            <button 
              className={view === 'environment' ? 'nav-btn active' : 'nav-btn'}
              onClick={() => setView('environment')}
            >
              🌌 Environment Studio
            </button>
          </div>
        )}
      </header>

      <main className="app-main">
        {view === 'upload' && (
          <AudioUploader onComplete={() => setView('analyze')} />
        )}
        
        {view === 'analyze' && (
          <AudioAnalyzer onComplete={() => setView('edit')} />
        )}
        
        {view === 'edit' && (
          <div className="editor">
            <div className="editor-sidebar">
              <Controls />
            </div>
            <div className="editor-main">
              <div className="editor-viewport">
                <div className="viewport-placeholder">
                  <div className="viewport-grid"></div>
                  <div className="viewport-content">
                    <div className="frequency-viz">
                      {Array.from({ length: 64 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="freq-bar"
                          style={{ 
                            height: `${Math.random() * 100}%`,
                            animationDelay: `${i * 0.02}s`
                          }}
                        ></div>
                      ))}
                    </div>
                    <p className="viewport-text">Audio-Reactive Visualization</p>
                  </div>
                </div>
              </div>
              <Timeline />
              {project && (
                <div className="project-stats">
                  <div className="stat">
                    <span className="stat-label">Duration</span>
                    <span className="stat-value">{project.audioAnalysis?.duration.toFixed(2)}s</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">BPM</span>
                    <span className="stat-value">{project.audioAnalysis?.bpm}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Beats</span>
                    <span className="stat-value">{project.audioAnalysis?.beats.length}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Keyframes</span>
                    <span className="stat-value">{project.keyFrames.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
        
        {view === 'generate' && (
          <Preview onBack={() => setView('edit')} />
        )}
        
        {view === 'environment' && (
          <EnvironmentStudio />
        )}
      </main>
    </div>
  )
}

export default App
