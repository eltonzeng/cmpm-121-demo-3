import leaflet from "leaflet";
import "./leafletWorkaround.ts";
import luck from "./luck.ts";
import CoinFactory, { Coin } from "./flyweightCoin.ts";
import GameStateManager from "./memento.ts";
import { NotificationSystem, Observer, Subject } from "./observer.ts";

const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);
const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
const NEIGHBORHOOD_SIZE = 8;
const CACHE_SPAWN_PROBABILITY = 0.1;

interface Cell {
  i: number;
  j: number;
}

interface Cache {
  cell: Cell;
  coins: Coin[];
}

// Subject Implementation
class GameEventManager implements Subject {
  private observers: Observer[] = [];

  addObserver(observer: Observer): void {
    this.observers.push(observer);
  }

  removeObserver(observer: Observer): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(event: string, message: string): void {
    for (const observer of this.observers) {
      observer.update(event, message);
    }
  }
}

// Initialize the map
const map = leaflet.map(document.getElementById("app")!, {
  center: OAKES_CLASSROOM,
  zoom: GAMEPLAY_ZOOM_LEVEL,
  minZoom: GAMEPLAY_ZOOM_LEVEL,
  maxZoom: GAMEPLAY_ZOOM_LEVEL,
  zoomControl: false,
  scrollWheelZoom: false,
});

leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

const playerMarker = leaflet.marker(OAKES_CLASSROOM).addTo(map);
playerMarker.bindTooltip("Player");

// Game State Variables
let playerInventory: Coin[] = [];
let caches: { [key: string]: Coin[] } = {};
const gameStateManager = new GameStateManager();
const gameEventManager = new GameEventManager();
const notificationSystem = new NotificationSystem();

// Register the notification observer
gameEventManager.addObserver(notificationSystem);

// Helper function to generate unique coin IDs
function generateCoinId(cell: Cell, index: number): string {
  return `${cell.i}:${cell.j}#${index}`;
}

// Function to spawn a cache with random coins
function spawnCache(cell: Cell): Cache {
  const coinTypes = ["gold", "silver", "bronze"];
  const coins: Coin[] = Array.from({ length: 3 }, (_, index) => {
    const type = coinTypes[Math.floor(Math.random() * coinTypes.length)];
    return {
      id: generateCoinId(cell, index + 1),
      cell,
      flyweight: CoinFactory.getFlyweight(type),
    };
  });

  const cache: Cache = { cell, coins };
  caches[`${cell.i},${cell.j}`] = coins;

  const cacheMarker = leaflet.marker([
    OAKES_CLASSROOM.lat + cell.i * TILE_DEGREES,
    OAKES_CLASSROOM.lng + cell.j * TILE_DEGREES,
  ]).addTo(map);

  cacheMarker.bindPopup(createCachePopup(cache));
  return cache;
}

// Function to create the popup content for a cache
function createCachePopup(cache: Cache) {
  const popupDiv = document.createElement("div");
  popupDiv.innerHTML =
    `<h4>Cache ${cache.cell.i}:${cache.cell.j}</h4><ul id="cacheList"></ul>`;

  const cacheList = popupDiv.querySelector("#cacheList")!;
  cache.coins.forEach((coin) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${coin.flyweight.type} (Value: ${coin.flyweight.value}) <button class="collect-btn">Collect</button>
    `;
    listItem.querySelector("button")?.addEventListener(
      "click",
      () => collectCoin(coin, cache),
    );
    cacheList.appendChild(listItem);
  });

  return popupDiv;
}

// Function to collect a coin from a cache
function collectCoin(coin: Coin, cache: Cache) {
  playerInventory.push(coin);
  cache.coins = cache.coins.filter((c) => c.id !== coin.id);
  caches[`${cache.cell.i},${cache.cell.j}`] = cache.coins;
  gameEventManager.notifyObservers(
    "Coin Collected",
    `You collected a ${coin.flyweight.type} coin!`,
  );
}

// Function to save the game state
function saveGameState() {
  gameStateManager.saveState(playerInventory, caches);
  gameEventManager.notifyObservers(
    "Game Saved",
    "Your game state has been saved.",
  );
}

// Function to load the game state
function loadGameState() {
  const loadedState = gameStateManager.loadState();
  if (loadedState) {
    playerInventory = loadedState.playerInventory;
    caches = loadedState.caches;
    gameEventManager.notifyObservers(
      "Game Loaded",
      "Game state loaded successfully!",
    );

    // Clear existing markers and re-render caches
    map.eachLayer((layer: leaflet.Layer) => {
      if (layer instanceof leaflet.Marker && layer !== playerMarker) {
        map.removeLayer(layer);
      }
    });

    for (const key in caches) {
      const [i, j] = key.split(",").map(Number);
      spawnCache({ i, j });
    }
  }
}

// Function to reset the game state
function resetGameState() {
  playerInventory = [];
  caches = {};
  gameStateManager.reset();
  gameEventManager.notifyObservers("Game Reset", "Game state has been reset.");
}

// Game initialization with cache spawns
for (let i = -NEIGHBORHOOD_SIZE; i <= NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j <= NEIGHBORHOOD_SIZE; j++) {
    if (luck(`${i},${j}`) < CACHE_SPAWN_PROBABILITY) {
      spawnCache({ i, j });
    }
  }
}

// Add Save, Load, and Reset buttons
const saveButton = document.createElement("button");
saveButton.textContent = "Save Game";
saveButton.onclick = saveGameState;
document.body.appendChild(saveButton);

const loadButton = document.createElement("button");
loadButton.textContent = "Load Game";
loadButton.onclick = loadGameState;
document.body.appendChild(loadButton);

const resetButton = document.createElement("button");
resetButton.textContent = "Reset Game";
resetButton.onclick = resetGameState;
document.body.appendChild(resetButton);
