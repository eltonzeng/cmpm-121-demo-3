import { Coin } from './flyweightCoin.ts';

export interface GameStateSnapshot {
  playerPosition: { lat: number; lng: number };
  playerPositionHistory: { lat: number; lng: number }[]; // Added history
  caches: { [key: string]: Coin[] };
}

export interface Memento {
  getState(): GameStateSnapshot;
}

class GameState implements Memento {
  private state: GameStateSnapshot;

  constructor(
    playerPosition: { lat: number; lng: number },
    playerPositionHistory: { lat: number; lng: number }[], // Track movement
    caches: { [key: string]: Coin[] }
  ) {
    this.state = {
      playerPosition: { ...playerPosition },
      playerPositionHistory: [...playerPositionHistory], // Copy history
      caches: JSON.parse(JSON.stringify(caches)),
    };
  }

  getState(): GameStateSnapshot {
    return this.state;
  }
}

export class GameStateManager {
  private mementos: Memento[] = [];

  saveState(
    playerPosition: { lat: number; lng: number },
    playerPositionHistory: { lat: number; lng: number }[], // Updated
    caches: { [key: string]: Coin[] }
  ) {
    const snapshot = new GameState(playerPosition, playerPositionHistory, caches);
    this.mementos.push(snapshot);
    console.log(`Game state saved. Total saves: ${this.mementos.length}`);
  }

  loadState(): GameStateSnapshot | null {
    if (this.mementos.length === 0) {
      console.log("No saved states available.");
      return null;
    }
    const latestSnapshot = this.mementos.pop()!;
    console.log("Game state loaded.");
    return latestSnapshot.getState();
  }

  reset() {
    this.mementos = [];
    console.log("All game states have been reset.");
  }
}
