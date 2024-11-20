# cmpm-121-demo-3

Class Assignment for CMPM121 Game Development Patterns. In this assignment, we incrementally develop a Geocoin Carrier game.
These developments are split into four stages:
[D3.a] Implement a limited version of the game’s procedurally generated world along with basic coin mechanics. The player can collect generic coins from nearby caches and deposit them into other nearby caches.
[D3.b] Refine the representation of cache locations to use a geodetic datum, an Earth-spanning coordinate system, based on Null Island. Use the flyweight pattern to represent locations on the game’s grid. Refine the representation of coins to be unique, (non-cryptographic) non-fungible tokens. 
[D3.c] Allow the player to move their position marker around the map in discrete steps using simple button controls. Make sure the state of caches is preserved even if they go out of the player’s view. Use the memento pattern to collect player and cache state into simple string values.
[D3.d] Persist data across gameplay sessions using the browser’s local storage mechanism. Allow player movement based on the browser’s geolocation mechanism. Use the facade pattern to decouple the core gameplay rules from the specific mechanism used to move the player about the world. Plot the player’s movement history on the map.
