var snake = new Array();
var direction = {x: 1, y: 0};
var food;
var s = 500;

function setup() {
  createCanvas(s, s);
  resetGame();
  frameRate(10);

  socket = new WebSocket("ws://" + document.location.hostname + "/ws");

  socket.onmessage = function(event) {
    var e = JSON.parse(event.data);
    if (e.event == "move") {
      if (e.x < 0 && direction.x == 0) {
        direction = {x: -1, y: 0};
      } else if (e.x > 0 && direction.x == 0) {
        direction = {x: 1, y: 0};
      } else if (e.y < 0 && direction.y == 0) {
        direction = {x: 0, y: -1};
      } else if (e.y > 0 && direction.y == 0) {
        direction = {x: 0, y: 1};
      }
    }
  }
}

function draw() {
  stroke(255);
  fill(0);
  rect(0, 0, s - 1, s - 1);
  stroke(255);

  for (var i = snake.length - 1; i > 0; i--) {
    snake[i].x = snake[i - 1].x;
    snake[i].y = snake[i - 1].y;
  }

  snake[0].x += direction.x;
  snake[0].y += direction.y;

  if (snake[0].x > s / 10) { snake[0].x = 0; }
  else if (snake[0].x < 0) { snake[0].x = s / 10; }
  else if (snake[0].y > s / 10) { snake[0].y = 0; }
  else if (snake[0].y < 0) { snake[0].y = s / 10; }

  if (snake[0].x == food.x && snake[0].y == food.y) {
    spawnFood();
    snake.push({x: snake[snake.length - 1].x, y: snake[snake.length - 1].y});
  }

  for (var i = 0; i < snake.length; i++) {
    fill(0, 255 - 255 * (i / snake.length), 0);


    rect(snake[i].x * 10, snake[i].y * 10, 10, 10);

    if (i > 0 && snake[i].x == snake[0].x && snake[i].y == snake[0].y) {
      resetGame();
    }
  }

  fill(200, 0, 0);
  rect(food.x * 10, food.y * 10, 10, 10);
}

function keyPressed() {
  if (keyCode === LEFT_ARROW && direction.x == 0) {
    direction = {x:-1,y:0};
  } else if (keyCode === RIGHT_ARROW && direction.x == 0) {
    direction = {x:1,y:0};
  } else if (keyCode === UP_ARROW && direction.y == 0) {
    direction = {x:0,y:-1};
  } else if (keyCode === DOWN_ARROW && direction.y == 0) {
    direction = {x:0,y:1};
  }
}

function spawnFood() {
  food = {x: floor(random(0, s / 10)), y: floor(random(0, s / 10))};
}

function resetGame() {
  snake = new Array();
  spawnFood();
  for (var i = 0; i < 5; i++) {
    snake.push({x:0,y:0});
  }
}
