function getOverlayKey(_chunkRow, _chunkCol, r, c) {
  return `${_chunkRow}:${_chunkCol}:${r}:${c}`;
}

function getSpriteOffset(row, col) {
  let dx = col * tileSize;
  let dy = row * tileSize;
  return { 'dx': dx, 'dy': dy };
}

function getRowCol(x, y) {
  let dc = Math.floor((x - (tileSize / 2)) / tileSize);
  let dr = Math.floor((y - (tileSize / 2)) / tileSize);
  return { 'row': dr, 'col': dc };
}

function getSpritePosition(row, col) {
  let dx = Math.floor(col * tileSize + tileSize / 2);
  let dy = Math.floor(row * tileSize + tileSize / 2);
  return { 'dx': dx, 'dy': dy };
}

function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

function getRandomInteger(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function shuffle(arr) {
  let tmp, r;
  for (let i = 1; i < arr.length; i++) {
    r = getRandomInteger(0, i + 1);
    tmp = arr[i];
    arr[i] = arr[r];
    arr[r] = tmp;
  }
  return arr;
}


// https://stackoverflow.com/questions/48802987/is-there-a-map-function-in-vanilla-javascript-like-p5-js
// linearly maps value from the range (a..b) to (c..d)
function mapRange(value, a, b, c, d) {
  // first map value from (a..b) to (0..1)
  value = (value - a) / (b - a);
  // then map it from (0..1) to (c..d) and return it
  return c + value * (d - c);
}

// town lookup table
const TOWNS = {
  FRILL: 0,
  LUB: 1,
  MORTE: 2,
  AUBER: 3,
};
// town chunk table
let townChunks = {};
// number of random towns to spawn
const numRandomTowns = 10;

const STATES = {
  INTRO: 1,
  GAME: 2,
  DIALOGUE: 3,
  MENU: 4,
  GAME_OVER: 5,
  PAUSED: 6,
};

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
  PAVEMENT: 22,
  DOCK: 23,
  DOCK2: 24,
  SHIFT_SCREEN_LEFT: 25,
  SHIFT_SCREEN_RIGHT: 26,
  SHIFT_SCREEN_UP: 27,
  SHIFT_SCREEN_DOWN: 28,
  NPC: 29,
  ENEMY: 37,
  SNOW: 38,
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
  22: { 'row': 13, 'col': 0 }, // pavement
  23: { 'row': 22, 'col': 5 }, // dock
  24: { 'row': 22, 'col': 6 }, // dock2
  25: { 'row': 20, 'col': 26 }, // shift screen left tile
  26: { 'row': 20, 'col': 24 }, // shift screen right tile
  27: { 'row': 20, 'col': 23 }, // shift screen up tile
  28: { 'row': 20, 'col': 25 }, // shift screen down tile
  //25: { 'row': 5, 'col': 16 }, // dock
  29: { 'row': 10, 'col': 24 }, //npc1
  30: { 'row': 10, 'col': 25 }, //npc2
  31: { 'row': 10, 'col': 26 }, //npc3
  32: { 'row': 10, 'col': 27 }, //npc4
  33: { 'row': 10, 'col': 28 }, //npc5
  34: { 'row': 10, 'col': 29 }, //npc6
  35: { 'row': 10, 'col': 30 }, //npc7
  36: { 'row': 10, 'col': 31 }, //npc8
  37: { 'row': 0, 'col': 25 }, //generic enemy (TBD)
  38: { 'row': 22, 'col': 0 }, //snow
};
const TREE_SPRITE_START = 4;
const TREE_SPRITE_END = 11;

const NPC_SPRITE_START = 29;
const NPC_SPRITE_END = 36;

const Items = {
  STICK: 0,
  MATCHES: 1,
  SMORES: 2,
  WORM: 3,
  HOOK: 4,
  BEER: 5,
  FISH: 6,
  GOLDEN_FISH: 7,
};

const QuestTypes = {
  FETCH: 0, // fetch X things
  KILLX: 1, // kill X things
  STORY: 2, // talk to X npc
}

const NPCBlathering = {
  "generic": [
    "Hey, how's it going?",
    "Nice weather we're having here.",
    "Generic platitudes of greeting.",
    "Out of my way runt.",
    "Buzz off!",
    "Not in the mood today!",
    "Have you heard about Pluto?",
    "Watch it!",
    "Nice...face.",
    "Hey there adventurer!",
    "I'm walkin' here!",
    "There are other worlds than these.",
    "Go forth hyperborean wanderer!",
    "Have you seen my keys?",
    "Has the King returned yet?",
  ],
  "specific": {},
};