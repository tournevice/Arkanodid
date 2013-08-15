var canvas;
var ctx;
var tev;
var stop;
var boxx = 20;
var boxy = 30;
var boxwidth = 700;
var boxheight = 550;
var bricks;
var brickColor = ["blue", "yellow", "red", "green"];
var score = 0;
var highscore = 0;
var totalBricks;
var totalBricksHit;
var levels = 2;
var currentLevel = 1;
var angleX = 2;
var angleY = -6;
var brickWidth = 50;
var brickHeight = 30;
var ballrad = 6;


var boxboundx;
var boxboundy;
var inboxboundx;
var inboxboundy;

var cursor;
var requestId;


/************************************/
/* Objects                          */
/************************************/


/************************************/
/* General functions                */
/************************************/			


function brick(value, x, y) {
	this.width = brickWidth;
	this.height = brickHeight;
	this.value = value;
	this.posXInf = boxx + (this.width * x);
	this.posYInf = boxy + (this.height * y);
	this.posXSup = this.posXInf + this.width;
	this.posYSup = this.posYInf - this.height;
	this.brickboundx = this.posXSup + ballrad;
	this.brickboundy = this.posYSup + ballrad;
	this.inbrickboundx = this.posXInf - ballrad;
	this.inbrickboundy = this.posYInf - ballrad;
}


brick.prototype = {
	draw: function() {
		if (this.value != "x") {
			ctx.fillStyle = brickColor[parseInt(this.value) - 1];
		}
		else {
			ctx.fillStyle = "lightgray";
		}
		ctx.lineWidth=1;
		ctx.fillRect(this.posXInf, this.posYInf,this.width, this.height);
		
		//ctx.fill();
		ctx.strokeRect(this.posXInf, this.posYInf,this.width, this.height);
	},
	clear: function() {
		//alert("clearing " + this.value + " at position " + this.posX + "," + this.posY);
	}
}

function drawBrick(b) {
	//var b = new brick(value, line, index);
	b.clear();
	b.draw();
}

function fillBricks(oData) {
	var level = oData;
	var levels = level.split(/[\r\n]+/);
	var cntBricks = 0;
	bricks = new Array(levels.length);
	for (var l = 0; l < levels.length; l++) {
		bricks[l] = new Array(levels[l].length);
		for (var b = 0; b < levels[l].length; b++) {
			//bricks[l][b] = levels[l][b];
			bricks[l][b] = new brick(levels[l][b], b, l);
			if (levels[l][b] != "0" && levels[l][b] != "x") {
				cntBricks += 1;
			}
		}
	}
	totalBricks = cntBricks;
}

function drawBricks() {
	for(var l = 0; l < bricks.length; l++) {
		for (var b = 0; b < bricks[l].length; b++) {
			if (bricks[l][b].value != "0") {
				drawBrick(bricks[l][b]);
			}	
		}
	}
}
 
function moveBall() {
	manager.moveBall();
}

function endGame() {
	var end = false;
	if (totalBricksHit == totalBricks) {
		end = true;
	}
	return end;
}

/************************************/
/* Events                          */
/************************************/
//var pad;
var manager;

(function () {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

function init() {
  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

	initManager();
	//requestAnimationFrame(movePad);
}

function initManager(){
  clearInterval(tev);
  manager = new Manager();
  var level = "level" + currentLevel + ".txt";
  stop = true;
  loadFile(level, fillBricks);
  
  ctx.strokeRect(boxx, boxy, boxwidth, boxheight);
	
  manager.moveBall();
  playLoop();
}

window.addEventListener("keydown", function (e) {
  keys[e.keyCode] = true;
});
window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
});

var keys = [];
var velX = 0;
var maxSpeed = 5;

function doRestart() {
	stop = false;
	document.getElementById("btn").innerText = "stop";
	tev = setInterval(moveBall, 25);
}

function doStop() {
	window.cancelAnimationFrame(requestId);
	clearInterval(tev);
	document.getElementById("btn").innerText = "restart";
	//window.removeEventListener('keydown', getKeyAndMove, false);
	stop = true;
	initManager();
}

function whatKey() {
	// Left
	if (keys[37]) {
		//velX = -10;
		if (velX > -maxSpeed) {
		  velX -= 10;
		}
	}

	// Top
	if (keys[38]) {
		if (stop) {
			doRestart();
		}
	}
	
	// Right
	if (keys[39]) {
		//velX = 10;
		if (velX < maxSpeed) {
		  velX += 10;
		}
	}
}
  
function Manager() {
	this.pad = new Pad(335, 560, 80, 10); 
	this.myball = new Ball(375, 530, ballrad);
	boxboundx = boxwidth + boxx - ballrad;
	boxboundy = this.pad.padY - ballrad;
	inboxboundx = boxx + ballrad;
	inboxboundy = boxy + ballrad;
}

Manager.prototype = {
	movePad: function() {
		this.pad.move();
	},
	moveBall: function() {
		this.moveandcheck();
		this.myball.move();
		drawBricks();
	},
	moveandcheck: function() {
		// on anticipe le d�placement de la balle
		// en x...
		var nballx = this.myball.posX + this.myball.posvX;
		// ... et en y
		var nbally = this.myball.posY + this.myball.posvY;
		
		var brick = this.getBrick(nballx, nbally);
		var isBrick = this.checkBrick(brick);
		
		var lost = false;

		if (isBrick) {
			// limite droite de la brique
			if (this.myball.posX >= brick.brickboundx) {
				this.myball.posvX = -this.myball.posvX;
				nballx = this.myball.posX;
			}
			//else
			// limite gauche de la brique
			if (this.myball.posX <= brick.inbrickboundx) {
				this.myball.posvX = -this.myball.posvX;
				nballx = this.myball.posX;
			}
			//else
			// limite supérieure de la brique
			if (this.myball.posY >= brick.inbrickboundy) {
				this.myball.posvY = -this.myball.posvY;
				nbally = this.myball.posY;
			}
			//else
			// limite inférieure de la brique
			if (this.myball.posY <= brick.brickboundy) {
				this.myball.posvY = -this.myball.posvY;
				nbally = this.myball.posY;
			}
		}
		else {
			// Rebond droit
			if (nballx > boxboundx || isBrick) {
				this.myball.posvX = -this.myball.posvX;
				nballx = boxboundx;
			}
			
			// Rebond gauche
			if (nballx < inboxboundx || isBrick) {
				nballx = inboxboundx;
				this.myball.posvX = -this.myball.posvX;
			}
			
			// Rebond haut
			if (nbally < inboxboundy || isBrick) {
				nbally = inboxboundy;						
				this.myball.posvY = -this.myball.posvY;
			}
				
			// Rebond bas
			if (nbally > boxboundy) {
				if (nballx < this.pad.padX - this.myball.rad || nballx > this.pad.padX + this.pad.padWidth + this.myball.rad) {
					//alert("Perdu! :(");
					lost = true;
				}
				else {
					nbally = boxboundy;
					this.myball.posvY = -this.myball.posvY;
				}
			}
		}
		
		if (!lost) {
			this.myball.posX = nballx;
			this.myball.posY = nbally;
		}
		else {
			doStop();
			//playLoop();
		}
	},
	getBrick : function(nposx, nposy) {
		var brick = null;
		var x = Math.floor((nposx + this.myball.rad / 4 - boxx) / brickWidth);
		var y = Math.floor((nposy + this.myball.rad / 4 - boxy) / brickHeight);
		
		if (x >= 0 && y >= 0) {
			brick = bricks[y][x];
		}
		
		return brick;
	},
	checkBrick: function(brick) {
		var isBrick = false;
		if (brick != null) {
			isBrick = brick.value != "0";
		
			if (isBrick) {
				if (brick.value != "x") {
					score += parseInt(brick.value);
					document.getElementById("currentScore").innerText = score;
					brick.value = "0";
					totalBricksHit += 1;
				}
			}
		}

		return isBrick;
	}
}


function Ball(x,y,rad) {
	this.posX = x;
	this.posY = y;
	this.posvX = angleX;
	this.posvY = angleY;
	this.rad = rad;
}

Ball.prototype = {
	move: function() {
		this.clear();
		//this.moveandcheck();
		this.draw();
	},
	draw: function() {
		ctx.fillStyle = "black";
		ctx.beginPath();
		ctx.arc(this.posX, this.posY, this.rad, 0, Math.PI * 2, true);
		ctx.fill();
	},
	clear: function() {
		//ctx.clearRect(this.posX, this.posY, this.rad, this.rad);
		ctx.clearRect(boxx, boxy, boxwidth, boxheight);
	}
}
 
function Pad(x,y,width,height) {
	this.padX = x;
	this.padY = y;
	this.padWidth = width;
	this.padHeight = height;
}

Pad.prototype = {
	move: function() {
		// on anticipe le d�placement du pad (sur l'axe des x)
		var ncursorx = this.padX;
		ncursorx += velX;
		
		// v�rification limite gauche
		if (ncursorx < boxx + ballrad) {
			ncursorx = boxx + ballrad;
		}
		
		// v�rification limite droite
		if (ncursorx > boxwidth + boxx - this.padWidth - ballrad) {
			ncursorx = boxwidth + boxx - this.padWidth - ballrad;
		}

		this.clear();
		this.padX = ncursorx;
		this.draw();
		
		velX = 0;
	},
	draw: function() {
		ctx.fillRect(this.padX, this.padY, this.padWidth, this.padHeight);
	},
	clear: function() {
		//ctx.clearRect(this.padX - ball.rad + 1, this.padY - 1, this.padWidth + ball.rad + 1, this.padHeight * 2);
	}
}

function playLoop() {
	whatKey();
	
	manager.movePad();
	requestId = requestAnimationFrame(playLoop);
}
  
  
function movePad() {
	manager.movePad
}
 

function drawPad() {
	cursor.draw();
}

function triggerEvent() {
	if (!stop) {
		doStop();
	}
	else {
		doRestart();
	}
}
