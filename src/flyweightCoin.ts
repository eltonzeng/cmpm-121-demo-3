export class Coin {
  private id: string;

  constructor(private cacheId: string, private serial: number) {
    this.id = `${cacheId}#${serial}`;
  }

  getId(): string {
    return this.id;
  }

  getCacheId(): string {
    return this.cacheId;
  }

  getSerial(): number {
    return this.serial;
  }
}

// Coin Factory (Flyweight)
export class CoinFactory {
  private coinPool: { [key: string]: Coin } = {};

  createCoin(cacheId: string, serial: number): Coin {
    const key = `${cacheId}#${serial}`;
    if (!this.coinPool[key]) {
      this.coinPool[key] = new Coin(cacheId, serial);
    }
    return this.coinPool[key];
  }
}
