
/**
 * Game State Management
 * Handles game loop, state transitions, win/lose conditions
 * EXTENSION POINT: Add save states, replay system, telemetry
 */

import { GameState, LevelData, GameConfiguration, EntityType } from './types';
import { PhysicsEngine } from './physics';
import { EntityBehaviorSystem } from './entities';

export class GameStateManager {
  state: GameState;
  physics: PhysicsEngine;
  behaviorSystem: EntityBehaviorSystem;
  animationFrameId: number | null = null;

  constructor(levelData: LevelData) {
    this.physics = new PhysicsEngine(
      levelData.configuration.gravity,
      levelData.configuration.friction
    );
    this.behaviorSystem = new EntityBehaviorSystem();
    
    this.state = {
      isPlaying: false,
      isPaused: false,
      score: 0,
      lives: levelData.configuration.playerLives,
      timeElapsed: 0,
      hasWon: false,
      hasLost: false,
      currentLevel: levelData,
    };
  }

  /**
   * Start the game loop
   */
  start(): void {
    this.state.isPlaying = true;
    this.state.isPaused = false;
  }

  /**
   * Pause the game
   */
  pause(): void {
    this.state.isPaused = true;
  }

  /**
   * Resume the game
   */
  resume(): void {
    this.state.isPaused = false;
  }

  /**
   * Reset the game state
   */
  reset(): void {
    this.state.score = 0;
    this.state.lives = this.state.currentLevel.configuration.playerLives;
    this.state.timeElapsed = 0;
    this.state.hasWon = false;
    this.state.hasLost = false;
    this.state.isPlaying = false;
    this.state.isPaused = false;
  }

  /**
   * Update game state (called each frame)
   */
  update(deltaTime: number): void {
    if (!this.state.isPlaying || this.state.isPaused) return;

    this.state.timeElapsed += deltaTime;

    // Update all entities
    this.updateEntities(deltaTime);

    // Check win/lose conditions
    this.checkGameConditions();
  }

  /**
   * Update all entities in the level
   */
  private updateEntities(deltaTime: number): void {
    const entities = this.state.currentLevel.entities;

    // Update enemies
    entities
      .filter((e) => e.type === EntityType.ENEMY)
      .forEach((enemy: any) => {
        this.behaviorSystem.updateEnemyBehavior(enemy, deltaTime);
        this.physics.applyGravity(enemy.physics);
        enemy.position = this.physics.updatePosition(
          enemy.position,
          enemy.physics.velocity
        );
      });

    // EXTENSION POINT: Update other entity types with custom behaviors
  }

  /**
   * Check win/lose conditions
   */
  private checkGameConditions(): void {
    const player = this.state.currentLevel.entities.find(
      (e) => e.type === EntityType.PLAYER
    ) as any;

    if (!player) return;

    // Check if player reached goal
    const goal = this.state.currentLevel.entities.find(
      (e) => e.type === EntityType.GOAL
    );

    if (goal && this.physics.checkCollision(
      { x: player.position.x, y: player.position.y, width: player.size.x, height: player.size.y },
      { x: goal.position.x, y: goal.position.y, width: goal.size.x, height: goal.size.y }
    )) {
      this.state.hasWon = true;
      this.state.isPlaying = false;
    }

    // Check if player lost all lives
    if (player.lives <= 0) {
      this.state.hasLost = true;
      this.state.isPlaying = false;
    }

    // Check if player fell off the map
    if (player.position.y > 1000) {
      player.lives -= 1;
      // Reset player position
      const spawn = this.state.currentLevel.entities.find(
        (e) => e.type === EntityType.SPAWN
      );
      if (spawn) {
        player.position = { ...spawn.position };
        player.physics.velocity = { x: 0, y: 0 };
      }
    }

    // EXTENSION POINT: Add time limit, score requirements, achievements
  }

  /**
   * Add score
   */
  addScore(points: number): void {
    this.state.score += points;
  }

  /**
   * Remove life
   */
  loseLife(): void {
    this.state.lives -= 1;
  }

  /**
   * EXTENSION POINT: Save game state for replay system
   */
  saveState(): any {
    return {
      score: this.state.score,
      lives: this.state.lives,
      timeElapsed: this.state.timeElapsed,
      entities: JSON.parse(JSON.stringify(this.state.currentLevel.entities)),
    };
  }

  /**
   * EXTENSION POINT: Load saved state
   */
  loadState(savedState: any): void {
    this.state.score = savedState.score;
    this.state.lives = savedState.lives;
    this.state.timeElapsed = savedState.timeElapsed;
    this.state.currentLevel.entities = savedState.entities;
  }
}
