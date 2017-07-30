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


/*
board for test
  this.gameBoard = [
    [1,2,1,2,1,2,1,2],
    [3,4,3,4,3,4,3,4],
    [1,2,1,2,1,2,1,2],
    [3,4,3,4,3,4,3,4],
    [1,2,1,2,1,2,1,2],
    [3,4,3,4,3,4,3,4],
    [1,2,1,2,1,2,1,2],
    [3,4,3,4,3,4,3,4]
  ];
*/
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

BejeweledGame.prototype.checkGameover = function(){
  // 먼저 가로를 체크한다.
  // 일단 나 다음번째가 같은 종류의 보석인지, 그렇다면 나의 대각선과 다음번째의 대각선에 같은 종류의 보석이 하나라도 있는지.
  // 만약 아니라면 나의 다음 다음번째가 같은 종류의 보석인지, 그렇다면 나의 왼쪽위 왼쪽 아래가 같은 종류의 보석인지 체크하기.

  // 체크시 범위가 넘어가지 않도록 잘 조절해야 한다.

  var leftDxDy = [[-1,-1],[-1,1]];

  var rightDxDy = [[2,-1],[2,1]];

  for(var y = 0; y < BOARD_HEIGHT; y++){
    for(var x = 0; x < BOARD_WIDTH - 1; x++){
      var jewel = this.gameBoard[y][x];

      if( jewel === this.gameBoard[y][x+1]){
        for(var i=0; i<2; i++){
          if(y + leftDxDy[i][1] < 0 || y + leftDxDy[i][1] >= BOARD_HEIGHT || x + leftDxDy[i][0] < 0 || x + leftDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + leftDxDy[i][1]][x + leftDxDy[i][0]] === jewel ) return false;
          if(y + rightDxDy[i][1] < 0 || y + rightDxDy[i][1] >= BOARD_HEIGHT || x + rightDxDy[i][0] < 0 || x + rightDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + rightDxDy[i][1]][x + rightDxDy[i][0]] === jewel ) return false;
        }
      }else if(jewel === this.gameBoard[y][x+2]){
        for(var i=0; i<2; i++){
          if(y + rightDxDy[i][1] < 0 || y + rightDxDy[i][1] >= BOARD_HEIGHT || x + rightDxDy[i][0] < 0 || x + rightDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + rightDxDy[i][1]][x + rightDxDy[i][0]] === jewel ) return false;
        }
      }
    }
  }

  var topDxDy = [[-1,-1],[1,-1]];
  var bottomDxDy = [[-1,2],[1,2]];

  // 이번엔 세로
  for(var x = 0; x < BOARD_WIDTH; x++){
    for(var y = 0; y < BOARD_HEIGHT - 1; y++){
      var jewel = this.gameBoard[y][x];

      if( jewel === this.gameBoard[y+1][x]){
        for(var i=0; i<2; i++){
          if(y + topDxDy[i][1] < 0 || y + topDxDy[i][1] >= BOARD_HEIGHT || x + topDxDy[i][0] < 0 || x + topDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + topDxDy[i][1]][x + topDxDy[i][0]] === jewel ) return false;
          if(y + bottomDxDy[i][1] < 0 || y + bottomDxDy[i][1] >= BOARD_HEIGHT || x + bottomDxDy[i][0] < 0 || x + bottomDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + bottomDxDy[i][1]][x + bottomDxDy[i][0]] === jewel ) return false;
        }
      }else if(jewel === this.gameBoard[y+1][x]){
        for(var i=0; i<2; i++){
          if(y + bottomDxDy[i][1] < 0 || y + bottomDxDy[i][1] >= BOARD_HEIGHT || x + bottomDxDy[i][0] < 0 || x + bottomDxDy[i][0] >= BOARD_WIDTH) continue;
          if(this.gameBoard[y + bottomDxDy[i][1]][x + bottomDxDy[i][0]] === jewel ) return false;
        }
      }
    }
  }

  return true;
}

function draw_bejeweledGame() {
  // swap이 되어야 하는지 체크 해야 함
  // gameboard를 그려야 함
  // 보석이 선택 되었는지 아닌지 체크해서 색깔변화를 주어야 함

  // swapping?
  if (game.swap.length) {
    var swap1_y = game.swap[0][0];
    var swap1_x = game.swap[0][1];

    var swap2_y = game.swap[1][0];
    var swap2_x = game.swap[1][1];

    if ((game.swap_counter > 2 && !game.clean_swap) || ((game.swap_counter > 1 && game.clean_swap))) {
      var tmp = game.gameBoard[swap1_y][swap1_x];
      var tmp_swap = game.swap;

      game.gameBoard[swap1_y][swap1_x] = game.gameBoard[swap2_y][swap2_x];
      game.gameBoard[swap2_y][swap2_x] = tmp;
      game.swap = [];
      game.swap_counter = 0;

      //일단 위에서 사용자가 선택한 블록을 swap 해 봤는데 check 했더니 점수가 안나오는 상황이면 다시 되돌려 놓는다.
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

      if (sprite_id === -1) {
        continue;
      }

      var jewel = game.jewels[sprite_id];
      var draw_x = x * 32;
      var draw_y = y * 32;


      // selected?
      // 일단 보류
      if (game.selected[0] === y && game.selected[1] === x) {
        //game.context.fillStyle = "lightgrey";
        //game.context.fillRect(x * 32, y * 32, 32, 32);
      }

      if (game.clean_swap) {
        var speed = swap_count * 32;
      } else {
        var speed = swap_count * 16;
      }

      if (swap1_y === y && swap1_x === x) {
        draw_x += (swap2_x - swap1_x) * speed;
        draw_y += (swap2_y - swap1_y) * speed;
      }

      if (swap2_y === y && swap2_x === x) {
        draw_x += (swap1_x - swap2_x) * speed;
        draw_y += (swap1_y - swap2_y) * speed;
      }else{
        if(game.checkGameover()){
            game.isGameover = true;
        }
      }

      p5Object.image(jewel, draw_x, draw_y);
    }
  }

  draw_score(game.score,0,0);
  draw_state(game.isGameover,0,0);
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
      console.log(game.gameBoard);
    }
    p.mouseClicked = function(){
      // p5의 좌표 받아오기 방식 사용
      if(game.isGameover) return; //gameover되면 클릭 안되도록 한다.
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
