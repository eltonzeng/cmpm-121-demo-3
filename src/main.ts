import L from "leaflet";
import "leaflet/dist/leaflet.css";
import luck from "./luck.ts";
import { Coin, CoinFactory } from "./flyweightCoin.ts";
import { GameStateManager } from "./memento.ts";

// Constants
const INITIAL_POSITION = { lat: 36.9895, lng: -122.0628 };
const CELL_SIZE = 0.0001;
const CACHE_RADIUS = 8;
const CACHE_PROBABILITY = 0.1;

// Leaflet Map Setup
const map = L.map("map").setView(INITIAL_POSITION, 17);
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);

// Game State
const stateManager = new GameStateManager();
let playerPosition = { ...INITIAL_POSITION };
let caches: { [key: string]: Coin[] } = {};
let movementHistory: L.Polyline | null = null;
const coinFactory = new CoinFactory();
const playerPositionHistory: { lat: number; lng: number }[] = [];

class PlayerMovementFacade {
  constructor(
    private playerPosition: { lat: number; lng: number },
    private playerPositionHistory: { lat: number; lng: number }[]
  ) {}

  move(direction: "north" | "south" | "east" | "west", step: number) {
    switch (direction) {
      case "north":
        this.playerPosition.lat += step;
        break;
      case "south":
        this.playerPosition.lat -= step;
        break;
      case "east":
        this.playerPosition.lng += step;
        break;
      case "west":
        this.playerPosition.lng -= step;
        break;
    }
    this.playerPositionHistory.push({ ...this.playerPosition });
  }
}

const playerMovement = new PlayerMovementFacade(playerPosition, playerPositionHistory);

function movePlayer(direction: "north" | "south" | "east" | "west") {
  playerMovement.move(direction, CELL_SIZE);
  stateManager.saveState(playerPosition, playerPositionHistory, caches);
  updateMap();
}

// Helper Functions
function cellToLatLng(i: number, j: number) {
  return {
    lat: INITIAL_POSITION.lat + i * CELL_SIZE,
    lng: INITIAL_POSITION.lng + j * CELL_SIZE,
  };
}

function generateCachesAroundPlayer() {
  caches = {};
  for (let i = -CACHE_RADIUS; i <= CACHE_RADIUS; i++) {
    for (let j = -CACHE_RADIUS; j <= CACHE_RADIUS; j++) {
      if (luck(`cache:${i}:${j}`) < CACHE_PROBABILITY) {
        const cacheId = `${i}:${j}`;
        caches[cacheId] = [
          coinFactory.createCoin(cacheId, 0),
          coinFactory.createCoin(cacheId, 1),
        ];
      }
    }
  }
}

function updateMap() {
  // Clear existing markers and polylines
  map.eachLayer((layer: L.Layer) => {
    if (layer instanceof L.Marker || layer instanceof L.Polyline) {
      map.removeLayer(layer);
    }
  });

  // Add player marker
  L.marker(playerPosition).addTo(map).bindTooltip("Player");

  // Add polyline for movement history
  if (playerPositionHistory.length > 1) {
    const latLngs = playerPositionHistory.map((pos) => [pos.lat, pos.lng]);
    movementHistory = L.polyline(latLngs, { color: "blue" }).addTo(map);
  }

  // Add cache markers
  Object.keys(caches).forEach((cacheId) => {
    const [i, j] = cacheId.split(":").map(Number);
    const position = cellToLatLng(i, j);
    const cacheCoins = caches[cacheId];
    const marker = L.marker(position).addTo(map);
    marker.bindPopup(
      `<b>Cache ${cacheId}</b><br>Inventory:<ul>${cacheCoins
        .map(
          (coin) =>
            `<li>${coin.getId()} <button onclick="collect('${coin.getId()}')">Collect</button></li>`
        )
        .join("")}</ul>`
    );
  });
}

// Update movement history
if (movementHistory) map.removeLayer(movementHistory);
const latLngs = stateManager.loadState()
  ?.playerPositionHistory.map((pos) => [pos.lat, pos.lng]) || [];
movementHistory = L.polyline(latLngs, { color: "blue" }).addTo(map);

function resetGame() {
  if (confirm("Are you sure you want to reset the game state?")) {
    playerPosition = { ...INITIAL_POSITION };
    generateCachesAroundPlayer();
    stateManager.reset();
    updateMap();
  }
}

// Event Listeners
document.getElementById("north")!.addEventListener("click", () => movePlayer("north"));
document.getElementById("south")!.addEventListener("click", () => movePlayer("south"));
document.getElementById("east")!.addEventListener("click", () => movePlayer("east"));
document.getElementById("west")!.addEventListener("click", () => movePlayer("west"));
document.getElementById("reset")!.addEventListener("click", resetGame);

// Initialization
generateCachesAroundPlayer();
updateMap();
