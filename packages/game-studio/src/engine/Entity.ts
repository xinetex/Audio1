import type { Vector2D, Entity as IEntity, GameMap, SpriteAsset } from './types';
import { Sprite, Texture } from 'pixi.js';

export abstract class Entity implements IEntity {
  id: string;
  position: Vector2D;
  direction: Vector2D;
  speed: number;
  sprite: SpriteAsset;
  pixiSprite?: Sprite;
  protected alive: boolean = true;

  constructor(
    id: string,
    position: Vector2D,
    sprite: SpriteAsset,
    speed: number = 2
  ) {
    this.id = id;
    this.position = { ...position };
    this.direction = { x: 0, y: 0 };
    this.speed = speed;
    this.sprite = sprite;
  }

  abstract update(deltaTime: number, gameMap: GameMap): void;

  render(ctx: CanvasRenderingContext2D, tileSize: number): void {
    // Fallback canvas rendering if PixiJS sprite not available
    ctx.save();
    ctx.fillStyle = this.getDebugColor();
    ctx.fillRect(
      this.position.x * tileSize,
      this.position.y * tileSize,
      tileSize,
      tileSize
    );
    ctx.restore();
  }

  // Create PixiJS sprite
  createPixiSprite(texture: Texture, tileSize: number): Sprite {
    this.pixiSprite = new Sprite(texture);
    this.pixiSprite.width = tileSize;
    this.pixiSprite.height = tileSize;
    this.pixiSprite.anchor.set(0.5);
    this.updatePixiPosition(tileSize);
    return this.pixiSprite;
  }

  updatePixiPosition(tileSize: number): void {
    if (this.pixiSprite) {
      this.pixiSprite.x = (this.position.x + 0.5) * tileSize;
      this.pixiSprite.y = (this.position.y + 0.5) * tileSize;
    }
  }

  protected canMoveTo(x: number, y: number, gameMap: GameMap): boolean {
    return gameMap.isWalkable(x, y);
  }

  protected getDebugColor(): string {
    return '#FF00FF';
  }

  isAlive(): boolean {
    return this.alive;
  }

  kill(): void {
    this.alive = false;
  }
}
