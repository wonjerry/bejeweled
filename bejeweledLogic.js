var BOARD_WIDTH = 8;
var BOARD_HEIGHT = 8;
var JEWELS = [1, 2, 3, 4, 5];
var p5Object;

function BejeweledGame() {

  var self = this;

  self.gameBoard = [];
  self.selected = [];
  self.jewels = [];

  self.swap = [];
  self.swap_counter = 0;
  // 같은 보석 종류를 찾아서 -1로 만들었을 경우 그걸 없애는 시간이 clean up 하는 의미라서 이런 변수명으로 만들어 둔 것 같다.
  self.clean_swap = false;
  self.isGameover = false;
  self.score = 0;
}

BejeweledGame.prototype.init = function() {

  for(var i =1; i<=5; i++){
    this.jewels.push(p5Object.loadImage("image/"+ i +".png"));
  }

  for (var i = 0; i < BOARD_HEIGHT; i++) {
    var row = [];
    for (var j = 0; j < BOARD_WIDTH; j++) {
      var r = Math.floor(Math.random() * this.jewels.length);
      row.push(r);
    }
    this.gameBoard.push(row);
  }
  this.check_board();
}

BejeweledGame.prototype.check_board = function() {
  var scores = [];

  // 수평으로 탐색하며 연속으로 같은 종류의 보석이 몇 개 나왔는지 체크하고 점수 계산을 위해 scores 배열에 넣는다.
  for (var y = 0; y < BOARD_HEIGHT; y++) {
    var items = [
      [y, 0]
    ];
    for (var x = 1; x < BOARD_WIDTH; x++) {
      if (this.gameBoard[y][x] != this.gameBoard[items[0][0]][items[0][1]]) {
        //이 부분에서 같은 jewel의 개수가 4개 이상이면 특별한 숫자로 바꾸어 폭발하는 블록을 생성하도록 하는 작업을 해 주어도 될 듯 하다.
        if (items.length > 2)
          for (var i = 0; i < items.length; i++) scores.push(items[i]);
        items = [];
      }
      items.push([y, x]);
    }
    if (items.length > 2)
      for (var i = 0; i < items.length; i++) scores.push(items[i]);
  }

  // 수직으로 탐색하며 연속으로 같은 종류의 보석이 몇 개 나왔는지 체크하고 점수 계산을 위해 scores 배열에 넣는다.
  for (var x = 0; x < BOARD_WIDTH; x++) {
    var items = [
      [0, x]
    ];
    for (var y = 1; y < BOARD_HEIGHT; y++) {
      if (this.gameBoard[y][x] != this.gameBoard[items[0][0]][items[0][1]]) {
        //이 부분에서 같은 jewel의 개수가 4개 이상이면 특별한 숫자로 바꾸어 폭발하는 블록을 생성하도록 하는 작업을 해 주어도 될 듯 하다.
        if (items.length > 2)
          for (var i = 0; i < items.length; i++) scores.push(items[i]);
        items = [];
      }
      items.push([y, x]);
    }
    if (items.length > 2)
      for (var i = 0; i < items.length; i++) scores.push(items[i]);
  }

  var result = [];

  for (var i = 0; i < scores.length; i++) {
    if (this.gameBoard[scores[i][0]][scores[i][1]] > -1) {
      result.push(scores[i]);
      this.gameBoard[scores[i][0]][scores[i][1]] = -1;
    }
  }

  if (result.length){
    this.clean_board();
    this.score += scores.length;
  }

  return result.length;
}

BejeweledGame.prototype.clean_board = function() {
  this.clean_swap = true;
  for (var x = 0; x < 8; x++) {
    for (var y = 7; y > 0; y--) {
      if (this.gameBoard[y][x] == -1 && this.gameBoard[y - 1][x] != -1) {
        this.swap = [
          [y, x],
          [y - 1, x]
        ];
        return;
      }
    }
  }
  this.clean_swap = false;
  this.refill_board();
  this.check_board();
}

BejeweledGame.prototype.refill_board = function() {
  for (var x = 0; x < 8; x++)
    for (var y = 0; y < 8; y++)
      if (this.gameBoard[y][x] == -1) this.gameBoard[y][x] = Math.floor(Math.random() * 5);
}

BejeweledGame.prototype.run = function() {
  this.init();
};

// 이 방식은 다인용을 구현할 경우 p5 객체를 만드는 방식으로 바뀔 것이다.

function draw_bejeweledGame() {
  // swap이 되어야 하는지 체크 해야 함
  // gameboard를 그려야 함
  // 보석이 선택 되었는지 아닌지 체크해서 색깔변화를 주어야 함

  // swapping?
  if (game.swap.length) {
    var swap1_y = game.swap[0][0],
      swap1_x = game.swap[0][1];
    var swap2_y = game.swap[1][0],
      swap2_x = game.swap[1][1];

    if ((game.swap_counter > 2 && !game.clean_swap) || ((game.swap_counter > 1 && game.clean_swap))) {
      var tmp = game.gameBoard[swap1_y][swap1_x];
      var tmp_swap = game.swap;

      game.gameBoard[swap1_y][swap1_x] = game.gameBoard[swap2_y][swap2_x];
      game.gameBoard[swap2_y][swap2_x] = tmp;
      game.swap = [];
      game.swap_counter = 0;


      if (!game.clean_swap) {
        var score = game.check_board();
        if (!score) {
          var tmp = game.gameBoard[swap1_y][swap1_x];
          game.gameBoard[swap1_y][swap1_x] = game.gameBoard[swap2_y][swap2_x];
          game.gameBoard[swap2_y][swap2_x] = tmp;
        }
      }
      game.clean_board();
    } else {
      var swap_count = game.swap_counter++;
    }
  }

  for (var y = 0; y < 8; y++) {
    for (var x = 0; x < 8; x++) {
      var sprite_id = game.gameBoard[y][x];

      if (sprite_id == -1) {
        continue;
      }

      var jewel = game.jewels[sprite_id];
      var draw_x = x * 32;
      var draw_y = y * 32;


      // selected?
      // 일단 보류
      if (game.selected[0] == y && game.selected[1] == x) {
        //game.context.fillStyle = "lightgrey";
        //game.context.fillRect(x * 32, y * 32, 32, 32);
      }

      if (game.clean_swap) {
        var speed = swap_count * 32;
      } else {
        var speed = swap_count * 16;
      }

      if (swap1_y == y && swap1_x == x) {
        draw_x += (swap2_x - swap1_x) * speed;
        draw_y += (swap2_y - swap1_y) * speed;
      }

      if (swap2_y == y && swap2_x == x) {
        draw_x += (swap1_x - swap2_x) * speed;
        draw_y += (swap1_y - swap2_y) * speed;
      }

      p5Object.image(jewel, draw_x, draw_y);
    }
  }

  draw_score(game.score,0,0);
  draw_state(false,0,0);
}

function draw_score(score,Sx,Sy){
  var str = "SCORE";
  p5Object.push();
  p5Object.translate(0+Sx,276+Sy);
  p5Object.rect(0, 0, 120, 50);
  p5Object.text(str, 10, 20);
  p5Object.text(score||0, 10, 45);
  p5Object.pop();
}

function draw_state(isGameover,Sx,Sy){
  p5Object.push();
  p5Object.translate(130+Sx,276+Sy);
  p5Object.rect(0, 0, 120, 50);

  if(isGameover){
    p5Object.text("GAME OVER", 10, 35);
    p5Object.pop();
    return;
  }

  p5Object.pop();
}

var p5sketch = function(p) {
    p5Object = p;
    p.setup = function() {
        p.createCanvas(256,500);
        p.textSize(20);
        game = new BejeweledGame();
        game.run();
      }
    p.draw = function(){
      p.clear();
      draw_bejeweledGame();
    }
    p.mouseClicked = function(){
      // p5의 좌표 받아오기 방식 사용
      var x = p.mouseX;
      var y = p.mouseY;

      var gameBoard_x = Math.floor(x / 32);
      var gameBoard_y = Math.floor(y / 32);

      if (game.selected.length) {
        // only y OR x can change
        if (gameBoard_y != game.selected[0] && gameBoard_x != game.selected[1]) {
          game.selected = [];
          return;
        }
        if (Math.abs(gameBoard_y - game.selected[0]) > 1 || Math.abs(gameBoard_x - game.selected[1]) > 1) {
          game.selected = [];
          return;
        }

        // swap
        game.swap.push([game.selected[0], game.selected[1]]);
        game.swap.push([gameBoard_y, gameBoard_x]);

        game.selected = [];
      } else {
        game.selected = [gameBoard_y, gameBoard_x];
      }
    }
  }

  new p5(p5sketch, 'myp5sketch');
