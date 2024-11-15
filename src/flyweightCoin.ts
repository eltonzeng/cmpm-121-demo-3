export interface CoinData {
    i: number;
    j: number;
    serial: number;
  }
  
  export class Coin implements CoinData {
    i: number;
    j: number;
    serial: number;
  
    constructor(i: number, j: number, serial: number) {
      this.i = i;
      this.j = j;
      this.serial = serial;
    }
  
    toString(): string {
      return `${this.i}:${this.j}#${this.serial}`;
    }
  }
  
  // Flyweight Factory for Coins
  export class CoinFactory {
    private coins: { [key: string]: Coin } = {};
  
    getCoin(i: number, j: number, serial: number): Coin {
      const key = `${i}:${j}#${serial}`;
      if (!this.coins[key]) {
        this.coins[key] = new Coin(i, j, serial);
      }
      return this.coins[key];
    }
  }
  
  export const coinFactory = new CoinFactory();
  