export * from './types.js';
export * from './engine.js';
export * from './physics.js';
export * from './input.js';
export * from './pacman.js';

// Simple bootstrapper for exported HTML usage
export function bootstrapPacman(canvas: HTMLCanvasElement, options?: Partial<{ gridSize: number; background: string; fps: number }>) {
  const { PacManGame } = require('./pacman.js');
  const gridSize = options?.gridSize ?? 32;
  const background = options?.background ?? '#111';
  const fps = options?.fps ?? 60;
  const game = new PacManGame({ canvas, gridSize, width: canvas.width, height: canvas.height, background, fps });
  game.start();
  return game;
}
