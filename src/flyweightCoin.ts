// Flyweight Coin Interface
export interface FlyweightCoin {
  type: string; // e.g., "gold", "silver", "bronze"
  value: number; // e.g., 1, 5, 10 points
}

// Coin Class with Extrinsic Data
export interface Coin {
  id: string;
  cell: { i: number; j: number };
  flyweight: FlyweightCoin;
}

// Coin Factory for Flyweight Pattern
class CoinFactory {
  private static flyweights: Map<string, FlyweightCoin> = new Map();

  static getFlyweight(type: string): FlyweightCoin {
    if (!this.flyweights.has(type)) {
      const flyweightCoin: FlyweightCoin = this.createFlyweight(type);
      this.flyweights.set(type, flyweightCoin);
    }
    return this.flyweights.get(type)!;
  }

  private static createFlyweight(type: string): FlyweightCoin {
    switch (type) {
      case "gold":
        return { type: "gold", value: 10 };
      case "silver":
        return { type: "silver", value: 5 };
      case "bronze":
      default:
        return { type: "bronze", value: 1 };
    }
  }

  static getFlyweightCount(): number {
    return this.flyweights.size;
  }
}

export default CoinFactory;
