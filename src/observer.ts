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

// Concrete Subject (Game Event Manager)
export class GameEventManager implements Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(event: string, message: string): void {
    this.observers.forEach((observer) => observer.update(event, message));
  }
}

// Concrete Observer (for notifications)
export class NotificationSystem implements Observer {
  update(event: string, message: string): void {
    console.log(`[Notification] ${event}: ${message}`);
    alert(`[Notification] ${event}: ${message}`);
  }
}
