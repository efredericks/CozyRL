// globals
let ctx, canvas;
let tileSize = 16;
let tileScale = 32;
let spriteSheet;

// map globals (in cells)
let mapWidth = 250;//500;//1000;
let mapHeight = 250;//500;//1000;
let chunksRow = 5;
let chunksCol = 5;

// global objects
let gameMap;
let camera;
let player;

// handle keyboard
function handleKeys(e) {
  //console.log(e.keyCode);

  let dirX = 0;
  let dirY = 0;
  let updateViz = false;

  switch (e.keyCode) {
    case 37: // left
      dirX = -1;
      updateViz = true;
      break;
    case 38: // up
      dirY = -1;
      updateViz = true;
      break;
    case 39: // right
      dirX = 1;
      updateViz = true;
      break;
    case 40: // down
      dirY = 1;
      updateViz = true;
      break;
    default:
      ;
      break;
  }

  if (updateViz) {
    player.move(dirX, dirY);
    camera.update();
  }
}

let Player = function () {
  this.x = (gameMap.mapWidth/2) * tileSize + (tileSize/2);//canvas.width / 2;
  this.y = (gameMap.mapHeight/2) * tileSize + (tileSize/2);//canvas.height / 2;
  this.screenX = this.x;
  this.screenY = this.y;

  this.move = function (dirX, dirY) {
    this.x += dirX * tileSize;//256;
    this.y += dirY * tileSize;//256;

    // check collision

    let maxX = gameMap.mapWidth * tileSize;
    let maxY = gameMap.mapHeight * tileSize;

    this.x = Math.max(0, Math.min(this.x, maxX));
    this.y = Math.max(0, Math.min(this.y, maxY));
  }
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

  if (endRow >= gameMap.mapWidth)
    endRow = gameMap.mapWidth - 1;
  if (endCol >= gameMap.mapHeight)
    endCol = gameMap.mapHeight - 1;

  //console.log(startCol, endCol, startRow, endRow, gameMap.mapWidth, gameMap.mapHeight);

        //let offset = getSpriteOffset(tilePositions[_tile]['row'], tilePositions[_tile]['col']);

  for (let r = startRow; r <= endRow; r++) {
    for (let c = startCol; c <= endCol; c++) {
      let tile = gameMap.getTile("overworld", "0:0", r, c);
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
    player.screenX - tileSize/2,
    player.screenY - tileSize/2,
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