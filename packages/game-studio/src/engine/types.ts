export interface Vector2D {
  x: number;
  y: number;
}

export interface GameConfig {
  width: number;
  height: number;
  tileSize: number;
  fps: number;
}

export interface SpriteAsset {
  id: string;
  name: string;
  url: string;
  type: 'player' | 'ghost' | 'wall' | 'pill' | 'power-pill' | 'custom';
  prompt?: string; // AI generation prompt
  style?: string;
}

export interface Entity {
  id: string;
  position: Vector2D;
  direction: Vector2D;
  speed: number;
  sprite: SpriteAsset;
  update(deltaTime: number, gameMap: GameMap): void;
  render(ctx: CanvasRenderingContext2D, tileSize: number): void;
}

export interface GameMap {
  width: number;
  height: number;
  tiles: TileType[][];
  getTile(x: number, y: number): TileType;
  setTile(x: number, y: number, type: TileType): void;
  isWalkable(x: number, y: number): boolean;
}

export type TileType = 'wall' | 'empty' | 'pill' | 'power-pill' | 'spawn-player' | 'spawn-ghost';

export interface GameLevel {
  id: string;
  name: string;
  map: number[][]; // Numeric representation of tiles
  playerSpawn: Vector2D;
  ghostSpawns: Vector2D[];
  sprites: Record<string, SpriteAsset>;
}

export interface GameState {
  score: number;
  lives: number;
  level: number;
  status: 'idle' | 'playing' | 'paused' | 'game-over' | 'victory';
  pillsRemaining: number;
  powerUpActive: boolean;
  powerUpTimer: number;
}
