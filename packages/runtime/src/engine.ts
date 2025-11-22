/**
 * ThunderEngine Core
 * Main game engine with update/render loop
 */

import { GameConfig, GameData, GameState, Entity } from './types.js';
import { PhysicsEngine } from './physics.js';
import { InputManager } from './input.js';

export abstract class ThunderEngine {
  protected canvas: HTMLCanvasElement;
  protected ctx: CanvasRenderingContext2D;
  protected config: GameConfig;
  protected physics: PhysicsEngine;
  protected input: InputManager;
  protected gameData: GameData;
  protected running: boolean = false;
  protected lastTime: number = 0;
  protected fps: number;

  constructor(config: GameConfig) {
    this.config = config;
    this.canvas = config.canvas;
    const ctx = this.canvas.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    this.ctx = ctx;

    this.physics = new PhysicsEngine(config.gridSize);
    this.input = new InputManager();
    this.fps = config.fps || 60;

    this.gameData = {
      score: 0,
      lives: 3,
      level: 1,
      state: GameState.MENU,
      entities: [],
      grid: []
    };

    this.canvas.width = config.width;
    this.canvas.height = config.height;
  }

  /**
   * Start the game loop
   */
  start(): void {
    if (this.running) return;
    this.running = true;
    this.gameData.state = GameState.PLAYING;
    this.lastTime = performance.now();
    this.gameLoop();
  }

  /**
   * Stop the game loop
   */
  stop(): void {
    this.running = false;
  }

  /**
   * Pause/unpause game
   */
  togglePause(): void {
    if (this.gameData.state === GameState.PLAYING) {
      this.gameData.state = GameState.PAUSED;
    } else if (this.gameData.state === GameState.PAUSED) {
      this.gameData.state = GameState.PLAYING;
    }
  }

  /**
   * Main game loop
   */
  private gameLoop = (): void => {
    if (!this.running) return;

    const currentTime = performance.now();
    const deltaTime = (currentTime - this.lastTime) / 1000; // Convert to seconds
    this.lastTime = currentTime;

    // Update and render
    if (this.gameData.state === GameState.PLAYING) {
      this.update(deltaTime);
    }
    this.render();

    // Request next frame
    requestAnimationFrame(this.gameLoop);
  };

  /**
   * Update game state (override in subclass)
   */
  protected abstract update(deltaTime: number): void;

  /**
   * Render game (override in subclass)
   */
  protected abstract render(): void;

  /**
   * Clear canvas
   */
  protected clear(): void {
    this.ctx.fillStyle = this.config.background;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw entity
   */
  protected drawEntity(entity: Entity): void {
    if (entity.sprite && entity.sprite.length === 2) {
      // Draw emoji
      this.ctx.font = `${entity.size.height}px Arial`;
      this.ctx.textAlign = 'center';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        entity.sprite,
        entity.position.x + entity.size.width / 2,
        entity.position.y + entity.size.height / 2
      );
    } else if (entity.sprite) {
      // Draw image (async loaded)
      const img = new Image();
      img.src = entity.sprite;
      img.onload = () => {
        this.ctx.drawImage(
          img,
          entity.position.x,
          entity.position.y,
          entity.size.width,
          entity.size.height
        );
      };
    } else {
      // Draw rectangle placeholder
      this.ctx.fillStyle = '#7209b7';
      this.ctx.fillRect(
        entity.position.x,
        entity.position.y,
        entity.size.width,
        entity.size.height
      );
    }
  }

  /**
   * Draw grid
   */
  protected drawGrid(): void {
    const gridSize = this.config.gridSize;
    this.ctx.strokeStyle = 'rgba(114, 9, 183, 0.2)';
    this.ctx.lineWidth = 1;

    for (let x = 0; x < this.canvas.width; x += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.canvas.height);
      this.ctx.stroke();
    }

    for (let y = 0; y < this.canvas.height; y += gridSize) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.canvas.width, y);
      this.ctx.stroke();
    }
  }

  /**
   * Draw UI (score, lives, etc)
   */
  protected drawUI(): void {
    this.ctx.fillStyle = '#00f5ff';
    this.ctx.font = 'bold 20px monospace';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`SCORE: ${this.gameData.score}`, 20, 30);
    this.ctx.fillText(`LIVES: ${'❤️'.repeat(this.gameData.lives)}`, 20, 60);
    this.ctx.fillText(`LEVEL: ${this.gameData.level}`, this.canvas.width - 150, 30);

    // Draw state
    if (this.gameData.state === GameState.PAUSED) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#00f5ff';
      this.ctx.font = 'bold 48px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSED', this.canvas.width / 2, this.canvas.height / 2);
    }

    if (this.gameData.state === GameState.GAME_OVER) {
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.fillStyle = '#ff006e';
      this.ctx.font = 'bold 64px monospace';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2 - 40);
      this.ctx.font = 'bold 24px monospace';
      this.ctx.fillStyle = '#00f5ff';
      this.ctx.fillText(`Final Score: ${this.gameData.score}`, this.canvas.width / 2, this.canvas.height / 2 + 20);
    }
  }

  /**
   * Get game data
   */
  getGameData(): GameData {
    return this.gameData;
  }

  /**
   * Cleanup
   */
  destroy(): void {
    this.stop();
    this.input.destroy();
  }
}
