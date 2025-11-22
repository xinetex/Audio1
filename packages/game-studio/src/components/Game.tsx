import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../engine/GameEngine';
import { LEVEL_DEMO, LEVEL_1 } from '../engine/levels';
import type { GameState } from '../engine/types';

export function Game() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    score: 0,
    lives: 3,
    level: 1,
    status: 'idle',
    pillsRemaining: 0,
    powerUpActive: false,
    powerUpTimer: 0,
  });
  const [selectedLevel, setSelectedLevel] = useState<'demo' | 'classic'>('demo');

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize game engine
    const engine = new GameEngine(canvasRef.current, {
      width: 608,
      height: 704,
      tileSize: 32,
      fps: 60,
    });

    engineRef.current = engine;

    // Set up callbacks
    engine.onScore((score) => {
      setGameState((prev) => ({ ...prev, score }));
    });

    engine.onGameOverCallback(() => {
      setGameState((prev) => ({ ...prev, status: 'game-over' }));
    });

    engine.onVictoryCallback(() => {
      setGameState((prev) => ({ ...prev, status: 'victory' }));
    });

    // Load initial level
    engine.loadLevel(selectedLevel === 'demo' ? LEVEL_DEMO : LEVEL_1);

    // Keyboard controls
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd'].includes(e.key)) {
        e.preventDefault();
        engine.handleInput(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      engine.destroy();
    };
  }, [selectedLevel]);

  const handleStart = () => {
    if (engineRef.current) {
      engineRef.current.start();
      setGameState((prev) => ({ ...prev, status: 'playing' }));
    }
  };

  const handlePause = () => {
    if (engineRef.current) {
      engineRef.current.pause();
      setGameState((prev) => ({ ...prev, status: 'paused' }));
    }
  };

  const handleResume = () => {
    if (engineRef.current) {
      engineRef.current.resume();
      setGameState((prev) => ({ ...prev, status: 'playing' }));
    }
  };

  const handleRestart = () => {
    if (engineRef.current) {
      engineRef.current.loadLevel(selectedLevel === 'demo' ? LEVEL_DEMO : LEVEL_1);
      setGameState({
        score: 0,
        lives: 3,
        level: 1,
        status: 'idle',
        pillsRemaining: 0,
        powerUpActive: false,
        powerUpTimer: 0,
      });
    }
  };

  return (
    <div className="game-container">
      <div className="game-header">
        <div className="game-stats">
          <div className="stat">
            <span className="stat-label">Score</span>
            <span className="stat-value">{gameState.score}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Lives</span>
            <span className="stat-value">{'❤️ '.repeat(gameState.lives)}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Level</span>
            <span className="stat-value">{gameState.level}</span>
          </div>
        </div>
        
        <div className="game-controls">
          <select 
            value={selectedLevel} 
            onChange={(e) => setSelectedLevel(e.target.value as any)}
            disabled={gameState.status === 'playing'}
          >
            <option value="demo">Demo Level</option>
            <option value="classic">Classic Maze</option>
          </select>
          
          {gameState.status === 'idle' && (
            <button onClick={handleStart} className="btn-primary">
              Start Game
            </button>
          )}
          
          {gameState.status === 'playing' && (
            <button onClick={handlePause} className="btn-secondary">
              Pause
            </button>
          )}
          
          {gameState.status === 'paused' && (
            <button onClick={handleResume} className="btn-primary">
              Resume
            </button>
          )}
          
          <button onClick={handleRestart} className="btn-secondary">
            Restart
          </button>
        </div>
      </div>

      <div className="game-canvas-wrapper">
        <canvas ref={canvasRef} />
        
        {gameState.status === 'game-over' && (
          <div className="game-overlay">
            <h2>Game Over!</h2>
            <p>Final Score: {gameState.score}</p>
            <button onClick={handleRestart} className="btn-primary">
              Try Again
            </button>
          </div>
        )}
        
        {gameState.status === 'victory' && (
          <div className="game-overlay victory">
            <h2>Victory! 🎉</h2>
            <p>Score: {gameState.score}</p>
            <button onClick={handleRestart} className="btn-primary">
              Play Again
            </button>
          </div>
        )}
        
        {gameState.status === 'idle' && (
          <div className="game-overlay instructions">
            <h3>Controls</h3>
            <p>Arrow Keys or WASD to move</p>
            <p>Collect all pills to win!</p>
            <p>Avoid ghosts (or eat them with power-ups)</p>
          </div>
        )}
      </div>

      <div className="game-info">
        <p>🎮 <strong>ThunderVerse</strong> - AI-Powered Gaming Platform</p>
        <p>Use arrow keys or WASD to navigate</p>
      </div>
    </div>
  );
}
