// globals
let ctx, canvas;
let tileSize = 16;
let tileScale = 32;
let spriteSheet;

// map globals (in cells)
let mapWidth = 340;//500;//1000;
let mapHeight = 480;//500;//1000;
let chunksRow = 5;
let chunksCol = 5;

// global objects
let gameMap;
let camera;
let player;
let keys = [];

let keyboardConfig = {
  'left': [37, 72, 65],
  'right': [39, 76, 68],
  'up': [38, 75, 87],
  'down': [40, 74, 83],
  'upleft': [89],
  'upright': [85],
  'downleft': [66],
  'downright': [78]
}
let keyConfig = {};
for (let item in keyboardConfig) {
  for (let i in keyboardConfig[item]) {
    keyConfig[keyboardConfig[item][i]] = item;
  }
}

// handle keyboard
function handleKeys(e) {
  keys = (keys || []);
  keys[e.keyCode] = true;

  //  console.log(e.keyCode);

  let dirX = 0;
  let dirY = 0;
  let updateViz = false;

  /// movement keys
  if (keyConfig[e.keyCode] == "left") { // left
    dirX = -1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "up") { // up 
    dirY = -1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "right") { // right 
    dirX = 1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "down") { // right 
    dirY = 1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "downleft") { // down left
    dirX = -1;
    dirY = 1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "downright") { // down right
    dirX = 1;
    dirY = 1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "upleft") { // up left
    dirX = -1;
    dirY = -1;
    updateViz = true;
  }
  if (keyConfig[e.keyCode] == "upright") { // up right 
    dirX = 1;
    dirY = -1;
    updateViz = true;
  }
  ///

  if (updateViz) {//} && validMove(player, dirX, dirY)) {
    player.move(dirX, dirY, camera);

    if (player.speedCtr < 15) {
      if (player.speedCtr < 10)
        player.speed = 1;
      else
        player.speed = 2;

      player.speedCtr++;
    }
    //if (update)
    // camera.update();
  }
}

function validMove(character, dirX, dirY) {
  let pos = getRowCol(character.x, character.y);
  let chunkID = gameMap.getChunkID(character.chunkRow, character.chunkCol);

  let nextRow = pos['row'] + dirY;
  let nextCol = pos['col'] + dirX;

  // waaay out of bounds
  if (nextRow < 0 || nextCol < 0 || nextRow > (gameMap.mapHeight - 1) || nextCol > (gameMap.mapWidth - 1))
    return false;


  let nextTile = gameMap.getTile("overworld", chunkID, nextRow, nextCol);

  //console.log(character, pos, nextRow, nextCol, nextTile);
  if (nextTile == TILES.WALL)
    return false;
  else if (nextTile == TILES.SHIFT_SCREEN_LEFT) {
    let nextChunk = gameMap.getChunkSeparate(gameMap.map["overworld"][chunkID].leftChunkID);
    character.chunkCol = nextChunk.col;
    character.chunkRow = nextChunk.row;
    console.log(nextChunk);
    // if (character.chunkCol < 0) character.chunkCol = 0;
    character.col = gameMap.mapWidth - 1;
  } else if (nextTile == TILES.SHIFT_SCREEN_RIGHT) {
    let nextChunk = gameMap.getChunkSeparate(gameMap.map["overworld"][chunkID].rightChunkID);
    console.log(nextChunk);
    character.chunkCol = nextChunk.col;
    character.chunkRow = nextChunk.row;
    // character.chunkCol++;
    // if (character.chunkCol >= (gameMap.numChunksCol - 1)) character.chunkCol = gameMap.numChunksCol - 1;
    character.col = 0;
  } else if (nextTile == TILES.SHIFT_SCREEN_UP) {
    let nextChunk = gameMap.getChunkSeparate(gameMap.map["overworld"][chunkID].upChunkID);
    console.log(nextChunk);
    character.chunkCol = nextChunk.col;
    character.chunkRow = nextChunk.row;
    // character.chunkCol++;
    // if (character.chunkCol >= (gameMap.numChunksCol - 1)) character.chunkCol = gameMap.numChunksCol - 1;
    character.row = gameMap.mapHeight-1;
  } else if (nextTile == TILES.SHIFT_SCREEN_DOWN) {
    let nextChunk = gameMap.getChunkSeparate(gameMap.map["overworld"][chunkID].downChunkID);
    console.log(nextChunk);
    character.chunkCol = nextChunk.col;
    character.chunkRow = nextChunk.row;
    // character.chunkCol++;
    // if (character.chunkCol >= (gameMap.numChunksCol - 1)) character.chunkCol = gameMap.numChunksCol - 1;
    character.row = 0;
  } else if (nextTile == TILES.TOWN) {
    let townID = gameMap.getTownID(chunkID, nextRow, nextCol);
    console.log("Welcome to " + gameMap.towns[townID]);


  }
  return true;  // no collisions found
}

let Player = function () {
  // this.x = (gameMap.mapWidth / 2) * tileSize + (tileSize / 2);//canvas.width / 2;
  // this.y = (gameMap.mapHeight / 2) * tileSize + (tileSize / 2);//canvas.height / 2;
  this.speed = 1;
  this.speedCtr = 0;
  this.chunkRow = 3;
  this.chunkCol = 3;

  this.row = Math.floor(gameMap.mapHeight / 2);
  this.col = Math.floor(gameMap.mapWidth / 2);

  let pos = getSpritePosition(this.row, this.col);
  this.x = pos['dx'];
  this.y = pos['dy'];
  this.screenX = this.x;
  this.screenY = this.y;


  this.move = function (dirX, dirY, camera) {
    for (let i = 1; i <= this.speed; i++) {
      let valid = validMove(this, dirX, dirY);

      if (!valid)
        return;// false;
      else {
        this.row += dirY;
        this.col += dirX;

        // this.x += dirX * (i * tileSize);//256;
        // this.y += dirY * (i * tileSize);//256;
        let maxX = gameMap.mapWidth * tileSize;
        let maxY = gameMap.mapHeight * tileSize;

        let pos = getSpritePosition(this.row, this.col);
        this.x = pos['dx'];
        this.y = pos['dy'];

        this.x = Math.max(0, Math.min(this.x, maxX));
        this.y = Math.max(0, Math.min(this.y, maxY));

        camera.update();
      }
    }
    // this.x += dirX * (this.speed * tileSize);//256;
    // this.y += dirY * (this.speed * tileSize);//256;

    // // check collision

    // let maxX = gameMap.mapWidth * tileSize;
    // let maxY = gameMap.mapHeight * tileSize;

    // this.x = Math.max(0, Math.min(this.x, maxX));
    // this.y = Math.max(0, Math.min(this.y, maxY));
    // return true;
  }
}

// draw text
function drawText(text, size, centered, textY, color, inTextX) {
  ctx.fillStyle = color;
  ctx.font = size + "px monospace";
  let textX;
  if (centered)
    textX = (canvas.width - ctx.measureText(text).width) / 2;
  else
    textX = canvas.width - uiWidth * tileSize + 25;

  if (inTextX)
    textX = inTextX;

  ctx.fillText(text, textX, textY);
}

// draw
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  var startCol = Math.floor(camera.x / tileSize);
  var endCol = startCol + Math.floor(camera.width / tileSize);
  var startRow = Math.floor(camera.y / tileSize);
  var endRow = startRow + Math.floor(camera.height / tileSize);

  var offsetX = -camera.x + startCol * tileSize;
  var offsetY = -camera.y + startRow * tileSize;

  if (endCol >= gameMap.mapWidth)
    endCol = gameMap.mapWidth - 1;
  if (endRow >= gameMap.mapHeight)
    endRow = gameMap.mapHeight - 1;

  //console.log(startCol, endCol, startRow, endRow, gameMap.mapWidth, gameMap.mapHeight);

  //let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      let chunkID = gameMap.getChunkID(player.chunkRow, player.chunkCol);
      let tile = gameMap.getTile("overworld", chunkID, r, c);
      let _x = (c - startCol) * tileSize + offsetX;
      let _y = (r - startRow) * tileSize + offsetY;

      // if (tile != 1) {
      let offset = getSpriteOffset(tilePositions[tile]['row'], tilePositions[tile]['col']);
      //console.log(offset);
      ctx.drawImage(
        spriteSheet,
        offset['dx'],
        offset['dy'],
        //35 * tileSize,
        //14 * tileSize,
        tileSize,
        tileSize,
        Math.round(_x),
        Math.round(_y),
        tileSize,
        tileSize
      );
      // }
    }
  }

  ctx.drawImage(
    spriteSheet,
    35 * tileSize,
    14 * tileSize,
    tileSize,
    tileSize,
    player.screenX - tileSize / 2,
    player.screenY - tileSize / 2,
    tileSize,
    tileSize
  );

  /*
  ctx.drawImage(
    spriteSheet,
    35 * 16,//offset['dx'],
    14 * 16,//offset['dy'],
    16,
    16,
    canvas.width / 2,//x * tileSize + shakeX,
    canvas.height / 2,//y * tileSize + shakeY,
    tileScale,//tileSize,
    tileScale//tileSize
  );
  console.log(gameMap.map);
  */

  // DEBUG TEXT
  ctx.fillStyle = "#ffffff";
  ctx.font = 18 + "px monospace";
  let txt = "Chunk ID [" + player.chunkRow + ":" + player.chunkCol + "]";
  ctx.fillText(txt, 10, 30);
  txt = "Row [" + player.row + "] Col [" + player.col + "]";
  ctx.fillText(txt, 10, 50);




  window.requestAnimationFrame(draw);
}

// initialize
window.onload = function () {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  canvas.width = document.body.clientWidth;
  canvas.height = document.body.clientHeight;
  canvas.style.width = canvas.width + 'px';
  canvas.style.height = canvas.height + 'px';
  ctx.imageSmoothingEnabled = false;

  // keys
  document.addEventListener('keydown', handleKeys);
  document.addEventListener('keyup', function (e) {
    player.speedCtr = 0;
    keys[e.keyCode] = false;
  });

  // create map object
  gameMap = new mapHandler(chunksRow, chunksCol, mapWidth, mapHeight);

  player = new Player();
  camera = new Camera(gameMap.mapWidth, gameMap.mapHeight, canvas.width, canvas.height);
  camera.follow(player);
  camera.update();

  spriteSheet = new Image();
  spriteSheet.src = "./assets/colored_transparent_packed.png";
  spriteSheet.onload = draw;

}