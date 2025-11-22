
'use client';

/**
 * Game Preview Component
 * Playable game instance with full physics and controls
 * EXTENSION POINT: Add replays, spectator mode, multiplayer sync
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Play, Pause, RotateCcw, X } from 'lucide-react';
import { LevelData, EntityType, PlayerEntity } from '@/lib/game-engine/types';
import { PhysicsEngine } from '@/lib/game-engine/physics';
import { CanvasRenderer } from '@/lib/game-engine/renderer';
import { createPlayer } from '@/lib/game-engine/entities';

interface GamePreviewProps {
  levelData: LevelData;
  onClose?: () => void;
}

export function GamePreview({ levelData, onClose }: GamePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(levelData.configuration.playerLives);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost' | 'paused'>('paused');

  // Game state refs
  const playerRef = useRef<PlayerEntity | null>(null);
  const entitiesRef = useRef(JSON.parse(JSON.stringify(levelData.entities)));
  const physicsRef = useRef<PhysicsEngine>(
    new PhysicsEngine(levelData.configuration.gravity, levelData.configuration.friction)
  );
  const rendererRef = useRef<CanvasRenderer | null>(null);
  const keysRef = useRef<Set<string>>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(Date.now());

  // Initialize game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = new CanvasRenderer(canvas);

    // Find spawn point and create player
    const spawnPoint = levelData.entities.find((e) => e.type === EntityType.SPAWN);
    if (spawnPoint) {
      playerRef.current = createPlayer(
        { ...spawnPoint.position },
        levelData.configuration
      );
      entitiesRef.current = [
        playerRef.current,
        ...levelData.entities.filter((e) => e.type !== EntityType.SPAWN),
      ];
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [levelData]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysRef.current.add(e.key.toLowerCase());
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Game loop
  const gameLoop = useCallback(() => {
    if (!rendererRef.current || !playerRef.current || gameState !== 'playing') {
      return;
    }

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTimeRef.current) / 1000;
    lastTimeRef.current = currentTime;

    const player = playerRef.current;
    const physics = physicsRef.current;
    const renderer = rendererRef.current;

    // Handle input
    if (keysRef.current.has('arrowleft') || keysRef.current.has('a')) {
      player.physics.velocity.x = -player.speed;
    } else if (keysRef.current.has('arrowright') || keysRef.current.has('d')) {
      player.physics.velocity.x = player.speed;
    }

    // Jump
    if (keysRef.current.has('arrowup') || keysRef.current.has('w') || keysRef.current.has(' ')) {
      // Check if on ground
      const platforms = entitiesRef.current.filter((e: any) => e.type === EntityType.PLATFORM);
      let onGround = false;

      for (const platform of platforms) {
        const collision = physics.checkCollision(
          { x: player.position.x, y: player.position.y, width: player.size.x, height: player.size.y },
          { x: platform.position.x, y: platform.position.y, width: platform.size.x, height: platform.size.y }
        );

        if (collision && player.position.y + player.size.y <= platform.position.y + 5) {
          onGround = true;
          break;
        }
      }

      if (onGround && Math.abs(player.physics.velocity.y) < 1) {
        player.physics.velocity.y = -player.jumpPower;
      }
    }

    // Apply physics
    physics.applyGravity(player.physics);

    // Update position
    let newPosition = physics.updatePosition(player.position, player.physics.velocity);
    let onGround = false;

    // Check collisions with platforms
    const platforms = entitiesRef.current.filter((e: any) => e.type === EntityType.PLATFORM);
    for (const platform of platforms) {
      const playerCollider = {
        x: newPosition.x,
        y: newPosition.y,
        width: player.size.x,
        height: player.size.y,
      };

      const platformCollider = {
        x: platform.position.x,
        y: platform.position.y,
        width: platform.size.x,
        height: platform.size.y,
      };

      if (physics.checkCollision(playerCollider, platformCollider)) {
        const resolved = physics.resolveCollision(
          newPosition,
          player.size,
          player.physics.velocity,
          platform.position,
          platform.size
        );

        newPosition = resolved.position;
        player.physics.velocity = resolved.velocity;
        onGround = onGround || resolved.onGround;
      }
    }

    physics.applyFriction(player.physics, onGround);
    player.position = newPosition;

    // Check collisions with collectibles
    entitiesRef.current.forEach((entity: any) => {
      if (entity.type === EntityType.COLLECTIBLE && !entity.collected) {
        if (
          physics.checkCollision(
            { x: player.position.x, y: player.position.y, width: player.size.x, height: player.size.y },
            { x: entity.position.x, y: entity.position.y, width: entity.size.x, height: entity.size.y }
          )
        ) {
          entity.collected = true;
          setScore((prev) => prev + entity.points);
        }
      }
    });

    // Check collision with enemies
    entitiesRef.current.forEach((entity: any) => {
      if (entity.type === EntityType.ENEMY) {
        if (
          physics.checkCollision(
            { x: player.position.x, y: player.position.y, width: player.size.x, height: player.size.y },
            { x: entity.position.x, y: entity.position.y, width: entity.size.x, height: entity.size.y }
          )
        ) {
          // Reset player position
          const spawnPoint = levelData.entities.find((e) => e.type === EntityType.SPAWN);
          if (spawnPoint) {
            player.position = { ...spawnPoint.position };
            player.physics.velocity = { x: 0, y: 0 };
            setLives((prev) => {
              const newLives = prev - 1;
              if (newLives <= 0) {
                setGameState('lost');
              }
              return newLives;
            });
          }
        }
      }
    });

    // Check collision with goal
    const goal = entitiesRef.current.find((e: any) => e.type === EntityType.GOAL);
    if (goal) {
      if (
        physics.checkCollision(
          { x: player.position.x, y: player.position.y, width: player.size.x, height: player.size.y },
          { x: goal.position.x, y: goal.position.y, width: goal.size.x, height: goal.size.y }
        )
      ) {
        setGameState('won');
      }
    }

    // Check if player fell off
    if (player.position.y > 1000) {
      const spawnPoint = levelData.entities.find((e) => e.type === EntityType.SPAWN);
      if (spawnPoint) {
        player.position = { ...spawnPoint.position };
        player.physics.velocity = { x: 0, y: 0 };
        setLives((prev) => {
          const newLives = prev - 1;
          if (newLives <= 0) {
            setGameState('lost');
          }
          return newLives;
        });
      }
    }

    // Update enemies
    entitiesRef.current.forEach((entity: any) => {
      if (entity.type === EntityType.ENEMY) {
        const enemy = entity;
        physics.applyGravity(enemy.physics);
        enemy.position = physics.updatePosition(enemy.position, enemy.physics.velocity);

        // Simple patrol behavior
        if (enemy.position.x < enemy.patrolStart - enemy.patrolRange) {
          enemy.physics.velocity.x = Math.abs(enemy.physics.velocity.x);
        } else if (enemy.position.x > enemy.patrolStart + enemy.patrolRange) {
          enemy.physics.velocity.x = -Math.abs(enemy.physics.velocity.x);
        }
      }
    });

    // Render
    renderer.clear(levelData.configuration.backgroundColor);
    renderer.renderEntities(entitiesRef.current);
    renderer.renderUI(score, lives, timeElapsed);

    if (gameState !== 'playing' && gameState !== 'paused') {
      renderer.renderGameOver(gameState === 'won', score);
    }

    // Update time
    setTimeElapsed((prev) => prev + deltaTime * 1000);

    // Continue loop
    if (gameState === 'playing') {
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    }
  }, [gameState, score, lives, timeElapsed, levelData]);

  // Start/stop game loop
  useEffect(() => {
    if (gameState === 'playing') {
      lastTimeRef.current = Date.now();
      animationFrameRef.current = requestAnimationFrame(gameLoop);
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState, gameLoop]);

  const handleStart = () => {
    setGameState('playing');
    setIsPlaying(true);
  };

  const handlePause = () => {
    setGameState('paused');
    setIsPlaying(false);
  };

  const handleReset = () => {
    setGameState('paused');
    setIsPlaying(false);
    setScore(0);
    setLives(levelData.configuration.playerLives);
    setTimeElapsed(0);

    // Reset player
    const spawnPoint = levelData.entities.find((e) => e.type === EntityType.SPAWN);
    if (spawnPoint && playerRef.current) {
      playerRef.current.position = { ...spawnPoint.position };
      playerRef.current.physics.velocity = { x: 0, y: 0 };
      playerRef.current.lives = levelData.configuration.playerLives;
    }

    // Reset entities
    entitiesRef.current = [
      playerRef.current,
      ...levelData.entities.filter((e) => e.type !== EntityType.SPAWN),
    ].filter(Boolean) as any[];

    // Clear collectibles
    entitiesRef.current.forEach((entity: any) => {
      if (entity.type === EntityType.COLLECTIBLE) {
        (entity as any).collected = false;
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {!isPlaying ? (
              <Button onClick={handleStart} variant="default" size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Start
              </Button>
            ) : (
              <Button onClick={handlePause} variant="outline" size="sm" className="gap-2">
                <Pause className="h-4 w-4" />
                Pause
              </Button>
            )}
            <Button onClick={handleReset} variant="outline" size="sm" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold">Score:</span> {score}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Lives:</span> {lives}
            </div>
            <div className="text-sm">
              <span className="font-semibold">Time:</span> {Math.floor(timeElapsed / 1000)}s
            </div>
          </div>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm" className="gap-2">
              <X className="h-4 w-4" />
              Close
            </Button>
          )}
        </div>
      </Card>

      {/* Game Canvas */}
      <Card className="flex-1 p-4 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={1200}
          height={600}
          className="border border-gray-300 rounded bg-white"
        />
      </Card>

      {/* Controls Info */}
      <Card className="p-4">
        <div className="text-sm text-muted-foreground">
          <p><strong>Controls:</strong> Arrow Keys or WASD to move, Space/Up to jump</p>
          <p><strong>Objective:</strong> Collect coins, avoid enemies, reach the goal flag!</p>
        </div>
      </Card>
    </div>
  );
}
