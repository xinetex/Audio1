/**
 * ThunderEngine Physics
 * Collision detection and grid-based movement
 */

import { Entity, Vector2, Bounds, CollisionResult, Direction } from './types.js';

export class PhysicsEngine {
  gridSize: number;

  constructor(gridSize: number) {
    this.gridSize = gridSize;
  }

  /**
   * Check AABB collision between two entities
   */
  checkCollision(a: Entity, b: Entity): boolean {
    return (
      a.position.x < b.position.x + b.size.width &&
      a.position.x + a.size.width > b.position.x &&
      a.position.y < b.position.y + b.size.height &&
      a.position.y + a.size.height > b.position.y
    );
  }

  /**
   * Check collision with all entities of specific types
   */
  checkCollisionWithTypes(entity: Entity, entities: Entity[], types: string[]): CollisionResult {
    for (const other of entities) {
      if (entity.id === other.id) continue;
      if (!types.includes(other.type)) continue;

      if (this.checkCollision(entity, other)) {
        return { collided: true, entity: other };
      }
    }
    return { collided: false };
  }

  /**
   * Snap position to grid
   */
  snapToGrid(position: Vector2): Vector2 {
    return {
      x: Math.round(position.x / this.gridSize) * this.gridSize,
      y: Math.round(position.y / this.gridSize) * this.gridSize
    };
  }

  /**
   * Convert position to grid coordinates
   */
  worldToGrid(position: Vector2): Vector2 {
    return {
      x: Math.floor(position.x / this.gridSize),
      y: Math.floor(position.y / this.gridSize)
    };
  }

  /**
   * Convert grid coordinates to world position
   */
  gridToWorld(gridPos: Vector2): Vector2 {
    return {
      x: gridPos.x * this.gridSize,
      y: gridPos.y * this.gridSize
    };
  }

  /**
   * Check if position is valid on grid (not wall)
   */
  isValidGridPosition(gridPos: Vector2, grid: number[][]): boolean {
    const rows = grid.length;
    const cols = grid[0]?.length || 0;

    if (gridPos.y < 0 || gridPos.y >= rows || gridPos.x < 0 || gridPos.x >= cols) {
      return false;
    }

    return grid[gridPos.y][gridPos.x] !== 1; // 1 = wall
  }

  /**
   * Get next position based on direction
   */
  getNextPosition(current: Vector2, direction: Direction, speed: number): Vector2 {
    const next = { ...current };

    switch (direction) {
      case Direction.UP:
        next.y -= speed;
        break;
      case Direction.DOWN:
        next.y += speed;
        break;
      case Direction.LEFT:
        next.x -= speed;
        break;
      case Direction.RIGHT:
        next.x += speed;
        break;
    }

    return next;
  }

  /**
   * Calculate Manhattan distance between two points
   */
  manhattanDistance(a: Vector2, b: Vector2): number {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }

  /**
   * Calculate Euclidean distance between two points
   */
  distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Clamp value between min and max
   */
  clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
