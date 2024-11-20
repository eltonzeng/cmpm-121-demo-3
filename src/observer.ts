// Observer Interface
export interface Observer {
  update(event: string, message: string): void;
}

// Subject Interface
export interface Subject {
  addObserver(observer: Observer): void;
  removeObserver(observer: Observer): void;
  notifyObservers(event: string, message: string): void;
}

// Concrete Observer (for notifications)
export class NotificationSystem implements Observer {
  update(event: string, message: string): void {
    console.log(`[Notification] ${event}: ${message}`);
    alert(`[Notification] ${event}: ${message}`);
  }
}

// Concrete Subject (Game Event Manager)
export class GameEventManager implements Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    const index = this.observers.indexOf(observer);
    if (index > -1) {
      this.observers.splice(index, 1);
    }
  }

  notifyObservers(event: string, message: string): void {
    this.observers.forEach((observer) => observer.update(event, message));
  }

  // New method to handle player movement
  notifyPlayerMoved(position: { lat: number; lng: number }): void {
    this.notifyObservers(
      "Player Moved",
      `New Position: (${position.lat}, ${position.lng})`,
    );
  }

  // New method to handle cache updates
  notifyCacheUpdated(): void {
    this.notifyObservers(
      "Cache Updated",
      "Nearby caches have been regenerated.",
    );
  }
}
