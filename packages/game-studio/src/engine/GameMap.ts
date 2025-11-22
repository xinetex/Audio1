import type { GameMap as IGameMap, TileType, Vector2D } from './types';

export class GameMap implements IGameMap {
  width: number;
  height: number;
  tiles: TileType[][];

  constructor(width: number, height: number, initialTiles?: TileType[][]) {
    this.width = width;
    this.height = height;
    
    if (initialTiles) {
      this.tiles = initialTiles;
    } else {
      // Initialize empty map
      this.tiles = Array.from({ length: height }, () =>
        Array(width).fill('empty') as TileType[]
      );
    }
  }

  getTile(x: number, y: number): TileType {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      return 'wall';
    }
    return this.tiles[y][x];
  }

  setTile(x: number, y: number, type: TileType): void {
    if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
      this.tiles[y][x] = type;
    }
  }

  isWalkable(x: number, y: number): boolean {
    const tile = this.getTile(Math.floor(x), Math.floor(y));
    return tile !== 'wall';
  }

  // Convert from numeric map format
  static fromNumericMap(numericMap: number[][]): GameMap {
    const height = numericMap.length;
    const width = numericMap[0]?.length || 0;
    
    const tiles: TileType[][] = numericMap.map(row =>
      row.map(num => {
        switch (num) {
          case 0: return 'wall';
          case 1: return 'pill';
          case 2: return 'empty';
          case 3: return 'power-pill';
          case 4: return 'spawn-player';
          case 5: return 'spawn-ghost';
          default: return 'empty';
        }
      })
    );

    return new GameMap(width, height, tiles);
  }

  // Get all spawn positions
  getSpawnPositions(type: 'spawn-player' | 'spawn-ghost'): Vector2D[] {
    const positions: Vector2D[] = [];
    
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === type) {
          positions.push({ x, y });
        }
      }
    }
    
    return positions;
  }

  // Count pills remaining
  countPills(): number {
    let count = 0;
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.tiles[y][x] === 'pill' || this.tiles[y][x] === 'power-pill') {
          count++;
        }
      }
    }
    return count;
  }

  // Clone the map
  clone(): GameMap {
    const clonedTiles = this.tiles.map(row => [...row]);
    return new GameMap(this.width, this.height, clonedTiles);
  }
}
