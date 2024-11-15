import leaflet from "leaflet";
import "./leafletWorkaround.ts";
import luck from "./luck.ts";

// Constants
const OAKES_CLASSROOM = leaflet.latLng(36.98949379578401, -122.06277128548504);
const GAMEPLAY_ZOOM_LEVEL = 19;
const TILE_DEGREES = 1e-4;
const NEIGHBORHOOD_SIZE = 8;
const CACHE_SPAWN_PROBABILITY = 0.1;

interface Cell {
  i: number;
  j: number;
}

interface Coin {
  id: string;
  cell: Cell;
}

interface Cache {
  cell: Cell;
  coins: Coin[];
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

// Add background tile layer
leaflet
  .tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  })
  .addTo(map);

// Add player marker
const playerMarker = leaflet.marker(OAKES_CLASSROOM).addTo(map);
playerMarker.bindTooltip("Player");

// Inventory management
let playerInventory: Coin[] = [];

// Function to generate cache ID
function generateCoinId(cell: Cell, index: number): string {
  return `${cell.i}:${cell.j}#${index}`;
}

// Function to spawn a cache
function spawnCache(cell: Cell): Cache {
  const coins: Coin[] = Array.from({ length: 3 }, (_, index) => ({
    id: generateCoinId(cell, index + 1),
    cell,
  }));

  const cache: Cache = { cell, coins };
  const cacheMarker = leaflet.marker([
    OAKES_CLASSROOM.lat + cell.i * TILE_DEGREES,
    OAKES_CLASSROOM.lng + cell.j * TILE_DEGREES,
  ]).addTo(map);

  cacheMarker.bindPopup(createCachePopup(cache));
  return cache;
}

// Create Cache Popup UI
function createCachePopup(cache: Cache) {
  const popupDiv = document.createElement("div");
  popupDiv.innerHTML = `<h4>Cache ${cache.cell.i}:${cache.cell.j}</h4><ul id="cacheList"></ul>`;
  
  const cacheList = popupDiv.querySelector("#cacheList")!;
  cache.coins.forEach((coin) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${coin.id} <button class="collect-btn">Collect</button>
    `;
    listItem.querySelector("button")?.addEventListener("click", () => collectCoin(coin, cache));
    cacheList.appendChild(listItem);
  });

  // Deposit Button
  const depositButton = document.createElement("button");
  depositButton.textContent = "Deposit Coins";
  depositButton.addEventListener("click", () => depositCoins(cache));
  popupDiv.appendChild(depositButton);

  return popupDiv;
}

// Collecting coins from cache
function collectCoin(coin: Coin, cache: Cache) {
  playerInventory.push(coin);
  cache.coins = cache.coins.filter((c) => c.id !== coin.id);
  console.log(`Collected ${coin.id}`);
}

// Depositing coins to a cache
function depositCoins(cache: Cache) {
  playerInventory.forEach((coin) => {
    cache.coins.push(coin);
  });
  playerInventory = [];
  console.log(`Deposited all coins`);
}

// Spawning caches around the player's neighborhood
for (let i = -NEIGHBORHOOD_SIZE; i <= NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j <= NEIGHBORHOOD_SIZE; j++) {
    if (luck(`${i},${j}`) < CACHE_SPAWN_PROBABILITY) {
      spawnCache({ i, j });
    }
  }
}
