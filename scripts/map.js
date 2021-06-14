class mapHandler {
  constructor(numChunksRow, numChunksCol, mapWidth, mapHeight, numRandomNPCs) {
    this.numChunksRow = numChunksRow; // overworld-specific
    this.numChunksCol = numChunksCol; // overworld-specific
    this.mapWidth = mapWidth; // all
    this.mapHeight = mapHeight; // all

    this.numRandomNPCs = numRandomNPCs;

    this.noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
    let retval = this.generateMap();
    this.map = retval.map
    this.towns = retval.towns; // city name by chunkID:row:col lookup

    this.npcs = this.generateNPCs();
    this.enemies = this.generateEnemies();
    this.quests = this.setupQuests();

    this.activeTarget = null;

    console.log(this.quests);
  }

  // colon separated town ID for lookup tables - chunkID:row:col
  getTownID = function (chunkID, row, col) {
    return chunkID + ":" + row + ":" + col;
  }

  // colon separated chunk ID - chunkRow:chunkCol
  getChunkID = function (chunkRow, chunkCol) {
    return chunkRow + ":" + chunkCol;
  };

  getChunkSeparate = function (chunkID) {
    let c = chunkID.split(":");
    return { 'row': c[0], 'col': c[1] }
  }

  generateNPCs = function () {
    let retval = [];
    for (let i = 0; i < this.numRandomNPCs; i++) {
      let c = getRandomInteger(2, this.mapWidth - 3);
      let r = getRandomInteger(2, this.mapHeight - 3);
      let sprite = getRandomInteger(NPC_SPRITE_START,NPC_SPRITE_END+1);
      retval.push(new Character(3, 3, r, c, "NPCzorgle" + i, "npc", sprite, 10, 10, 1, null));
      console.log("NPCzorgle" + i + " at [" + r + ":" + c + "]");
    }
    return retval;
  }

  generateEnemies = function () {
    let retval = [];

    for (let i = 0; i < 20; i++) {
      let c = getRandomInteger(2, this.mapWidth - 3);
      let r = getRandomInteger(2, this.mapHeight - 3);
      retval.push(new Character(3, 3, r, c, "Sporgle" + i, "enemy", TILES.ENEMY, 10, 10, 1, null));
      console.log("Sporgle" + i + " at [" + r + ":" + c + "]");
    }
    return retval;
  }

  setupQuests = function () {
    let quests = {};

    // help a camper
    quests["Camp Counselor"] = {
      active: false,
      dialogueIndex: 0,
      questReward: 100,
      dialogue: [],
      targetNPC: "Camper Z", // name may not match key
      questType: QuestTypes.FETCH,
      questTargets: [Items.STICK, Items.MATCHES, Items.SMORES],
    };

    quests["Fish are Friends"] = {
      active: false,
      dialogueIndex: 0, // last is the 'done quest' dialogue
      questRewards: { "XP": 50, "Items": [Items.BEER, Items.GOLDEN_FISH] },
      dialogue: {
        0: [
          "Looking mighty fine outside, except for the storm!",
          "Dangit, I'm all out of bait.",
          "I'll never catch that fish now."],
        1: [
          "Thanks!  Now if only I had a hook to use.",
          "Would you mind finding one for me?",
          "I'm stuck here all day minding the store.",
        ],
        2: [
          "Thanks again friend!",
          "Only thing that would make this better is a cold beer.",
          "Go fetch us both a couple and we'll knock off for the day.",
        ],
        3: [
          "That's a beautiful fish, why don't you keep it?",
          "Thanks for dropping by!",
          "Good to see you again."
        ]
      },
      targetNPC: "Mike the Fisherman",
      questType: QuestTypes.FETCH,
      questTargets: [Items.WORM, Items.HOOK, Items.BEER],
    };

    return quests;
  }

  generateMap = function () {
    let _map = {};
    let _towns = {};

    // generate overworld
    let levelName = "overworld";
    _map[levelName] = {};

    // generate chunks
    for (let chunk_row = 0; chunk_row < this.numChunksRow; chunk_row++) {
      for (let chunk_col = 0; chunk_col < this.numChunksCol; chunk_col++) {
        let randomOffset = getRandomInteger(0, 10000);
        let _cid = this.getChunkID(chunk_row, chunk_col);
        _map[levelName][_cid] = [];

        // generate overworld map
        for (let row = 0; row < this.mapHeight; row++) {
          _map[levelName][_cid][row] = [];
          for (let col = 0; col < this.mapWidth; col++) {
            let _obj;


            if (col == 0 || col >= this.mapWidth - 1 || row == 0 || row >= this.mapHeight - 1) {

              // generate chunk transitions
              // left transition
              if (col == 0 && row == Math.floor(this.mapHeight / 2) && chunk_col > 0) {
                _map[levelName][_cid][row].push(TILES.SHIFT_SCREEN_LEFT);
                _map[levelName][_cid].leftChunkID = this.getChunkID(chunk_row, chunk_col - 1);

                // right transition
              } else if (col == (this.mapWidth - 1) && row == Math.floor(this.mapHeight / 2) && chunk_col < (this.numChunksCol - 1)) {
                _map[levelName][_cid][row].push(TILES.SHIFT_SCREEN_RIGHT);
                _map[levelName][_cid].rightChunkID = this.getChunkID(chunk_row, chunk_col + 1);

                // up transition
              } else if (row == 0 && col == Math.floor(this.mapWidth / 2) && chunk_row > 0) {
                _map[levelName][_cid][row].push(TILES.SHIFT_SCREEN_UP);
                _map[levelName][_cid].upChunkID = this.getChunkID(chunk_row - 1, chunk_col);

                // down transition
              } else if (row == (this.mapHeight - 1) && col == Math.floor(this.mapWidth / 2) && chunk_row < (this.numChunksRow - 1)) {
                _map[levelName][_cid][row].push(TILES.SHIFT_SCREEN_DOWN);
                _map[levelName][_cid].downChunkID = this.getChunkID(chunk_row + 1, chunk_col);

              } else
                _map[levelName][_cid][row].push(TILES.WALL);
            } else {
              let _noise = this.noiseGen.get2DNoise(col + randomOffset, row + randomOffset);

              if (chunk_col == 3 && chunk_row == 3) { // desert

                if (_noise < 0.0)
                  _map[levelName][_cid][row].push(TILES.BEACH);
                else if (_noise < 0.1)
                  _map[levelName][_cid][row].push(TILES.FOLIAGE);
                else if (_noise < 0.3) {
                  // if (Math.random() > 0.90)
                  //   _map[levelName][_cid][row].push(TILES.WATER_ANIM);
                  // else
                  _map[levelName][_cid][row].push(TILES.WATER);
                } else if (_noise < 0.25)
                  _map[levelName][_cid][row].push(TILES.FOLIAGE);
                else if (_noise < 0.4)
                  _map[levelName][_cid][row].push(getRandomInteger(TREE_SPRITE_START, TREE_SPRITE_END + 1));
                else if (_noise < 0.5)
                  _map[levelName][_cid][row].push(TILES.FOLIAGE);
                else
                  _map[levelName][_cid][row].push(TILES.BEACH);

              } else {


                if (_noise < 0)
                  _map[levelName][_cid][row].push(TILES.GROUND);
                else if (_noise < 0.1)
                  _map[levelName][_cid][row].push(TILES.BEACH);
                else if (_noise < 0.3) {
                  // if (Math.random() > 0.90)
                  //   _map[levelName][_cid][row].push(TILES.WATER_ANIM);
                  // else
                  _map[levelName][_cid][row].push(TILES.WATER);
                } else if (_noise < 0.25)
                  _map[levelName][_cid][row].push(TILES.BEACH);
                else if (_noise < 0.4)
                  _map[levelName][_cid][row].push(getRandomInteger(TREE_SPRITE_START, TREE_SPRITE_END + 1));
                else if (_noise < 0.5)
                  _map[levelName][_cid][row].push(TILES.FOLIAGE);
                else
                  _map[levelName][_cid][row].push(TILES.GROUND);
              }
            }
          }
        }
      }
    }

    // place towns
    let townValid = [TILES.GROUND, TILES.BEACH, TILES.FOLIAGE]; // TBD UNTIL ABSTRACTED OUT TILE
    for (let i = 0; i < numRandomTowns; i++) {
      let r_chunk_row = getRandomInteger(0, this.numChunksRow);
      let r_chunk_col = getRandomInteger(0, this.numChunksCol);
      let r_chunk_id = this.getChunkID(r_chunk_row, r_chunk_col);

      let _x, _y;
      do {
        r_chunk_row = getRandomInteger(0, this.numChunksRow);
        r_chunk_col = getRandomInteger(0, this.numChunksCol);
        r_chunk_id = this.getChunkID(r_chunk_row, r_chunk_col);

        _x = getRandomInteger(2, this.mapWidth - 3);
        _y = getRandomInteger(2, this.mapHeight - 3);
      } while (townValid.indexOf(_map["overworld"][r_chunk_id][_x][_y]) <= 0);
      // } while (_map["overworld"][r_chunk_id][_x][_y] != TILES.GROUND);
      _map["overworld"][r_chunk_id][_x][_y] = TILES.TOWN;

      let allCities = english_towns_cities.cities.concat(english_towns_cities.towns);
      let cityName = allCities[getRandomInteger(0, allCities.length)];
      _towns[this.getTownID(r_chunk_id, _x, _y)] = cityName;
      console.log("Town [" + cityName + "] at " + r_chunk_id + " - " + _x + ":" + _y);
    }

    // generate caves
    levelName = "caves";
    _map[levelName] = {};

    return { 'map': _map, 'towns': _towns };
  };

  getTile = function (level, chunkID, x, y) {
    return this.map[level][chunkID][x][y];
  };

  setTile = function (level, chunkID, x, y, newTile) {
    this.map[level][chunkID][x][y] = newTile;
  }
};

// Camera handler
let Camera = function (mapWidth, mapHeight, width, height) {
  this.x = 0;
  this.y = 0;
  this.width = width;
  this.height = height;

  this.maxX = mapWidth * tileSize - width;
  this.maxY = mapHeight * tileSize - height;

  this.SPEED = 256;

  this.follow = function (p) {
    this.following = p;
    p.screenX = 0;
    p.screenY = 0;
  };

  this.update = function () {//move = function (dirX, dirY) {
    this.following.screenX = this.width / 2;
    this.following.screenY = this.height / 2;

    //let delta = 1.0; // FIX WITH A REAL LOOP LATER
    this.x = this.following.x - this.width / 2;
    this.y = this.following.y - this.height / 2;
    // this.x += dirX * this.SPEED;// * delta;
    // this.y += dirY * this.SPEED;// * delta;
    // clamp
    this.x = Math.max(0, Math.min(this.x, this.maxX));
    this.y = Math.max(0, Math.min(this.y, this.maxY));

    // handle corners
    if (this.following.x < this.width / 2 || this.following.x > this.maxX + this.width / 2)
      this.following.screenX = this.following.x - this.x;

    if (this.following.y < this.height / 2 || this.following.y > this.maxY + this.height / 2)
      this.following.screenY = this.following.y - this.y;
  };
};

class Character {
  constructor(chunkRow, chunkCol, row, col, name, type, sprite, hp, ac, level, inventory) {
    this.chunkRow = chunkRow;
    this.chunkCol = chunkCol;
    this.row = row;
    this.col = col;
    this.name = name;
    this.type = type;
    this.sprite = sprite;
    this.hp = hp;
    this.ac = ac;
    this.level = level;
    this.inventory = inventory;
  };

  draw = function () {
    console.log(this.name + " says hey");
  };

  // handle chunk update in the main loop
  update = function () {
    if (Math.random() > 0.98) {
      let directions = [
        [-1, -1], // nw
        [-1, 0], // n
        [-1, 1], // ne
        [0, 1], // e
        [1, 1], // se
        [1, 0], // s
        [1, -1], // sw
        [-1, 0], // w
      ].sort(() => Math.random() - 0.5);

      let nextTile = gameMap.getTile("overworld", this.getChunkID(), this.row + directions[0][0], this.col + directions[0][1]);
      if (nextTile != TILES.WALL) { // nextTile.walkable) {
        this.row += directions[0][0];
        this.col += directions[0][1];
      }
      this.row = clamp(this.row, 1, gameMap.mapHeight - 1);
      this.col = clamp(this.col, 1, gameMap.mapWidth - 1);
    }
  };

  getChunkID = function () {
    return this.chunkRow + ":" + this.chunkCol;//tbd - move getChunkID to global call
  }
}

