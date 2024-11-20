import L from "leaflet";
import "leaflet/dist/leaflet.css";
import luck from "./luck.ts";
import { CoinFactory } from "./flyweightCoin.ts";
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

function movePlayer(direction: "north" | "south" | "east" | "west") {
  switch (direction) {
    case "north":
      playerPosition.lat += CELL_SIZE;
      break;
    case "south":
      playerPosition.lat -= CELL_SIZE;
      break;
    case "east":
      playerPosition.lng += CELL_SIZE;
      break;
    case "west":
      playerPosition.lng -= CELL_SIZE;
      break;
  }
}


// Event Listeners
document.getElementById("north")!.addEventListener("click", () => movePlayer("north"));
document.getElementById("south")!.addEventListener("click", () => movePlayer("south"));
document.getElementById("east")!.addEventListener("click", () => movePlayer("east"));
document.getElementById("west")!.addEventListener("click", () => movePlayer("west"));
document.getElementById("reset")!.addEventListener("click", resetGame);
