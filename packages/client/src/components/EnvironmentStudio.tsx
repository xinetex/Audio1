import { useEffect, useRef, useState } from 'react'
import { useProjectStore } from '../store/projectStore'

export function EnvironmentStudio() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const audioFile = useProjectStore((state) => state.audioFile)

  useEffect(() => {
    if (isLoaded && audioFile && iframeRef.current) {
      // Pass audio file to iframe
      const iframe = iframeRef.current
      const iframeWindow = iframe.contentWindow
      
      if (iframeWindow) {
        // Read audio file and send to iframe
        const reader = new FileReader()
        reader.onload = (e) => {
          const arrayBuffer = e.target?.result as ArrayBuffer
          iframeWindow.postMessage({
            type: 'LOAD_AUDIO',
            data: arrayBuffer
          }, '*')
        }
        reader.readAsArrayBuffer(audioFile)
      }
    }
  }, [isLoaded, audioFile])

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      overflow: 'hidden'
    }}>
      <iframe
        ref={iframeRef}
        src="/environment-pro.html"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          position: 'absolute',
          top: 0,
          left: 0
        }}
        onLoad={() => setIsLoaded(true)}
        title="Environment Studio"
      />
      {!isLoaded && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          color: '#fff',
          fontSize: '1.2rem',
          textAlign: 'center'
        }}>
          <div style={{ marginBottom: '1rem' }}>🎬</div>
          <div>Loading Environment Studio...</div>
        </div>
      )}
    </div>
  )
}
