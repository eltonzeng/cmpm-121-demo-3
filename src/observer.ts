// Observer Interface
export interface Observer {
    update(data: any): void;
  }
  
  // Subject (Observable)
  export class Subject {
    private observers: Observer[] = [];
  
    addObserver(observer: Observer): void {
      this.observers.push(observer);
    }
  
    removeObserver(observer: Observer): void {
      this.observers = this.observers.filter((obs) => obs !== observer);
    }
  
    notifyObservers(data: any): void {
      for (const observer of this.observers) {
        observer.update(data);
      }
    }
  }
  