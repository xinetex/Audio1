/**
 * ThunderEngine Types
 * Core type definitions for game runtime
 */

export interface Vector2 {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum Direction {
  UP = 'UP',
  DOWN = 'DOWN',
  LEFT = 'LEFT',
  RIGHT = 'RIGHT',
  NONE = 'NONE'
}

export interface Entity {
  id: string;
  position: Vector2;
  size: Size;
  velocity: Vector2;
  direction: Direction;
  speed: number;
  sprite?: string; // emoji or image URL
  type: EntityType;
}

export enum EntityType {
  PLAYER = 'PLAYER',
  GHOST = 'GHOST',
  PELLET = 'PELLET',
  POWER_PELLET = 'POWER_PELLET',
  WALL = 'WALL',
  FRUIT = 'FRUIT'
}

export enum GameState {
  MENU = 'MENU',
  PLAYING = 'PLAYING',
  PAUSED = 'PAUSED',
  GAME_OVER = 'GAME_OVER',
  WIN = 'WIN'
}

export interface GameConfig {
  canvas: HTMLCanvasElement;
  gridSize: number;
  width: number;
  height: number;
  background: string;
  fps?: number;
}

export interface CollisionResult {
  collided: boolean;
  entity?: Entity;
  overlap?: Bounds;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
}

export interface GameData {
  score: number;
  lives: number;
  level: number;
  state: GameState;
  entities: Entity[];
  grid: number[][]; // 0=empty, 1=wall, 2=pellet, 3=power pellet
}
