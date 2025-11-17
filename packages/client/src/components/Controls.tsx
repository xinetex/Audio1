import { useState } from 'react'
import { useProjectStore } from '../store/projectStore'

export function Controls() {
  const project = useProjectStore((state) => state.project)
  const selectedKeyFrame = useProjectStore((state) => state.selectedKeyFrame)
  const updateKeyFrame = useProjectStore((state) => state.updateKeyFrame)
  const deleteKeyFrame = useProjectStore((state) => state.deleteKeyFrame)
  const [activeTab, setActiveTab] = useState<'prompt' | 'animation' | 'advanced'>('prompt')

  if (!selectedKeyFrame) {
    return (
      <div className="controls">
        <div className="controls-header">
          <h3>Keyframe Editor</h3>
        </div>
        <div className="controls-empty">
          <div className="empty-icon">✏️</div>
          <p>Select or add a keyframe to begin editing</p>
          <small>Click on the timeline or use the + button</small>
        </div>
      </div>
    )
  }

  return (
    <div className="controls">
      <div className="controls-header">
        <h3>Keyframe Editor</h3>
        <button 
          className="btn-delete"
          onClick={() => deleteKeyFrame(selectedKeyFrame.id)}
          title="Delete keyframe"
        >
          🗑️
        </button>
      </div>

      <div className="controls-tabs">
        <button 
          className={activeTab === 'prompt' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('prompt')}
        >
          Prompt
        </button>
        <button 
          className={activeTab === 'animation' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('animation')}
        >
          Animation
        </button>
        <button 
          className={activeTab === 'advanced' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('advanced')}
        >
          Advanced
        </button>
      </div>

      <div className="controls-content">
        {activeTab === 'prompt' && (
          <>
            <div className="control-group">
              <label className="control-label">
                <span>Prompt</span>
                <span className="label-hint">Describe your vision</span>
              </label>
              <textarea
                className="control-textarea"
                value={selectedKeyFrame.prompt}
                onChange={(e) =>
                  updateKeyFrame(selectedKeyFrame.id, { prompt: e.target.value })
                }
                placeholder="Enter your prompt here..."
                rows={3}
              />
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Art Style</span>
              </label>
              <select
                className="control-select"
                value={selectedKeyFrame.style}
                onChange={(e) =>
                  updateKeyFrame(selectedKeyFrame.id, { style: e.target.value })
                }
              >
                <option value="cinematic">🎬 Cinematic</option>
                <option value="abstract">🎨 Abstract</option>
                <option value="anime">🎴 Anime</option>
                <option value="photographic">📷 Photographic</option>
                <option value="digital-art">💻 Digital Art</option>
                <option value="psychedelic">🌀 Psychedelic</option>
                <option value="minimalist">⚪ Minimalist</option>
                <option value="surreal">🌙 Surreal</option>
              </select>
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Intensity</span>
                <span className="label-value">{selectedKeyFrame.intensity.toFixed(2)}</span>
              </label>
              <input
                className="control-range"
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={selectedKeyFrame.intensity}
                onChange={(e) =>
                  updateKeyFrame(selectedKeyFrame.id, {
                    intensity: parseFloat(e.target.value),
                  })
                }
              />
              <div className="range-labels">
                <span>Subtle</span>
                <span>Intense</span>
              </div>
            </div>
          </>
        )}

        {activeTab === 'animation' && (
          <>
            <div className="control-group">
              <label className="control-label">
                <span>Transition Type</span>
              </label>
              <div className="button-group">
                {(['fade', 'dissolve', 'cut', 'zoom', 'slide'] as const).map(type => (
                  <button
                    key={type}
                    className={selectedKeyFrame.transition === type ? 'toggle-btn active' : 'toggle-btn'}
                    onClick={() => updateKeyFrame(selectedKeyFrame.id, { transition: type })}
                  >
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Transition Duration</span>
                <span className="label-value">{selectedKeyFrame.transitionDuration.toFixed(1)}s</span>
              </label>
              <input
                className="control-range"
                type="range"
                min="0.1"
                max="3"
                step="0.1"
                value={selectedKeyFrame.transitionDuration}
                onChange={(e) =>
                  updateKeyFrame(selectedKeyFrame.id, {
                    transitionDuration: parseFloat(e.target.value),
                  })
                }
              />
              <div className="range-labels">
                <span>Quick</span>
                <span>Slow</span>
              </div>
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Camera Motion</span>
                <span className="label-hint">Deforum-style</span>
              </label>
              <div className="motion-controls">
                <div className="motion-row">
                  <label>Zoom</label>
                  <input type="range" min="-5" max="5" step="0.1" defaultValue="0" />
                </div>
                <div className="motion-row">
                  <label>Pan X</label>
                  <input type="range" min="-10" max="10" step="0.1" defaultValue="0" />
                </div>
                <div className="motion-row">
                  <label>Pan Y</label>
                  <input type="range" min="-10" max="10" step="0.1" defaultValue="0" />
                </div>
                <div className="motion-row">
                  <label>Rotate</label>
                  <input type="range" min="-180" max="180" step="1" defaultValue="0" />
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'advanced' && (
          <>
            <div className="control-group">
              <label className="control-label">
                <span>Keyframe Time</span>
                <span className="label-value">{selectedKeyFrame.time.toFixed(2)}s</span>
              </label>
              <input
                className="control-input"
                type="number"
                min="0"
                step="0.1"
                value={selectedKeyFrame.time.toFixed(2)}
                onChange={(e) =>
                  updateKeyFrame(selectedKeyFrame.id, {
                    time: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Seed</span>
                <span className="label-hint">For reproducibility</span>
              </label>
              <input
                className="control-input"
                type="number"
                placeholder="Random"
              />
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>CFG Scale</span>
                <span className="label-hint">Prompt adherence</span>
              </label>
              <input
                className="control-range"
                type="range"
                min="1"
                max="20"
                step="0.5"
                defaultValue="7"
              />
            </div>

            <div className="control-group">
              <label className="control-label">
                <span>Steps</span>
                <span className="label-hint">Generation quality</span>
              </label>
              <input
                className="control-range"
                type="range"
                min="10"
                max="50"
                step="5"
                defaultValue="25"
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
