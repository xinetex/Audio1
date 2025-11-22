import { Entity } from './Entity';
import type { Vector2D, GameMap, SpriteAsset } from './types';

export class Player extends Entity {
  private targetDirection: Vector2D;
  private animationFrame: number = 0;
  private animationTimer: number = 0;

  constructor(id: string, position: Vector2D, sprite: SpriteAsset) {
    super(id, position, sprite, 3);
    this.targetDirection = { x: 1, y: 0 }; // Start moving right
    this.direction = { ...this.targetDirection };
  }

  update(deltaTime: number, gameMap: GameMap): void {
    if (!this.alive) return;

    // Animation
    this.animationTimer += deltaTime;
    if (this.animationTimer > 0.1) {
      this.animationFrame = (this.animationFrame + 1) % 4;
      this.animationTimer = 0;
    }

    // Movement
    const moveSpeed = this.speed * deltaTime;
    const nextX = this.position.x + this.direction.x * moveSpeed;
    const nextY = this.position.y + this.direction.y * moveSpeed;

    // Try to move in target direction if set
    if (this.targetDirection.x !== this.direction.x || 
        this.targetDirection.y !== this.direction.y) {
      const targetX = this.position.x + this.targetDirection.x * moveSpeed;
      const targetY = this.position.y + this.targetDirection.y * moveSpeed;
      
      if (this.canMoveTo(targetX, targetY, gameMap)) {
        this.direction = { ...this.targetDirection };
      }
    }

    // Move in current direction
    if (this.canMoveTo(nextX, nextY, gameMap)) {
      this.position.x = nextX;
      this.position.y = nextY;
    }

    // Wrap around screen (tunnel effect)
    if (this.position.x < 0) this.position.x = gameMap.width - 1;
    if (this.position.x >= gameMap.width) this.position.x = 0;

    // Collect pills
    const tileX = Math.floor(this.position.x);
    const tileY = Math.floor(this.position.y);
    const tile = gameMap.getTile(tileX, tileY);
    
    if (tile === 'pill' || tile === 'power-pill') {
      gameMap.setTile(tileX, tileY, 'empty');
    }

    // Update PixiJS sprite if available
    if (this.pixiSprite) {
      this.updatePixiPosition(32); // Assuming 32px tiles
      
      // Rotate based on direction
      if (this.direction.x > 0) this.pixiSprite.rotation = 0;
      else if (this.direction.x < 0) this.pixiSprite.rotation = Math.PI;
      else if (this.direction.y > 0) this.pixiSprite.rotation = Math.PI / 2;
      else if (this.direction.y < 0) this.pixiSprite.rotation = -Math.PI / 2;
    }
  }

  setDirection(direction: Vector2D): void {
    this.targetDirection = { ...direction };
  }

  protected getDebugColor(): string {
    return '#FFFF00'; // Yellow for player
  }
}
