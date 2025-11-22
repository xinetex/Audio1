/**
 * ThunderEngine Input
 * Keyboard and input management
 */

import { InputState, Direction } from './types.js';

export class InputManager {
  private inputState: InputState = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
  };

  private keyMap: Map<string, keyof InputState> = new Map([
    ['ArrowUp', 'up'],
    ['KeyW', 'up'],
    ['ArrowDown', 'down'],
    ['KeyS', 'down'],
    ['ArrowLeft', 'left'],
    ['KeyA', 'left'],
    ['ArrowRight', 'right'],
    ['KeyD', 'right'],
    ['Space', 'space']
  ]);

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    window.addEventListener('keydown', this.handleKeyDown.bind(this));
    window.addEventListener('keyup', this.handleKeyUp.bind(this));
  }

  private handleKeyDown(event: KeyboardEvent): void {
    const key = this.keyMap.get(event.code);
    if (key) {
      this.inputState[key] = true;
      event.preventDefault();
    }
  }

  private handleKeyUp(event: KeyboardEvent): void {
    const key = this.keyMap.get(event.code);
    if (key) {
      this.inputState[key] = false;
      event.preventDefault();
    }
  }

  getInputState(): InputState {
    return { ...this.inputState };
  }

  getDirection(): Direction {
    if (this.inputState.up) return Direction.UP;
    if (this.inputState.down) return Direction.DOWN;
    if (this.inputState.left) return Direction.LEFT;
    if (this.inputState.right) return Direction.RIGHT;
    return Direction.NONE;
  }

  isActionPressed(): boolean {
    return this.inputState.space;
  }

  reset(): void {
    this.inputState = {
      up: false,
      down: false,
      left: false,
      right: false,
      space: false
    };
  }

  destroy(): void {
    window.removeEventListener('keydown', this.handleKeyDown.bind(this));
    window.removeEventListener('keyup', this.handleKeyUp.bind(this));
  }
}
