import { Entity } from './Entity';
import type { Vector2D, GameMap, SpriteAsset } from './types';
import { Player } from './Player';

export type GhostPersonality = 'chaser' | 'ambusher' | 'random' | 'patrol';

export class Ghost extends Entity {
  private personality: GhostPersonality;
  private target?: Player;
  private scatterTarget: Vector2D;
  private mode: 'chase' | 'scatter' | 'frightened' = 'chase';
  private modeTimer: number = 0;
  private frightendTimer: number = 0;

  constructor(
    id: string,
    position: Vector2D,
    sprite: SpriteAsset,
    personality: GhostPersonality = 'chaser'
  ) {
    super(id, position, sprite, 2);
    this.personality = personality;
    this.scatterTarget = { ...position }; // Home corner
    this.direction = { x: -1, y: 0 }; // Start moving left
  }

  setTarget(player: Player): void {
    this.target = player;
  }

  setFrightened(duration: number = 7): void {
    this.mode = 'frightened';
    this.frightendTimer = duration;
    if (this.pixiSprite) {
      this.pixiSprite.tint = 0x0000FF; // Blue when frightened
    }
  }

  update(deltaTime: number, gameMap: GameMap): void {
    if (!this.alive) return;

    // Update mode timers
    this.modeTimer += deltaTime;
    if (this.mode === 'frightened') {
      this.frightendTimer -= deltaTime;
      if (this.frightendTimer <= 0) {
        this.mode = 'chase';
        if (this.pixiSprite) {
          this.pixiSprite.tint = 0xFFFFFF; // Reset color
        }
      }
    } else {
      // Alternate between chase and scatter modes
      if (this.modeTimer > 20) {
        this.mode = this.mode === 'chase' ? 'scatter' : 'chase';
        this.modeTimer = 0;
      }
    }

    // Determine target based on mode
    let targetPos: Vector2D;
    if (this.mode === 'frightened') {
      targetPos = this.getRandomTarget(gameMap);
    } else if (this.mode === 'scatter') {
      targetPos = this.scatterTarget;
    } else {
      targetPos = this.getChaseTarget(gameMap);
    }

    // Calculate best direction
    this.updateDirection(targetPos, gameMap);

    // Move
    const moveSpeed = this.speed * deltaTime * (this.mode === 'frightened' ? 0.7 : 1);
    const nextX = this.position.x + this.direction.x * moveSpeed;
    const nextY = this.position.y + this.direction.y * moveSpeed;

    if (this.canMoveTo(nextX, nextY, gameMap)) {
      this.position.x = nextX;
      this.position.y = nextY;
    } else {
      // Hit a wall, choose new direction
      this.chooseNewDirection(gameMap);
    }

    // Wrap around screen
    if (this.position.x < 0) this.position.x = gameMap.width - 1;
    if (this.position.x >= gameMap.width) this.position.x = 0;

    // Update PixiJS sprite
    if (this.pixiSprite) {
      this.updatePixiPosition(32);
    }
  }

  private getChaseTarget(gameMap: GameMap): Vector2D {
    if (!this.target) return this.position;

    switch (this.personality) {
      case 'chaser':
        // Direct chase
        return this.target.position;
      
      case 'ambusher':
        // Target ahead of player
        return {
          x: this.target.position.x + this.target.direction.x * 4,
          y: this.target.position.y + this.target.direction.y * 4,
        };
      
      case 'patrol':
        // Target corner positions
        return this.getNextPatrolPoint();
      
      case 'random':
      default:
        return this.getRandomTarget(gameMap);
    }
  }

  private getRandomTarget(gameMap: GameMap): Vector2D {
    return {
      x: Math.random() * gameMap.width,
      y: Math.random() * gameMap.height,
    };
  }

  private getNextPatrolPoint(): Vector2D {
    // Simple patrol pattern
    const points = [
      { x: 1, y: 1 },
      { x: this.scatterTarget.x, y: 1 },
      { x: this.scatterTarget.x, y: this.scatterTarget.y },
      { x: 1, y: this.scatterTarget.y },
    ];
    return points[Math.floor(Date.now() / 5000) % points.length];
  }

  private updateDirection(target: Vector2D, gameMap: GameMap): void {
    const dx = target.x - this.position.x;
    const dy = target.y - this.position.y;

    // Get possible directions (not backwards)
    const possibleDirs: Vector2D[] = [];
    
    if (this.direction.x === 0) {
      // Moving vertically, can go left/right/continue
      if (Math.abs(dx) > 0.5) {
        possibleDirs.push({ x: dx > 0 ? 1 : -1, y: 0 });
      }
      possibleDirs.push({ x: 0, y: this.direction.y });
    } else {
      // Moving horizontally, can go up/down/continue
      if (Math.abs(dy) > 0.5) {
        possibleDirs.push({ x: 0, y: dy > 0 ? 1 : -1 });
      }
      possibleDirs.push({ x: this.direction.x, y: 0 });
    }

    // Choose best valid direction
    for (const dir of possibleDirs) {
      const testX = this.position.x + dir.x * 0.5;
      const testY = this.position.y + dir.y * 0.5;
      if (this.canMoveTo(testX, testY, gameMap)) {
        this.direction = dir;
        return;
      }
    }
  }

  private chooseNewDirection(gameMap: GameMap): void {
    const directions = [
      { x: 1, y: 0 },
      { x: -1, y: 0 },
      { x: 0, y: 1 },
      { x: 0, y: -1 },
    ];

    // Filter out backwards direction
    const validDirs = directions.filter(dir => {
      if (dir.x === -this.direction.x && dir.y === -this.direction.y) return false;
      const testX = this.position.x + dir.x * 0.5;
      const testY = this.position.y + dir.y * 0.5;
      return this.canMoveTo(testX, testY, gameMap);
    });

    if (validDirs.length > 0) {
      this.direction = validDirs[Math.floor(Math.random() * validDirs.length)];
    }
  }

  isFrightened(): boolean {
    return this.mode === 'frightened';
  }

  protected getDebugColor(): string {
    if (this.mode === 'frightened') return '#0000FF';
    return '#FF69B4'; // Pink for ghosts
  }
}
