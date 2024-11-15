import leaflet from "leaflet";
import "./leafletWorkaround.ts";
import luck from "./luck.ts";
import { Coin, coinFactory } from "./flyweightCoin.ts";
import GameStateManager from "./memento.ts";
import { GameEventManager } from "./observer.ts";

const OAKES_LAT = 36.98949379578401;
const OAKES_LNG = -122.06277128548504;

const TILE_DEGREES = 1e-4; // 0.0001 degrees grid cells
const NEIGHBORHOOD_SIZE = 8;
const CACHE_SPAWN_PROBABILITY = 0.1;

const gameEventManager = new GameEventManager();
const _gameStateManager = new GameStateManager();

const playerInventory: Coin[] = [];
const caches: { [key: string]: Coin[] } = {};

// Convert latitude/longitude to grid cells based on Null Island
function _latLngToCell(lat: number, lng: number) {
  const i = Math.floor(lat / TILE_DEGREES);
  const j = Math.floor(lng / TILE_DEGREES);
  return { i, j };
}

function spawnCoinsForCache(i: number, j: number, coinCount: number) {
  const coins: Coin[] = [];
  for (let serial = 0; serial < coinCount; serial++) {
    const coin = coinFactory.getCoin(i, j, serial);
    coins.push(coin);
  }
  return coins;
}

function spawnCache(i: number, j: number) {
  const cacheKey = `${i}:${j}`;
  if (luck(cacheKey) < CACHE_SPAWN_PROBABILITY) {
    const coinCount = Math.floor(luck(cacheKey + "-coins") * 3) + 1; // 1-3 coins
    const coins = spawnCoinsForCache(i, j, coinCount);
    caches[cacheKey] = coins;

    const bounds = leaflet.latLngBounds([
      [OAKES_LAT + i * TILE_DEGREES, OAKES_LNG + j * TILE_DEGREES],
      [OAKES_LAT + (i + 1) * TILE_DEGREES, OAKES_LNG + (j + 1) * TILE_DEGREES],
    ]);

    const marker = leaflet.rectangle(bounds);
    marker.bindPopup(() => {
      const popupDiv = document.createElement("div");
      popupDiv.innerHTML = `<div>Cache at ${cacheKey}</div>`;
      coins.forEach((coin) => {
        const coinButton = document.createElement("button");
        coinButton.textContent = `Collect ${coin.toString()}`;
        coinButton.addEventListener("click", () => {
          collectCoin(coin, cacheKey);
        });
        popupDiv.appendChild(coinButton);
      });
      return popupDiv;
    });
    marker.addTo(map);
  }
}

function collectCoin(coin: Coin, cacheKey: string) {
  playerInventory.push(coin);
  caches[cacheKey] = caches[cacheKey].filter((c) => c !== coin);
  gameEventManager.notifyObservers("Coin Collected", coin.toString());
}

// Initialize map and caches
const map = leaflet.map(document.getElementById("map")!, {
  center: leaflet.latLng(OAKES_LAT, OAKES_LNG),
  zoom: 19,
});

for (let i = -NEIGHBORHOOD_SIZE; i < NEIGHBORHOOD_SIZE; i++) {
  for (let j = -NEIGHBORHOOD_SIZE; j < NEIGHBORHOOD_SIZE; j++) {
    spawnCache(i, j);
  }
}
