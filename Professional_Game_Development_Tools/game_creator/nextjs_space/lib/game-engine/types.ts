
/**
 * Core type definitions for the game engine
 * EXTENSION POINT: Add new entity types, properties for advanced features
 */

export interface Vector2D {
  x: number;
  y: number;
}

export interface PhysicsProperties {
  velocity: Vector2D;
  acceleration: Vector2D;
  gravity: number;
  friction: number;
}

export interface Collider {
  x: number;
  y: number;
  width: number;
  height: number;
}

export enum EntityType {
  PLAYER = 'player',
  PLATFORM = 'platform',
  ENEMY = 'enemy',
  COLLECTIBLE = 'collectible',
  GOAL = 'goal',
  SPAWN = 'spawn',
  // EXTENSION POINT: Add new entity types (e.g., MOVING_PLATFORM, HAZARD, POWERUP)
}

export interface GameEntity {
  id: string;
  type: EntityType;
  position: Vector2D;
  size: Vector2D;
  color?: string;
  // EXTENSION POINT: Add sprite/animation data for advanced rendering
  spriteUrl?: string;
  animationState?: string;
}

export interface PlayerEntity extends GameEntity {
  type: EntityType.PLAYER;
  physics: PhysicsProperties;
  speed: number;
  jumpPower: number;
  health: number;
  lives: number;
}

export interface PlatformEntity extends GameEntity {
  type: EntityType.PLATFORM;
  friction: number;
  // EXTENSION POINT: Add moving platform properties
  isMoving?: boolean;
  movementPath?: Vector2D[];
}

export interface EnemyEntity extends GameEntity {
  type: EntityType.ENEMY;
  physics: PhysicsProperties;
  patrolRange: number;
  damage: number;
  // EXTENSION POINT: Add AI behavior patterns
  aiPattern?: 'patrol' | 'chase' | 'stationary';
}

export interface CollectibleEntity extends GameEntity {
  type: EntityType.COLLECTIBLE;
  points: number;
  collected: boolean;
}

export interface GoalEntity extends GameEntity {
  type: EntityType.GOAL;
}

export interface GameConfiguration {
  // Physics settings
  gravity: number;
  friction: number;
  
  // Player settings
  playerSpeed: number;
  playerJumpPower: number;
  playerLives: number;
  
  // Level settings
  timeLimit?: number;
  scoreTarget?: number;
  
  // Visual settings
  backgroundColor: string;
  platformColor: string;
  playerColor: string;
  enemyColor: string;
  collectibleColor: string;
  
  // EXTENSION POINT: Add procedural generation settings
  enableProcGen?: boolean;
  procGenSeed?: string;
}

export interface LevelData {
  id?: string;
  title: string;
  description?: string;
  configuration: GameConfiguration;
  entities: GameEntity[];
  // EXTENSION POINT: Add metadata for AI training
  difficultyScore?: number;
  completionRate?: number;
}

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  lives: number;
  timeElapsed: number;
  hasWon: boolean;
  hasLost: boolean;
  currentLevel: LevelData;
}
