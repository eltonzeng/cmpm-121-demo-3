// main.ts
import L from 'leaflet';
import { GameStateManager } from './memento.ts';
import { Coin, CoinFactory } from './flyweightCoin.ts';
import { GameEventManager } from './observer.ts';

let playerPosition = { lat: 0, lng: 0 };
const movementStep = 0.0001;  // Movement granularity
let nearbyCaches: { [key: string]: Coin[] } = {};
let mapMarkers: { [key: string]: L.Marker } = {}; // Store cache markers by cache ID

const map = L.map('map').setView([playerPosition.lat, playerPosition.lng], 15);
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

const gameStateManager = new GameStateManager();
const coinFactory = new CoinFactory();
const gameEventManager = new GameEventManager();

const playerMarker = L.marker([playerPosition.lat, playerPosition.lng]).addTo(map);

document.getElementById('north')!.onclick = () => movePlayer(0, movementStep);
document.getElementById('south')!.onclick = () => movePlayer(0, -movementStep);
document.getElementById('east')!.onclick = () => movePlayer(movementStep, 0);
document.getElementById('west')!.onclick = () => movePlayer(-movementStep, 0);
document.getElementById('reset')!.onclick = resetGameState;

function movePlayer(dLng: number, dLat: number) {
  playerPosition.lat += dLat;
  playerPosition.lng += dLng;
  updatePlayerPosition();
}

function updatePlayerPosition() {
  map.setView([playerPosition.lat, playerPosition.lng]);
  playerMarker.setLatLng([playerPosition.lat, playerPosition.lng]);

  // Notify observers of the player’s movement
  gameEventManager.notifyPlayerMoved(playerPosition);

  // Regenerate nearby caches
  manageCaches();
  renderCachesOnMap();

  // Save current game state
  gameStateManager.saveState(playerPosition, nearbyCaches);
}

function regenerateNearbyCaches() {
  Object.keys(nearbyCaches).forEach((cacheKey) => {
    const [i, j] = cacheKey.split(':').map(Number);
    const distance = Math.sqrt(
      Math.pow(i - playerPosition.lat * 10000, 2) + Math.pow(j - playerPosition.lng * 10000, 2)
    );

    // Remove caches that are too far away
    if (distance > 10) {
      delete nearbyCaches[cacheKey];
      console.log(`Removed distant cache at ${cacheKey}`);
    }
  });
}


function generateCachesAroundPlayer() {
  nearbyCaches = {};

  // Simulate cache locations around the player's position
  const cacheIds = [
    `${Math.round(playerPosition.lat * 10000)}:${Math.round(playerPosition.lng * 10000)}`,
    `${Math.round(playerPosition.lat * 10000) + 1}:${Math.round(playerPosition.lng * 10000) + 1}`
  ];

  cacheIds.forEach((cacheId, _index) => {
    const coinsInCache: Coin[] = [];

    // Generate a few coins for each cache
    for (let serial = 0; serial < 5; serial++) {
      const coin = coinFactory.createCoin(cacheId, serial);
      coinsInCache.push(coin);
    }

    nearbyCaches[cacheId] = coinsInCache;
  });

  console.log('Nearby caches generated:', nearbyCaches);
}


function manageCaches() {
  // Step 1: Regenerate existing caches within range
  regenerateNearbyCaches();

  // Step 2: If no caches are nearby, generate new ones
  if (Object.keys(nearbyCaches).length === 0) {
    generateCachesAroundPlayer();
  }
}

function renderCachesOnMap() {
  // Remove existing markers before adding new ones
  Object.keys(mapMarkers).forEach((key) => {
    map.removeLayer(mapMarkers[key]);
  });
  mapMarkers = {};

  // Render new caches
  Object.keys(nearbyCaches).forEach((cacheId) => {
    const [i, j] = cacheId.split(':').map(Number);
    const marker = L.marker([i / 10000, j / 10000]).addTo(map);
    mapMarkers[cacheId] = marker;
  });

  console.log('Caches rendered on the map:', nearbyCaches);
}


function resetGameState() {
  playerPosition = { lat: 0, lng: 0 };
  gameStateManager.reset();
  gameEventManager.notifyObservers("Game Reset", "Game state has been reset.");
  updatePlayerPosition();
}
