
$(document).keypress(function(e) {   //CHECKS INPUT AND CHANGES DIRECTION
    let dir = SnakeGame.player.direction;
    switch(e.which) {
        case 119:
            if (dir !== "DOWN"){
                SnakeGame.player.direction = 'UP'; }
            break;
        case 100:
            if (dir !== "LEFT"){
                SnakeGame.player.direction = 'RIGHT'; }
            break; 
        case 115:
            if (dir !== "UP"){
                SnakeGame.player.direction = 'DOWN'; }
            break;
        case 97:
            if ((dir !== "RIGHT") && (dir !== 'NONE')){
                SnakeGame.player.direction = 'LEFT'; }
            break;
        default:
            if (dir == 'NONE'){
              SnakeGame.player.direction = 'NONE';    
            }
        };    
    });

function init(heightY,widthX) {        //CREATES BOARD
    for (var i=0;i<heightY;i++){
        let tableRow = $('<tr/>');

        for (var j=0;j<widthX;j++){

            let sector = $('<td/>').addClass("board_section").attr( {'data-x':j,'data-y':i});
            tableRow.append(sector);  
        }
        $(".board").append(tableRow);
    }
}

Coordinate = (x,y) => {                  //FINDS DOM ELEMENT OF COORDINATE
    return $('td[data-x ="' + x + '"][data-y ="' + y + '"]');
}

$(".play_again").click(function() {
    Scores.push(SnakeGame.score)
    delete SnakeGame;
    $(".board_section").remove();
    $('tr').remove();
    $(".highScore").text(Math.max.apply(null, Scores));
    new Audio('/views/click.mp3').play();

    SnakeGame = new game(15,15);
    $(".end_game").hide();
    $(".scorecount").text(SnakeGame.score);
    
})


class Snake {
    constructor(x,y,length){
        this.x = x;
        this.y = y;
        this.snakeLen = length;
        this.direction = 'NONE';
        this.snakePos = [[x,y],[x-1,y],[x-2,y]];
        this.snakeEatingAud = new Audio('/views/snake_eating.mp3');
    }
    switchDir(dir) {

        switch(dir){
            case 'UP':
                this.y--;
                break;
            case 'RIGHT':
                this.x++;
                break;
            case 'DOWN':
                this.y++;
                break;
            case 'LEFT':
                this.x--;
                break;
            default:
                break;
        }

        if (SnakeGame.player.direction !== 'NONE'){
            this.snakePos.unshift([this.x,this.y]);
        
            for (var i=0;i<this.snakePos.length;i++){
                if (i>this.snakeLen-1){
                    if (!SnakeGame.logic()){
                       // Coordinate(this.snakePos[i][0],this.snakePos[i][1]).removeClass("snake_head");  
                         Coordinate(this.snakePos[i][0],this.snakePos[i][1]).removeClass("snake_tail");  
                         Coordinate(this.snakePos[i][0],this.snakePos[i][1]).removeClass("snake");  
                        this.snakePos.splice(i,1);   
                    }
                }}  
        }
    }

    eatFruit() {
        if ((this.x == SnakeGame.fruit.fruitX) && (this.y == SnakeGame.fruit.fruitY)){
            this.snakeLen ++;
            Coordinate(SnakeGame.fruit.fruitX,SnakeGame.fruit.fruitY).removeClass("fruit");
            delete SnakeGame.fruit;
            this.snakeEatingAud.play();
            SnakeGame.score++;
            $(".scorecount").text(SnakeGame.score);
            SnakeGame.fruit = new fruit(SnakeGame.boardX,SnakeGame.boardY);
        }
    }
}

class first_fruit {
    constructor(X,Y){
        this.fruitX = X;
        this.fruitY = Y;
         Coordinate(this.fruitX,this.fruitY).addClass("fruit");
    }
}



class fruit {
    constructor(X,Y) {
        this.fruitX = X;
        this.fruitY = Y;
        this.checkCord(X,Y);
    }
   
    checkCord(X,Y) {
        var fX = Math.floor(Math.random() * X);
        var fY = Math.floor(Math.random() * Y);
        let potCord = [fX,fY];
        var contains = SnakeGame.player.snakePos.some(function (ele){
            return JSON.stringify(ele) === JSON.stringify(potCord);
        })
        if (!contains){
            Coordinate(fX,fY).addClass("fruit");
            this.fruitX = fX;
            this.fruitY = fY;
        } else (this.checkCord(X,Y))
    }


}

class game {
    constructor(boardX,boardY){
        this.boardX = boardX;
        this.boardY = boardY;
        this.score = 0;
          init(this.boardX,this.boardY);
          this.gameOver = false;
          this.player = new Snake(4,7,3);
          this.fruit = new first_fruit(11,7);
          this.beginGame();     
      }

    beginGame () {
        var begin = setInterval(function() {

          if (!SnakeGame.gameOver){
            SnakeGame.player.switchDir(SnakeGame.player.direction);
            SnakeGame.player.eatFruit();
            SnakeGame.logic();
            if (!SnakeGame.gameOver){

                SnakeGame.player.snakePos.map(function(coord){
        
                    if ((coord[0] == SnakeGame.player.x) && (coord[1] == SnakeGame.player.y)) {
                        
                        Coordinate(coord[0],coord[1]).addClass("snake_head"); 
        
                    } else if ((coord[0] == SnakeGame.player.snakePos[SnakeGame.player.snakePos.length-1][0]) && (coord[1] == SnakeGame.player.snakePos[SnakeGame.player.snakePos.length-1][1])){
                        Coordinate(coord[0],coord[1]).addClass("snake_tail");
             
                    }
                    else {Coordinate(coord[0],coord[1]).addClass("snake");Coordinate(coord[0],coord[1]).removeClass("snake_head")}
                    })
                }
            } else {clearInterval(begin);$(".end_game").css("display","flex"),500}                   
        } ,150)
        
    }

      logic(){
        if (SnakeGame.player.x >= this.boardX || SnakeGame.player.y >= this.boardY){
            this.gameOver = true;
            new Audio('/views/border_impact.mp3').play();
            return true;
        }
        if (SnakeGame.player.x < 0 || SnakeGame.player.y < 0){
            this.gameOver = true;
            new Audio('/views/border_impact.mp3').play();
            return true;
        } 
        if ([...new Set(this.player.snakePos.map(pair => JSON.stringify(pair)))].length !== this.player.snakePos.length){
            this.gameOver = true;
            return true;
        }

        return false;     
      } 
  }


const Scores = [];

  
$(document).ready(function() {

    SnakeGame = new game(15,15)  

})

    







