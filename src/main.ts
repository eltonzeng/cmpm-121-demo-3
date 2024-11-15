import leaflet from "leaflet";
import "./leafletWorkaround.ts";
import luck from "./luck.ts";
import CoinFactory, { Coin } from "./flyweightCoin.ts";

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

let playerInventory: Coin[] = [];

function generateCoinId(cell: Cell, index: number): string {
  return `${cell.i}:${cell.j}#${index}`;
}

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
  const cacheMarker = leaflet.marker([
    OAKES_CLASSROOM.lat + cell.i * TILE_DEGREES,
    OAKES_CLASSROOM.lng + cell.j * TILE_DEGREES,
  ]).addTo(map);

  cacheMarker.bindPopup(createCachePopup(cache));
  return cache;
}

function createCachePopup(cache: Cache) {
  const popupDiv = document.createElement("div");
  popupDiv.innerHTML = `<h4>Cache ${cache.cell.i}:${cache.cell.j}</h4><ul id="cacheList"></ul>`;
  
  const cacheList = popupDiv.querySelector("#cacheList")!;
  cache.coins.forEach((coin) => {
    const listItem = document.createElement("li");
    listItem.innerHTML = `
      ${coin.flyweight.type} (Value: ${coin.flyweight.value}) <button class="collect-btn">Collect</button>
    `;
    listItem.querySelector("button")?.addEventListener("click", () => collectCoin(coin, cache));
    cacheList.appendChild(listItem);
  });

  const depositButton = document.createElement("button");
  depositButton.textContent = "Deposit Coins";
  depositButton.addEventListener("click", () => depositCoins(cache));
  popupDiv.appendChild(depositButton);

  return popupDiv;
}

function collectCoin(coin: Coin, cache: Cache) {
  playerInventory.push(coin);
  cache.coins = cache.coins.filter((c) => c.id !== coin.id);
  console.log(`Collected ${coin.flyweight.type} Coin with value ${coin.flyweight.value}`);
}

function depositCoins(cache: Cache) {
  playerInventory.forEach((coin) => {
    cache.coins.push(coin);
  });
  playerInventory = [];
  console.log(`Deposited all coins`);
}

for (let i = -NEIGHBORHOOD_SIZE; i <= NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j <= NEIGHBORHOOD_SIZE; j++) {
    if (luck(`${i},${j}`) < CACHE_SPAWN_PROBABILITY) {
      spawnCache({ i, j });
    }
  }
}

console.log(`Total Flyweight Coins: ${CoinFactory.getFlyweightCount()}`);
