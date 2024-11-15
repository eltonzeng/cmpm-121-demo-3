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
