import { Coin } from "./flyweightCoin.ts";

interface GameStateSnapshot {
  playerInventory: Coin[];
  caches: { [key: string]: Coin[] };
}

export interface Memento {
  getState(): GameStateSnapshot;
}

class GameState implements Memento {
  private state: GameStateSnapshot;

  constructor(inventory: Coin[], caches: { [key: string]: Coin[] }) {
    this.state = {
      playerInventory: JSON.parse(JSON.stringify(inventory)),
      caches: JSON.parse(JSON.stringify(caches)),
    };
  }

  getState(): GameStateSnapshot {
    return this.state;
  }
}

export class GameStateManager {
  private mementos: Memento[] = [];

  saveState(playerInventory: Coin[], caches: { [key: string]: Coin[] }) {
    const snapshot = new GameState(playerInventory, caches);
    this.mementos.push(snapshot);
  }

  loadState(): GameStateSnapshot | null {
    if (this.mementos.length === 0) return null;
    return this.mementos.pop()!.getState();
  }
}

export default GameStateManager;
