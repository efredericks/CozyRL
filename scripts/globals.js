function getSpriteOffset(row, col) {
  let dx = col * tileSize;
  let dy = row * tileSize;
  return { 'dx': dx, 'dy': dy };
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}


const TILES = {
  WALL: 0,
  GROUND: 1,
  FOLIAGE: 2,
  WATER: 3,
  TREE: 4, //4-11 is trees
  BEACH: 12,
  BRICK: 13,
  WATER_ANIM: 14,
  BURN_ANIM: 15,
  TOWN: 16,
  GROUND_SPECIAL: 17,
  CAMPFIRE: 18,
  CAMPFIRE_ANIM: 19,
  CAMPFIRE_SURROUND: 20,
  BURN_ANIM2: 21,
  SHIFT_SCREEN_LEFT: 22,
  SHIFT_SCREEN_RIGHT: 23,
  PAVEMENT: 24,
  DOCK: 25,
  DOCK2: 26,
};
const tilePositions = {
  0: { 'row': 17, 'col': 1 }, // wall
  1: { 'row': 0, 'col': 1 }, // ground
  2: { 'row': 0, 'col': 6 }, // foliage
  3: { 'row': 5, 'col': 8 }, // water
  /// trees
  4: { 'row': 1, 'col': 0 },
  5: { 'row': 1, 'col': 1 },
  6: { 'row': 1, 'col': 2 },
  7: { 'row': 1, 'col': 3 },
  8: { 'row': 1, 'col': 4 },
  9: { 'row': 1, 'col': 5 },
  10: { 'row': 2, 'col': 3 },
  11: { 'row': 2, 'col': 4 },
  ///
  12: { 'row': 6, 'col': 47 }, // beach
  13: { 'row': 15, 'col': 7 }, // brick
  14: { 'row': 22, 'col': 0 },  // water animation
  15: { 'row': 22, 'col': 1 }, // burn animation
  16: { 'row': 19, 'col': 0 }, // town sprite (make them special for each town so player knows)
  17: { 'row': 0, 'col': 4 }, // dirt surrounding town
  18: { 'row': 10, 'col': 14 }, // campfire
  19: { 'row': 22, 'col': 3 }, // campfire anim
  20: { 'row': 22, 'col': 4 }, // campfire dirt
  21: { 'row': 22, 'col': 2 }, // burn animation 2
  22: { 'row': 20, 'col': 26 }, // shift screen left tile
  23: { 'row': 20, 'col': 24 }, // shift screen right tile
  24: { 'row': 13, 'col': 0 }, // pavement
  25: { 'row': 22, 'col': 5 }, // dock
  26: { 'row': 22, 'col': 6 }, // dock2
  //25: { 'row': 5, 'col': 16 }, // dock
};
const TREE_SPRITE_START = 4;
const TREE_SPRITE_END = 11;
