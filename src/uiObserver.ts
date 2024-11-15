import { Observer } from "./observer.ts";
import { Coin } from "./flyweightCoin.ts";

// UI Observer to update the player inventory display
export class UIObserver implements Observer {
  private inventoryElement: HTMLElement;

  constructor(elementId: string) {
    this.inventoryElement = document.getElementById(elementId)!;
  }

  update(data: any): void {
    if (data.type === "inventory") {
      this.renderInventory(data.data);
    }
  }

  renderInventory(inventory: Coin[]) {
    this.inventoryElement.innerHTML = `<h3>Player Inventory</h3><ul>`;
    inventory.forEach((coin) => {
      this.inventoryElement.innerHTML += `<li>${coin.flyweight.type} (Value: ${coin.flyweight.value})</li>`;
    });
    this.inventoryElement.innerHTML += `</ul>`;
  }
}
