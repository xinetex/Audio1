
/**
 * Canvas Renderer
 * Handles all drawing operations for the game
 * EXTENSION POINT: Add WebGL rendering, particle effects, advanced shaders
 */

import { GameEntity, EntityType, LevelData } from './types';

export class CanvasRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: { x: number; y: number };

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get 2D context');
    }
    this.ctx = context;
    this.camera = { x: 0, y: 0 };
  }

  /**
   * Clear the canvas
   */
  clear(backgroundColor: string = '#87CEEB'): void {
    this.ctx.fillStyle = backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Update camera to follow player
   */
  updateCamera(playerX: number, playerY: number, canvasWidth: number, canvasHeight: number): void {
    // Center camera on player with smooth follow
    const targetX = playerX - canvasWidth / 2;
    const targetY = playerY - canvasHeight / 2;
    
    this.camera.x += (targetX - this.camera.x) * 0.1;
    this.camera.y += (targetY - this.camera.y) * 0.1;
  }

  /**
   * Convert world coordinates to screen coordinates
   */
  private worldToScreen(x: number, y: number): { x: number; y: number } {
    return {
      x: x - this.camera.x,
      y: y - this.camera.y,
    };
  }

  /**
   * Render all entities
   */
  renderEntities(entities: GameEntity[]): void {
    entities.forEach((entity) => {
      const screenPos = this.worldToScreen(entity.position.x, entity.position.y);
      
      this.ctx.fillStyle = entity.color || '#000000';
      
      switch (entity.type) {
        case EntityType.PLAYER:
          this.renderPlayer(screenPos.x, screenPos.y, entity.size.x, entity.size.y);
          break;
        case EntityType.PLATFORM:
          this.renderPlatform(screenPos.x, screenPos.y, entity.size.x, entity.size.y);
          break;
        case EntityType.ENEMY:
          this.renderEnemy(screenPos.x, screenPos.y, entity.size.x, entity.size.y);
          break;
        case EntityType.COLLECTIBLE:
          this.renderCollectible(screenPos.x, screenPos.y, entity.size.x, entity.size.y, entity as any);
          break;
        case EntityType.GOAL:
          this.renderGoal(screenPos.x, screenPos.y, entity.size.x, entity.size.y);
          break;
        case EntityType.SPAWN:
          this.renderSpawn(screenPos.x, screenPos.y, entity.size.x, entity.size.y);
          break;
      }
    });
  }

  /**
   * Render player character
   * EXTENSION POINT: Add sprite rendering, animations
   */
  private renderPlayer(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = '#4CAF50';
    this.ctx.fillRect(x, y, width, height);
    
    // Add simple face
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillRect(x + 8, y + 10, 5, 5); // Left eye
    this.ctx.fillRect(x + 17, y + 10, 5, 5); // Right eye
    
    // Smile
    this.ctx.strokeStyle = '#FFFFFF';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.arc(x + 15, y + 18, 8, 0, Math.PI);
    this.ctx.stroke();
  }

  /**
   * Render platform
   */
  private renderPlatform(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = '#795548';
    this.ctx.fillRect(x, y, width, height);
    
    // Add texture pattern
    this.ctx.strokeStyle = '#5D4037';
    this.ctx.lineWidth = 1;
    for (let i = 0; i < width; i += 20) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i, y + height);
      this.ctx.stroke();
    }
  }

  /**
   * Render enemy
   */
  private renderEnemy(x: number, y: number, width: number, height: number): void {
    this.ctx.fillStyle = '#F44336';
    this.ctx.fillRect(x, y, width, height);
    
    // Add spikes
    this.ctx.fillStyle = '#B71C1C';
    for (let i = 0; i < width; i += 10) {
      this.ctx.beginPath();
      this.ctx.moveTo(x + i, y);
      this.ctx.lineTo(x + i + 5, y - 5);
      this.ctx.lineTo(x + i + 10, y);
      this.ctx.fill();
    }
  }

  /**
   * Render collectible (coin/gem)
   */
  private renderCollectible(x: number, y: number, width: number, height: number, entity: any): void {
    if (entity.collected) return;
    
    // Animate rotation
    const time = Date.now() / 1000;
    const rotation = Math.sin(time * 3) * 0.3;
    
    this.ctx.save();
    this.ctx.translate(x + width / 2, y + height / 2);
    this.ctx.rotate(rotation);
    
    // Draw coin
    this.ctx.fillStyle = '#FFC107';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, width / 2, 0, Math.PI * 2);
    this.ctx.fill();
    
    // Inner circle
    this.ctx.fillStyle = '#FFD54F';
    this.ctx.beginPath();
    this.ctx.arc(0, 0, width / 3, 0, Math.PI * 2);
    this.ctx.fill();
    
    this.ctx.restore();
  }

  /**
   * Render goal flag
   */
  private renderGoal(x: number, y: number, width: number, height: number): void {
    // Pole
    this.ctx.fillStyle = '#424242';
    this.ctx.fillRect(x + width / 2 - 2, y, 4, height);
    
    // Flag
    this.ctx.fillStyle = '#2196F3';
    this.ctx.beginPath();
    this.ctx.moveTo(x + width / 2, y + 5);
    this.ctx.lineTo(x + width - 5, y + 15);
    this.ctx.lineTo(x + width / 2, y + 25);
    this.ctx.fill();
  }

  /**
   * Render spawn point
   */
  private renderSpawn(x: number, y: number, width: number, height: number): void {
    // Only render in editor mode, not during gameplay
    this.ctx.strokeStyle = '#4CAF50';
    this.ctx.lineWidth = 2;
    this.ctx.setLineDash([5, 5]);
    this.ctx.strokeRect(x, y, width, height);
    this.ctx.setLineDash([]);
  }

  /**
   * Render UI elements (score, lives, etc.)
   */
  renderUI(score: number, lives: number, time: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 20px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 3;
    
    // Score
    const scoreText = `Score: ${score}`;
    this.ctx.strokeText(scoreText, 20, 30);
    this.ctx.fillText(scoreText, 20, 30);
    
    // Lives
    const livesText = `Lives: ${lives}`;
    this.ctx.strokeText(livesText, 20, 60);
    this.ctx.fillText(livesText, 20, 60);
    
    // Time
    const timeText = `Time: ${Math.floor(time / 1000)}s`;
    this.ctx.strokeText(timeText, 20, 90);
    this.ctx.fillText(timeText, 20, 90);
    
    this.ctx.restore();
  }

  /**
   * Render game over screen
   */
  renderGameOver(hasWon: boolean, score: number): void {
    this.ctx.save();
    
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Message
    this.ctx.font = 'bold 48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillStyle = hasWon ? '#4CAF50' : '#F44336';
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 4;
    
    const message = hasWon ? 'Victory!' : 'Game Over';
    this.ctx.strokeText(message, this.canvas.width / 2, this.canvas.height / 2 - 40);
    this.ctx.fillText(message, this.canvas.width / 2, this.canvas.height / 2 - 40);
    
    // Score
    this.ctx.font = 'bold 24px Arial';
    this.ctx.fillStyle = '#FFFFFF';
    const scoreText = `Final Score: ${score}`;
    this.ctx.strokeText(scoreText, this.canvas.width / 2, this.canvas.height / 2 + 20);
    this.ctx.fillText(scoreText, this.canvas.width / 2, this.canvas.height / 2 + 20);
    
    this.ctx.restore();
  }

  /**
   * EXTENSION POINT: Particle system renderer
   */
  renderParticles(particles: any[]): void {
    // Placeholder for future particle effects
  }

  /**
   * EXTENSION POINT: WebGL rendering pipeline
   */
  initWebGL(): void {
    // Placeholder for WebGL initialization with shaders
  }
}
