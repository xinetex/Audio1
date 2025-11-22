/**
 * Pac-Man Game
 * Classic Pac-Man mechanics using ThunderEngine
 */

import { ThunderEngine } from './engine.js';
import { Entity, EntityType, Direction, GameConfig, GameState, Vector2 } from './types.js';

export class PacManGame extends ThunderEngine {
  private player: Entity | null = null;
  private ghosts: Entity[] = [];
  private pellets: Entity[] = [];
  private powerMode: boolean = false;
  private powerModeTimer: number = 0;
  private readonly POWER_MODE_DURATION = 8; // seconds
  private readonly PELLET_POINTS = 10;
  private readonly POWER_PELLET_POINTS = 50;
  private readonly GHOST_POINTS = 200;

  constructor(config: GameConfig) {
    super(config);
    this.initializeLevel();
  }

  /**
   * Initialize level with grid, player, ghosts, and pellets
   */
  private initializeLevel(): void {
    // Create simple level grid (25x19 grid)
    const rows = Math.floor(this.config.height / this.config.gridSize);
    const cols = Math.floor(this.config.width / this.config.gridSize);
    
    this.gameData.grid = this.createMazeGrid(rows, cols);
    
    // Create player
    this.player = {
      id: 'player',
      position: { x: this.config.gridSize * 12, y: this.config.gridSize * 14 },
      size: { width: this.config.gridSize, height: this.config.gridSize },
      velocity: { x: 0, y: 0 },
      direction: Direction.NONE,
      speed: this.config.gridSize * 4, // 4 tiles per second
      sprite: '😊',
      type: EntityType.PLAYER
    };
    this.gameData.entities.push(this.player);

    // Create ghosts
    const ghostColors = ['👻', '💀', '🦇', '🧛'];
    const ghostStartPositions = [
      { x: 10, y: 7 },
      { x: 12, y: 7 },
      { x: 14, y: 7 },
      { x: 12, y: 9 }
    ];

    ghostStartPositions.forEach((pos, i) => {
      const ghost: Entity = {
        id: `ghost-${i}`,
        position: {
          x: pos.x * this.config.gridSize,
          y: pos.y * this.config.gridSize
        },
        size: { width: this.config.gridSize, height: this.config.gridSize },
        velocity: { x: 0, y: 0 },
        direction: Direction.RIGHT,
        speed: this.config.gridSize * 3, // Slightly slower than player
        sprite: ghostColors[i],
        type: EntityType.GHOST
      };
      this.ghosts.push(ghost);
      this.gameData.entities.push(ghost);
    });

    // Place pellets on all walkable tiles
    this.placePellets();
  }

  /**
   * Create maze grid
   */
  private createMazeGrid(rows: number, cols: number): number[][] {
    const grid: number[][] = Array(rows).fill(0).map(() => Array(cols).fill(0));

    // Create border walls
    for (let i = 0; i < cols; i++) {
      grid[0][i] = 1;
      grid[rows - 1][i] = 1;
    }
    for (let i = 0; i < rows; i++) {
      grid[i][0] = 1;
      grid[i][cols - 1] = 1;
    }

    // Create inner maze pattern (simple symmetric design)
    const patterns = [
      { x: 3, y: 3, w: 2, h: 2 },
      { x: 8, y: 3, w: 3, h: 2 },
      { x: 14, y: 3, w: 3, h: 2 },
      { x: 20, y: 3, w: 2, h: 2 },
      { x: 3, y: 7, w: 2, h: 3 },
      { x: 7, y: 7, w: 2, h: 5 },
      { x: 16, y: 7, w: 2, h: 5 },
      { x: 20, y: 7, w: 2, h: 3 },
      { x: 11, y: 6, w: 3, h: 1 },
      { x: 11, y: 8, w: 3, h: 2 }
    ];

    patterns.forEach(p => {
      for (let y = p.y; y < p.y + p.h && y < rows; y++) {
        for (let x = p.x; x < p.x + p.w && x < cols; x++) {
          grid[y][x] = 1;
        }
      }
    });

    return grid;
  }

  /**
   * Place pellets on walkable tiles
   */
  private placePellets(): void {
    const rows = this.gameData.grid.length;
    const cols = this.gameData.grid[0].length;

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (this.gameData.grid[y][x] === 0) {
          // Skip player starting position
          if (x === 12 && y === 14) continue;
          
          // Skip ghost area
          if (x >= 10 && x <= 14 && y >= 7 && y <= 9) continue;

          // 10% chance for power pellet
          const isPowerPellet = Math.random() < 0.1;
          
          const pellet: Entity = {
            id: `pellet-${x}-${y}`,
            position: {
              x: x * this.config.gridSize + this.config.gridSize / 2 - 3,
              y: y * this.config.gridSize + this.config.gridSize / 2 - 3
            },
            size: { width: 6, height: 6 },
            velocity: { x: 0, y: 0 },
            direction: Direction.NONE,
            speed: 0,
            sprite: isPowerPellet ? '⭐' : '💎',
            type: isPowerPellet ? EntityType.POWER_PELLET : EntityType.PELLET
          };
          
          this.pellets.push(pellet);
          this.gameData.entities.push(pellet);
        }
      }
    }
  }

  /**
   * Update game logic
   */
  protected update(deltaTime: number): void {
    if (!this.player) return;

    // Handle power mode timer
    if (this.powerMode) {
      this.powerModeTimer -= deltaTime;
      if (this.powerModeTimer <= 0) {
        this.powerMode = false;
      }
    }

    // Update player
    this.updatePlayer(deltaTime);

    // Update ghosts
    this.ghosts.forEach(ghost => this.updateGhost(ghost, deltaTime));

    // Check collisions
    this.checkCollisions();

    // Check win condition
    if (this.pellets.length === 0) {
      this.gameData.state = GameState.WIN;
    }

    // Check lose condition
    if (this.gameData.lives <= 0) {
      this.gameData.state = GameState.GAME_OVER;
    }
  }

  /**
   * Update player movement
   */
  private updatePlayer(deltaTime: number): void {
    if (!this.player) return;

    const input = this.input.getDirection();
    
    // Update direction if input
    if (input !== Direction.NONE) {
      const nextPos = this.physics.getNextPosition(
        this.player.position,
        input,
        this.player.speed * deltaTime
      );
      const gridPos = this.physics.worldToGrid(nextPos);
      
      // Check if new direction is valid
      if (this.physics.isValidGridPosition(gridPos, this.gameData.grid)) {
        this.player.direction = input;
      }
    }

    // Continue moving in current direction
    if (this.player.direction !== Direction.NONE) {
      const nextPos = this.physics.getNextPosition(
        this.player.position,
        this.player.direction,
        this.player.speed * deltaTime
      );
      const gridPos = this.physics.worldToGrid(nextPos);

      if (this.physics.isValidGridPosition(gridPos, this.gameData.grid)) {
        this.player.position = nextPos;
      } else {
        // Stop at wall
        this.player.direction = Direction.NONE;
      }
    }
  }

  /**
   * Update ghost AI (simple chase/scatter)
   */
  private updateGhost(ghost: Entity, deltaTime: number): void {
    if (!this.player) return;

    // Random direction change occasionally
    if (Math.random() < 0.02) {
      const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
      ghost.direction = directions[Math.floor(Math.random() * directions.length)];
    }

    // Chase player if not in power mode, otherwise scatter
    if (!this.powerMode && Math.random() < 0.05) {
      const playerGridPos = this.physics.worldToGrid(this.player.position);
      const ghostGridPos = this.physics.worldToGrid(ghost.position);
      
      // Simple AI: move towards player
      const dx = playerGridPos.x - ghostGridPos.x;
      const dy = playerGridPos.y - ghostGridPos.y;
      
      if (Math.abs(dx) > Math.abs(dy)) {
        ghost.direction = dx > 0 ? Direction.RIGHT : Direction.LEFT;
      } else {
        ghost.direction = dy > 0 ? Direction.DOWN : Direction.UP;
      }
    }

    // Move ghost
    const nextPos = this.physics.getNextPosition(
      ghost.position,
      ghost.direction,
      ghost.speed * deltaTime
    );
    const gridPos = this.physics.worldToGrid(nextPos);

    if (this.physics.isValidGridPosition(gridPos, this.gameData.grid)) {
      ghost.position = nextPos;
    } else {
      // Hit wall, change direction
      const directions = [Direction.UP, Direction.DOWN, Direction.LEFT, Direction.RIGHT];
      ghost.direction = directions[Math.floor(Math.random() * directions.length)];
    }
  }

  /**
   * Check collisions
   */
  private checkCollisions(): void {
    if (!this.player) return;

    // Check pellet collision
    for (let i = this.pellets.length - 1; i >= 0; i--) {
      const pellet = this.pellets[i];
      if (this.physics.checkCollision(this.player, pellet)) {
        // Collect pellet
        this.pellets.splice(i, 1);
        this.gameData.entities = this.gameData.entities.filter(e => e.id !== pellet.id);
        
        if (pellet.type === EntityType.POWER_PELLET) {
          this.gameData.score += this.POWER_PELLET_POINTS;
          this.powerMode = true;
          this.powerModeTimer = this.POWER_MODE_DURATION;
        } else {
          this.gameData.score += this.PELLET_POINTS;
        }
      }
    }

    // Check ghost collision
    for (const ghost of this.ghosts) {
      if (this.physics.checkCollision(this.player, ghost)) {
        if (this.powerMode) {
          // Eat ghost
          this.gameData.score += this.GHOST_POINTS;
          // Reset ghost position
          ghost.position = { x: 12 * this.config.gridSize, y: 7 * this.config.gridSize };
        } else {
          // Lose life
          this.gameData.lives--;
          // Reset player position
          this.player.position = { x: 12 * this.config.gridSize, y: 14 * this.config.gridSize };
          this.player.direction = Direction.NONE;
        }
      }
    }
  }

  /**
   * Render game
   */
  protected render(): void {
    this.clear();
    
    // Draw maze
    this.drawMaze();
    
    // Draw all entities
    this.gameData.entities.forEach(entity => {
      // Change ghost appearance in power mode
      if (entity.type === EntityType.GHOST && this.powerMode) {
        const originalSprite = entity.sprite;
        entity.sprite = '😱';
        this.drawEntity(entity);
        entity.sprite = originalSprite;
      } else {
        this.drawEntity(entity);
      }
    });
    
    // Draw UI
    this.drawUI();
    
    // Draw power mode indicator
    if (this.powerMode) {
      this.ctx.fillStyle = '#ff006e';
      this.ctx.font = 'bold 16px monospace';
      this.ctx.textAlign = 'right';
      this.ctx.fillText(
        `POWER: ${this.powerModeTimer.toFixed(1)}s`,
        this.canvas.width - 20,
        60
      );
    }
  }

  /**
   * Draw maze walls
   */
  private drawMaze(): void {
    const rows = this.gameData.grid.length;
    const cols = this.gameData.grid[0].length;
    
    this.ctx.fillStyle = '#2d1b4e';
    
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        if (this.gameData.grid[y][x] === 1) {
          this.ctx.fillRect(
            x * this.config.gridSize,
            y * this.config.gridSize,
            this.config.gridSize,
            this.config.gridSize
          );
          
          // Draw border
          this.ctx.strokeStyle = '#7209b7';
          this.ctx.lineWidth = 2;
          this.ctx.strokeRect(
            x * this.config.gridSize,
            y * this.config.gridSize,
            this.config.gridSize,
            this.config.gridSize
          );
        }
      }
    }
  }
}
