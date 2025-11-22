
/**
 * Physics Engine
 * Handles gravity, velocity, collision detection, and response
 * EXTENSION POINT: Enhance with advanced physics (Box2D, Matter.js integration)
 */

import { Vector2D, Collider, PhysicsProperties } from './types';

export class PhysicsEngine {
  gravity: number;
  friction: number;

  constructor(gravity: number = 0.8, friction: number = 0.85) {
    this.gravity = gravity;
    this.friction = friction;
  }

  /**
   * Apply gravity to an entity's velocity
   */
  applyGravity(physics: PhysicsProperties): void {
    physics.velocity.y += this.gravity;
  }

  /**
   * Apply friction to an entity's horizontal velocity
   */
  applyFriction(physics: PhysicsProperties, onGround: boolean): void {
    if (onGround) {
      physics.velocity.x *= this.friction;
    }
  }

  /**
   * Update position based on velocity
   */
  updatePosition(position: Vector2D, velocity: Vector2D): Vector2D {
    return {
      x: position.x + velocity.x,
      y: position.y + velocity.y,
    };
  }

  /**
   * Check collision between two rectangular colliders
   * EXTENSION POINT: Add more sophisticated collision shapes (circles, polygons)
   */
  checkCollision(a: Collider, b: Collider): boolean {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /**
   * Resolve collision between player and platform
   * Returns true if player is on top of platform
   */
  resolveCollision(
    playerPos: Vector2D,
    playerSize: Vector2D,
    playerVel: Vector2D,
    platformPos: Vector2D,
    platformSize: Vector2D
  ): { position: Vector2D; velocity: Vector2D; onGround: boolean } {
    let onGround = false;
    const newPos = { ...playerPos };
    const newVel = { ...playerVel };

    // Calculate overlap on each axis
    const overlapX = Math.min(
      playerPos.x + playerSize.x - platformPos.x,
      platformPos.x + platformSize.x - playerPos.x
    );
    const overlapY = Math.min(
      playerPos.y + playerSize.y - platformPos.y,
      platformPos.y + platformSize.y - playerPos.y
    );

    // Resolve collision based on smallest overlap
    if (overlapX < overlapY) {
      // Horizontal collision
      if (playerPos.x < platformPos.x) {
        newPos.x = platformPos.x - playerSize.x;
      } else {
        newPos.x = platformPos.x + platformSize.x;
      }
      newVel.x = 0;
    } else {
      // Vertical collision
      if (playerPos.y < platformPos.y) {
        // Player is on top
        newPos.y = platformPos.y - playerSize.y;
        newVel.y = 0;
        onGround = true;
      } else {
        // Player hit from below
        newPos.y = platformPos.y + platformSize.y;
        newVel.y = 0;
      }
    }

    return { position: newPos, velocity: newVel, onGround };
  }

  /**
   * EXTENSION POINT: Add raycast for advanced collision detection
   */
  raycast(origin: Vector2D, direction: Vector2D, maxDistance: number): Vector2D | null {
    // Placeholder for future raycast implementation
    return null;
  }
}
