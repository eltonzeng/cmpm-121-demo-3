import leaflet from "leaflet";
import { Coin, CoinFactory } from "./flyweightCoin.ts";
import { GameStateManager } from "./memento.ts";
import { GameEventManager, NotificationSystem } from "./observer.ts";

// Initialize game managers
const gameStateManager = new GameStateManager();
const gameEventManager = new GameEventManager();

// Observer system
const notificationSystem = new NotificationSystem();
gameEventManager.addObserver(notificationSystem);

// Player's virtual position (latitude, longitude)
let playerPosition = { lat: 0.0, lng: 0.0 };

// Cache and inventory
let caches: { [key: string]: Coin[] } = {};
const playerInventory: Coin[] = [];

// Leaflet map setup
const map = leaflet.map("map").setView([0, 0], 16);
leaflet.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 18,
}).addTo(map);

// Player marker
const playerMarker = leaflet.marker([playerPosition.lat, playerPosition.lng], {
  title: "You",
}).addTo(map);

// Coin factory
const coinFactory = new CoinFactory();

// Display player's inventory
const inventoryPanel = document.getElementById("statusPanel")!;
function updateInventoryDisplay() {
  inventoryPanel.innerHTML = `
    <strong>Player Inventory:</strong> ${playerInventory.length} coins
  `;
}
updateInventoryDisplay();

// Function to update the player's marker
function updatePlayerMarker() {
  playerMarker.setLatLng([playerPosition.lat, playerPosition.lng]).bindTooltip(
    `Player Position:<br>Lat: ${playerPosition.lat.toFixed(4)}<br>Lng: ${playerPosition.lng.toFixed(4)}`
  ).openTooltip();
}

// Function to generate caches with coins dynamically
function generateCaches(centerLat: number, centerLng: number) {
  const newCaches: { [key: string]: Coin[] } = {};
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      const lat = parseFloat((centerLat + i * 0.0001).toFixed(4));
      const lng = parseFloat((centerLng + j * 0.0001).toFixed(4));
      const cacheId = `${lat}:${lng}`;
      if (!newCaches[cacheId]) {
        newCaches[cacheId] = [];
        for (let k = 0; k < 3; k++) {
          newCaches[cacheId].push(coinFactory.createCoin(cacheId, k));
        }
      }
    }
  }
  return newCaches;
}

// Function to regenerate caches and display them
function regenerateVisibleCaches() {
  map.eachLayer((layer: leaflet.Layer) => {
    if (layer instanceof leaflet.Marker && layer !== playerMarker) {
      map.removeLayer(layer);
    }
  });

  Object.keys(caches).forEach((key) => {
    const [lat, lng] = key.split(":").map(Number);
    if (Math.abs(playerPosition.lat - lat) < 0.1 && Math.abs(playerPosition.lng - lng) < 0.1) {
      const coins = caches[key];
      const marker = leaflet.marker([lat, lng]);
      const popupContent = `
        <strong>Cache (${lat.toFixed(4)}, ${lng.toFixed(4)})</strong><br>
        Coins: ${coins.length}<br>
        <button onclick="window.collectCoin('${key}')">Collect</button>
        <button onclick="window.depositCoin('${key}')">Deposit</button>
      `;
      marker.bindPopup(popupContent);
      marker.addTo(map);
    }
  });
}

// Add functions to the global `window` object
declare global {
  interface GlobalThis {
    collectCoin: (cacheKey: string) => void;
    depositCoin: (cacheKey: string) => void;
  }
}

globalThis.collectCoin = (cacheKey: string) => {
  const cacheCoins = caches[cacheKey];
  if (cacheCoins && cacheCoins.length > 0) {
    const collectedCoin = cacheCoins.pop();
    if (collectedCoin) {
      playerInventory.push(collectedCoin);
      gameEventManager.notifyObservers("Coin Collected", `Collected a coin from cache ${cacheKey}`);
      regenerateVisibleCaches();
      updateInventoryDisplay();
    }
  } else {
    alert("No coins available to collect!");
  }
};

globalThis.depositCoin = (cacheKey: string) => {
  if (playerInventory.length > 0) {
    const depositedCoin = playerInventory.pop();
    if (depositedCoin) {
      if (!caches[cacheKey]) {
        caches[cacheKey] = [];
      }
      caches[cacheKey].push(depositedCoin);
      gameEventManager.notifyObservers("Coin Deposited", `Deposited a coin into cache ${cacheKey}`);
      regenerateVisibleCaches();
      updateInventoryDisplay();
    }
  } else {
    alert("No coins available in inventory!");
  }
};

// Function to move the player and update the map
function movePlayer(latDelta: number, lngDelta: number) {
  playerPosition.lat += latDelta;
  playerPosition.lng += lngDelta;
  caches = { ...caches, ...generateCaches(playerPosition.lat, playerPosition.lng) };
  updatePlayerMarker();
  regenerateVisibleCaches();
  gameEventManager.notifyObservers("Player Moved", `Moved to (${playerPosition.lat.toFixed(4)}, ${playerPosition.lng.toFixed(4)})`);
}

// Button controls
document.getElementById("north")?.addEventListener("click", () => movePlayer(0.0001, 0));
document.getElementById("south")?.addEventListener("click", () => movePlayer(-0.0001, 0));
document.getElementById("east")?.addEventListener("click", () => movePlayer(0, 0.0001));
document.getElementById("west")?.addEventListener("click", () => movePlayer(0, -0.0001));
document.getElementById("reset")?.addEventListener("click", () => {
  const loadedState = gameStateManager.loadState();
  if (loadedState) {
    playerPosition = loadedState.playerPosition;
    caches = loadedState.caches;
    regenerateVisibleCaches();
    updateInventoryDisplay();
  } else {
    alert("No saved state to load!");
  }
});

// Initialize game
function initializeGame() {
  caches = generateCaches(playerPosition.lat, playerPosition.lng);
  regenerateVisibleCaches();
}
initializeGame();
