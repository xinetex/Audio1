
/**
 * Game Entity Classes
 * Defines behavior and properties for different game objects
 * EXTENSION POINT: Add more entity types, complex behaviors, state machines
 */

import {
  EntityType,
  GameEntity,
  PlayerEntity,
  PlatformEntity,
  EnemyEntity,
  CollectibleEntity,
  GoalEntity,
  Vector2D,
} from './types';

export function createPlayer(position: Vector2D, config: any): PlayerEntity {
  return {
    id: 'player',
    type: EntityType.PLAYER,
    position,
    size: { x: 30, y: 30 },
    color: config.playerColor || '#4CAF50',
    physics: {
      velocity: { x: 0, y: 0 },
      acceleration: { x: 0, y: 0 },
      gravity: config.gravity || 0.8,
      friction: config.friction || 0.85,
    },
    speed: config.playerSpeed || 5,
    jumpPower: config.playerJumpPower || 15,
    health: 100,
    lives: config.playerLives || 3,
  };
}

export function createPlatform(
  position: Vector2D,
  size: Vector2D,
  color?: string
): PlatformEntity {
  return {
    id: `platform-${Date.now()}-${Math.random()}`,
    type: EntityType.PLATFORM,
    position,
    size,
    color: color || '#795548',
    friction: 0.85,
    // EXTENSION POINT: Initialize moving platform properties
  };
}

export function createEnemy(position: Vector2D, config: any): EnemyEntity {
  return {
    id: `enemy-${Date.now()}-${Math.random()}`,
    type: EntityType.ENEMY,
    position,
    size: { x: 30, y: 30 },
    color: config.enemyColor || '#F44336',
    physics: {
      velocity: { x: 2, y: 0 },
      acceleration: { x: 0, y: 0 },
      gravity: config.gravity || 0.8,
      friction: config.friction || 0.85,
    },
    patrolRange: 150,
    damage: 25,
    // EXTENSION POINT: Add AI pattern initialization
    aiPattern: 'patrol',
  };
}

export function createCollectible(position: Vector2D, config: any): CollectibleEntity {
  return {
    id: `collectible-${Date.now()}-${Math.random()}`,
    type: EntityType.COLLECTIBLE,
    position,
    size: { x: 20, y: 20 },
    color: config.collectibleColor || '#FFC107',
    points: 10,
    collected: false,
  };
}

export function createGoal(position: Vector2D): GoalEntity {
  return {
    id: 'goal',
    type: EntityType.GOAL,
    position,
    size: { x: 40, y: 60 },
    color: '#2196F3',
  };
}

/**
 * EXTENSION POINT: Entity behavior system
 * Add behavior trees, state machines for complex entity AI
 */
export class EntityBehaviorSystem {
  updateEnemyBehavior(enemy: EnemyEntity, deltaTime: number): void {
    // Simple patrol behavior
    const startX = enemy.position.x - enemy.patrolRange / 2;
    const endX = enemy.position.x + enemy.patrolRange / 2;

    // Reverse direction at patrol bounds
    if (
      enemy.position.x <= startX ||
      enemy.position.x >= endX
    ) {
      enemy.physics.velocity.x *= -1;
    }
    
    // EXTENSION POINT: Implement chase behavior, attack patterns
  }

  /**
   * EXTENSION POINT: Add collectible attraction behavior (magnet effect)
   */
  updateCollectibleBehavior(collectible: CollectibleEntity, playerPos: Vector2D): void {
    // Placeholder for future attraction mechanics
  }
}
