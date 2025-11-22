import { Application, Container, Graphics } from 'pixi.js';
import { GameMap } from './GameMap';
import { Player } from './Player';
import { Ghost, GhostPersonality } from './Ghost';
import type { GameConfig, GameState, GameLevel, SpriteAsset, Entity } from './types';

export class GameEngine {
  private app: Application;
  private gameMap: GameMap;
  private player?: Player;
  private ghosts: Ghost[] = [];
  private config: GameConfig;
  private state: GameState;
  private running: boolean = false;
  private lastTime: number = 0;
  private gameContainer: Container;
  private mapContainer: Container;
  private entityContainer: Container;
  private onScoreChange?: (score: number) => void;
  private onGameOver?: () => void;
  private onVictory?: () => void;

  constructor(canvas: HTMLCanvasElement, config: GameConfig) {
    this.config = config;
    
    // Initialize PixiJS v8 Application
    this.app = new Application();
    
    // Create containers for layering
    this.gameContainer = new Container();
    this.mapContainer = new Container();
    this.entityContainer = new Container();
    
    this.gameContainer.addChild(this.mapContainer);
    this.gameContainer.addChild(this.entityContainer);
    
    // Async init for PixiJS v8
    this.app.init({
      canvas: canvas,
      width: config.width,
      height: config.height,
      background: '#000000',
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    }).then(() => {
      this.app.stage.addChild(this.gameContainer);
    });

    // Initialize game state
    this.state = {
      score: 0,
      lives: 3,
      level: 1,
      status: 'idle',
      pillsRemaining: 0,
      powerUpActive: false,
      powerUpTimer: 0,
    };

    // Initialize with empty map
    this.gameMap = new GameMap(
      Math.floor(config.width / config.tileSize),
      Math.floor(config.height / config.tileSize)
    );
  }

  loadLevel(level: GameLevel): void {
    // Clear existing entities
    this.player = undefined;
    this.ghosts = [];
    this.entityContainer.removeChildren();
    this.mapContainer.removeChildren();

    // Load map
    this.gameMap = GameMap.fromNumericMap(level.map);
    this.state.pillsRemaining = this.gameMap.countPills();

    // Render map
    this.renderMap();

    // Create player
    const playerSpawn = level.playerSpawn;
    const playerSprite = level.sprites['player'] || this.getDefaultSprite('player');
    this.player = new Player('player', playerSpawn, playerSprite);

    // Create ghosts
    const personalities: GhostPersonality[] = ['chaser', 'ambusher', 'patrol', 'random'];
    level.ghostSpawns.forEach((spawn, index) => {
      const ghostSprite = level.sprites[`ghost${index}`] || this.getDefaultSprite('ghost');
      const ghost = new Ghost(
        `ghost${index}`,
        spawn,
        ghostSprite,
        personalities[index % personalities.length]
      );
      if (this.player) {
        ghost.setTarget(this.player);
      }
      this.ghosts.push(ghost);
    });

    this.state.status = 'idle';
  }

  private renderMap(): void {
    const { tileSize } = this.config;
    
    for (let y = 0; y < this.gameMap.height; y++) {
      for (let x = 0; x < this.gameMap.width; x++) {
        const tile = this.gameMap.getTile(x, y);
        const sprite = this.createTileSprite(tile, x, y, tileSize);
        if (sprite) {
          this.mapContainer.addChild(sprite);
        }
      }
    }
  }

  private createTileSprite(
    tile: string,
    x: number,
    y: number,
    tileSize: number
  ): Graphics | null {
    const graphics = new Graphics();
    
    switch (tile) {
      case 'wall':
        graphics.rect(x * tileSize, y * tileSize, tileSize, tileSize);
        graphics.fill(0x2222FF);
        break;
      
      case 'pill':
        graphics.circle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          3
        );
        graphics.fill(0xFFFFFF);
        break;
      
      case 'power-pill':
        graphics.circle(
          x * tileSize + tileSize / 2,
          y * tileSize + tileSize / 2,
          6
        );
        graphics.fill(0xFFFF00);
        break;
      
      default:
        return null;
    }
    
    return graphics;
  }

  start(): void {
    if (!this.player) {
      console.error('No level loaded');
      return;
    }

    this.state.status = 'playing';
    this.running = true;
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  pause(): void {
    this.running = false;
    this.state.status = 'paused';
  }

  resume(): void {
    this.running = true;
    this.state.status = 'playing';
    this.lastTime = performance.now();
    this.gameLoop(this.lastTime);
  }

  private gameLoop(currentTime: number): void {
    if (!this.running) return;

    const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    requestAnimationFrame((time) => this.gameLoop(time));
  }

  private update(deltaTime: number): void {
    if (this.state.status !== 'playing' || !this.player) return;

    // Update player
    this.player.update(deltaTime, this.gameMap);

    // Update ghosts
    this.ghosts.forEach(ghost => ghost.update(deltaTime, this.gameMap));

    // Check collisions
    this.checkCollisions();

    // Check pills
    const pillsRemaining = this.gameMap.countPills();
    if (pillsRemaining < this.state.pillsRemaining) {
      this.state.score += 10;
      this.state.pillsRemaining = pillsRemaining;
      if (this.onScoreChange) {
        this.onScoreChange(this.state.score);
      }
    }

    // Check victory
    if (pillsRemaining === 0) {
      this.state.status = 'victory';
      this.running = false;
      if (this.onVictory) {
        this.onVictory();
      }
    }

    // Update power-up timer
    if (this.state.powerUpActive) {
      this.state.powerUpTimer -= deltaTime;
      if (this.state.powerUpTimer <= 0) {
        this.state.powerUpActive = false;
      }
    }
  }

  private checkCollisions(): void {
    if (!this.player) return;

    const playerTileX = Math.floor(this.player.position.x);
    const playerTileY = Math.floor(this.player.position.y);

    // Check power pill
    if (this.gameMap.getTile(playerTileX, playerTileY) === 'power-pill') {
      this.state.powerUpActive = true;
      this.state.powerUpTimer = 7;
      this.ghosts.forEach(ghost => ghost.setFrightened(7));
    }

    // Check ghost collisions
    this.ghosts.forEach(ghost => {
      const dx = ghost.position.x - this.player!.position.x;
      const dy = ghost.position.y - this.player!.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 0.5) {
        if (ghost.isFrightened()) {
          // Eat ghost
          ghost.kill();
          this.state.score += 200;
          if (this.onScoreChange) {
            this.onScoreChange(this.state.score);
          }
        } else {
          // Player dies
          this.state.lives--;
          if (this.state.lives <= 0) {
            this.state.status = 'game-over';
            this.running = false;
            if (this.onGameOver) {
              this.onGameOver();
            }
          } else {
            this.resetPositions();
          }
        }
      }
    });
  }

  private resetPositions(): void {
    // TODO: Reset player and ghost positions
  }

  private render(): void {
    // Render is handled by PixiJS automatically
    // Just need to update sprite positions
    if (this.player && this.player.pixiSprite) {
      this.player.updatePixiPosition(this.config.tileSize);
    }

    this.ghosts.forEach(ghost => {
      if (ghost.pixiSprite) {
        ghost.updatePixiPosition(this.config.tileSize);
      }
    });

    // Re-render map to update pills
    this.mapContainer.removeChildren();
    this.renderMap();
  }

  handleInput(key: string): void {
    if (!this.player) return;

    switch (key) {
      case 'ArrowUp':
      case 'w':
        this.player.setDirection({ x: 0, y: -1 });
        break;
      case 'ArrowDown':
      case 's':
        this.player.setDirection({ x: 0, y: 1 });
        break;
      case 'ArrowLeft':
      case 'a':
        this.player.setDirection({ x: -1, y: 0 });
        break;
      case 'ArrowRight':
      case 'd':
        this.player.setDirection({ x: 1, y: 0 });
        break;
    }
  }

  getState(): GameState {
    return { ...this.state };
  }

  onScore(callback: (score: number) => void): void {
    this.onScoreChange = callback;
  }

  onGameOverCallback(callback: () => void): void {
    this.onGameOver = callback;
  }

  onVictoryCallback(callback: () => void): void {
    this.onVictory = callback;
  }

  private getDefaultSprite(type: string): SpriteAsset {
    return {
      id: type,
      name: type,
      url: '',
      type: type as any,
    };
  }

  destroy(): void {
    this.running = false;
    this.app.destroy(true, { children: true });
  }
}
