class mapHandler {
  constructor(numChunksRow, numChunksCol, mapWidth, mapHeight) {
    this.numChunksRow = numChunksRow; // overworld-specific
    this.numChunksCol = numChunksCol; // overworld-specific
    this.mapWidth = mapWidth; // all
    this.mapHeight = mapHeight; // all

    this.noiseGen = new FastSimplexNoise({ frequency: 0.01, octaves: 4 });
    this.map = this.generateMap();
  }

  getChunkID = function (chunkRow, chunkCol) {
    return chunkRow + ":" + chunkCol;
  };

  generateMap = function () {
    let _map = {};

    // generate overworld
    let levelName = "overworld";
    _map[levelName] = {};

    let randomOffset = getRandomInteger(0, 10000);

    // generate chunks
    for (let chunk_row = 0; chunk_row < this.numChunksRow; chunk_row++) {
      for (let chunk_col = 0; chunk_col < this.numChunksCol; chunk_col++) {
        let _cid = this.getChunkID(chunk_row, chunk_col);
        _map[levelName][_cid] = [];

        // generate map
        for (let row = 0; row < this.mapHeight; row++) {
          _map[levelName][_cid][row] = [];
          for (let col = 0; col < this.mapWidth; col++) {
            if (col == 0 || col >= this.mapWidth - 1 || row == 0 || row >= this.mapHeight - 1)
              _map[levelName][_cid][row].push(TILES.WALL);
            else {
              let _noise = this.noiseGen.get2DNoise(col + randomOffset, row + randomOffset);

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

    console.log(_map);

    // generate caves
    levelName = "caves";
    _map[levelName] = {};

    return _map;
  };

  getTile = function (level, chunkID, x, y) {
    return this.map[level][chunkID][y][x];
  };
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