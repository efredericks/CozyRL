///TODO
/*
1. state machine
2. FPS lock
3. inventory
4. town map
5. cave map
6. NPC interaction
7. enemy interaction
8. ...?
*/


// globals
let ctx, canvas;
let tileSize = 16;
let tileScale = 32;
let spriteSheet;
let simTime = 0;
let timeStep = .1;
let gameState = STATES.INTRO;
let pauseDrawn = false;

// map globals (in cells)
let mapWidth = 340;//500;//1000;
let mapHeight = 480;//500;//1000;
let chunksRow = 5;
let chunksCol = 5;

let numRandomNPCs = chunksRow * chunksCol * 2;

// global objects
let gameMap;
let camera;
let player;
let keys = [];

let keyboardConfig = {
  'left': [37, 72, 65], // left arrow, a, h
  'right': [39, 76, 68], // right arrow, d, l
  'up': [38, 75, 87], // up arrow, w, k
  'down': [40, 74, 83], // down arrow, s, j
  'upleft': [89], // y
  'upright': [85], // u
  'downleft': [66], // b
  'downright': [78], // n
  'paused': [80], // p
  'interact': [13, 32, 27], // space, return, esc
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

  // console.log(e.keyCode);

  let dirX = 0;
  let dirY = 0;
  let updateViz = false;

  /// game keys
  if (keyConfig[e.keyCode] == "paused") {
    if (gameState == STATES.GAME) {
      gameState = STATES.PAUSED;
      pauseDrawn = false;
    } else if (gameState == STATES.PAUSED)
      gameState = STATES.GAME;
  }

  /// movement keys
  if (gameState == STATES.DIALOGUE) {
    if (keyConfig[e.keyCode] == "interact") { // move the dialogue along
      gameState = STATES.GAME;
      gameMap.activeTarget = null;
    }
  } else if (gameState == STATES.GAME) {

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
    character.row = gameMap.mapHeight - 1;
  } else if (nextTile == TILES.SHIFT_SCREEN_DOWN) {
    let nextChunk = gameMap.getChunkSeparate(gameMap.map["overworld"][chunkID].downChunkID);
    console.log(nextChunk);
    character.chunkCol = nextChunk.col;
    character.chunkRow = nextChunk.row;
    // character.chunkCol++;
    // if (character.chunkCol >= (gameMap.numChunksCol - 1)) character.chunkCol = gameMap.numChunksCol - 1;
    character.row = 0;

  } else if (nextTile == TILES.WATER) { // slow down player
    player.speed = 1;
    player.speedCtr = 0;

  } else if (nextTile == TILES.TOWN) {
    let townID = gameMap.getTownID(chunkID, nextRow, nextCol);
    console.log("Welcome to " + gameMap.towns[townID]);
  } else {
    //TBD - ABSTRACT THIS!!!!
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

    let chunkID = gameMap.getChunkID(player.chunkRow, player.chunkCol);
    let enemiesInChunk = gameMap.enemies.filter(enemy => (enemy.getChunkID() == chunkID));
    let npcsInChunk = gameMap.npcs.filter(npc => (npc.getChunkID() == chunkID));
    let npcsInView = npcsInChunk.filter(npc => (npc.row >= startRow && npc.col <= endCol));
    let enemiesInView = enemiesInChunk.filter(enemy => (enemy.row >= startRow && enemy.col <= endCol));
    ///
    // let charactersInView = [].concat(npcsInView, enemiesInView);
    // let enemiesInView = enemiesInChunk.filter(enemy => (enemy.row >= startRow && enemy.col <= endCol));

    // NPC collision check
    for (let i = 0; i < npcsInView.length; i++) {
      if (npcsInView[i].row == nextRow && npcsInView[i].col == nextCol) {
        gameMap.activeTarget = npcsInView[i];
        console.log(gameMap.activeTarget);
        gameState = STATES.DIALOGUE;
        return false;
      }
    }

    // enemy collision check
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

// state machine
function stateHandler() {
  switch (gameState) {
    case STATES.INTRO:
      drawIntro();
      break;
    case STATES.PAUSED:
      console.log("paused");
      drawPause();
      break;
    case STATES.DIALOGUE:
      /// TBD: AGAIN, ABSTRACT THESE VARS
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
      let chunkID = gameMap.getChunkID(player.chunkRow, player.chunkCol);
      drawEnvironment(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY);
      ////
      drawPlayer();
      drawDialogue();
      break;
    case STATES.GAME:
    default:
      draw();

      break;
  }

  window.requestAnimationFrame(stateHandler);
}

// https://blog.hellojs.org/create-a-very-basic-loading-screen-using-only-javascript-css-3cf099c48b19
function drawIntro() {
  gameState = STATES.GAME;
}

function drawDialogue() {

}

function drawPause() {
  if (!pauseDrawn) {
    ctx.save();

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
    let chunkID = gameMap.getChunkID(player.chunkRow, player.chunkCol);
    drawEnvironment(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY);

    // overlay
    ctx.fillStyle = "rgba(0,0,0,0.7)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // text overlay
    ctx.fillStyle = "rgba(13,53,6,0.5)";
    ctx.fillRect(0, (canvas.height / 2) - 50, canvas.width, 100);

    ctx.fillStyle = "#666666";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = 48 + "px monospace";
    let txt = "game paused";
    ctx.fillText(txt, canvas.width / 2, canvas.height / 2);

    ctx.restore();
  }
  pauseDrawn = true;
}

// draw player only (multiple scenes)
function drawPlayer(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY) {
  // draw player
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
}

// draw environment
function drawEnvironment(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY) {
  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      let tile = gameMap.getTile("overworld", chunkID, r, c);
      let _x = (c - startCol) * tileSize + offsetX;
      let _y = (r - startRow) * tileSize + offsetY;

      let offset = getSpriteOffset(tilePositions[tile]['row'], tilePositions[tile]['col']);
      ctx.drawImage(
        spriteSheet,
        offset['dx'],
        offset['dy'],
        tileSize,
        tileSize,
        Math.round(_x),
        Math.round(_y),
        tileSize,
        tileSize
      );
    }
  }
}

// UI on screen
// function drawUI() { }

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

  let chunkID = gameMap.getChunkID(player.chunkRow, player.chunkCol);

  drawEnvironment(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY);


  // simulate day/night
  simTime += timeStep;
  // day to night
  let playerLight, nightSky;
  if (simTime < 100) {
    nightSky = mapRange(simTime, 0, 100, 0, 0.8);
    playerLight = mapRange(simTime, 50, 100, 0, 0.2);
    // night to day
  } else if (simTime < 200) {
    nightSky = mapRange(simTime, 100, 200, 0.8, 0);
    playerLight = mapRange(simTime, 100, 150, 0.2, 0);
  } else {
    simTime = 0;
    nightSky = 0;
    playerLight = 0;
  }

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

  // draw overlay
  ctx.fillStyle = "rgba(0,0,0," + nightSky + ")";
  ctx.fillRect(0, 0, canvas.width, canvas.height);


  // update enemies in chunk, draw enemies in view (above light)
  ctx.save();
  // ctx.globalAlpha = nightSky; ---> alpha char based on daylight?

  let enemiesInChunk = gameMap.enemies.filter(enemy => (enemy.getChunkID() == chunkID));
  let npcsInChunk = gameMap.npcs.filter(npc => (npc.getChunkID() == chunkID));

  enemiesInChunk.forEach(enemy => enemy.update());
  npcsInChunk.forEach(npc => npc.update());

  let npcsInView = npcsInChunk.filter(npc => (npc.row >= startRow && npc.col <= endCol));
  let enemiesInView = enemiesInChunk.filter(enemy => (enemy.row >= startRow && enemy.col <= endCol));
  let charactersInView = [].concat(npcsInView, enemiesInView);
  // let enemiesInView = enemiesInChunk.filter(enemy => (enemy.row >= startRow && enemy.col <= endCol));
  for (let i = 0; i < charactersInView.length; i++) {
    let _x = (charactersInView[i].col - startCol) * tileSize + offsetX;
    let _y = (charactersInView[i].row - startRow) * tileSize + offsetY;
    let offset = getSpriteOffset(tilePositions[charactersInView[i].sprite]['row'], tilePositions[charactersInView[i].sprite]['col']);
    let tw = tileSize / 2;

    ctx.fillStyle = "rgba(247,172,59," + playerLight / 2 + ")";
    ctx.beginPath();
    ctx.arc(_x + tw, _y + tw, 25, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();

    ctx.drawImage(
      spriteSheet,
      offset['dx'],
      offset['dy'],
      tileSize,
      tileSize,
      Math.round(_x),
      Math.round(_y),
      tileSize,
      tileSize
    );
  }
  drawPlayer(startRow, endRow, startCol, endCol, chunkID, offsetX, offsetY);
  //enemiesInView.forEach(enemy => enemy.draw());
  //console.log(enemiesInChunk, enemiesInView);

  ctx.restore();


  // draw a light around the player
  ctx.fillStyle = "rgba(247,172,59," + playerLight + ")";
  ctx.beginPath();
  ctx.arc(player.screenX, player.screenY, 50, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();

  // DEBUG TEXT
  ctx.fillStyle = "#ffffff";
  ctx.font = 18 + "px monospace";
  let txt = "Chunk ID [" + player.chunkRow + ":" + player.chunkCol + "]";
  ctx.fillText(txt, 10, 30);
  txt = "Row [" + player.row + "] Col [" + player.col + "]";
  ctx.fillText(txt, 10, 50);
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
  gameMap = new mapHandler(chunksRow, chunksCol, mapWidth, mapHeight, numRandomNPCs);
  english_towns_cities = {};

  player = new Player();
  camera = new Camera(gameMap.mapWidth, gameMap.mapHeight, canvas.width, canvas.height);
  camera.follow(player);
  camera.update();

  spriteSheet = new Image();
  spriteSheet.src = "./assets/colored_transparent_packed.png";
  spriteSheet.onload = stateHandler;//draw;
}