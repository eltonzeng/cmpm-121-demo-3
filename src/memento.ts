import { Coin, FlyweightCoin } from "./flyweightCoin.ts";

interface GameStateSnapshot {
  playerInventory: Coin[];
  caches: { [key: string]: Coin[] };
}

// Memento Interface
export interface Memento {
  getState(): GameStateSnapshot;
}

// Concrete Memento
class GameState implements Memento {
  private state: GameStateSnapshot;

  constructor(inventory: Coin[], caches: { [key: string]: Coin[] }) {
    // Deep clone to avoid reference issues
    this.state = {
      playerInventory: JSON.parse(JSON.stringify(inventory)),
      caches: JSON.parse(JSON.stringify(caches)),
    };
  }

  getState(): GameStateSnapshot {
    return this.state;
  }
}

// Game State Manager
class GameStateManager {
  private mementos: Memento[] = [];

  saveState(playerInventory: Coin[], caches: { [key: string]: Coin[] }) {
    const snapshot = new GameState(playerInventory, caches);
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
}

export default GameStateManager;
