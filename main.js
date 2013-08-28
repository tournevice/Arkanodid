var canvas;
var ctx;
var tev;
var tevBonus;
var stop;
var boxx = 2;
var boxy = 10;
var boxwidth = 400;
var boxheight = 320;
var bricks;
var brickColor = ["blue", "yellow", "red", "green"];
var score = 0;
var highscore = 0;
var totalBricks;
var totalBricksHit;
var levels = 2;
var currentLevel = 1;
var angleX = 2;
var angleY = -4;
var brickWidth = 40;
var brickHeight = 20;
var padWidth = 50;
var padHeight = 10
var ballrad = 4;
var bonusWidth = 15;
var bonusHeight = 10;

var boxboundx;
var boxboundy;
var inboxboundx;
var inboxboundy;

var cursor;
var requestId;

var ballSpeed = 15;
var bonusSpeed = 20;
var lost = false;

/************************************/
/* General functions                */
/************************************/			

function bonus(id, bonusMethod, posX, posY) {
	this.image = new Image();
	this.image.src = id + '.gif';
	this.funcBonus = bonusMethod;
	this.width = bonusWidth;
	this.height = bonusHeight;
	this.posX = posX + brickWidth / 2;
	this.posY = posY;
	this.activated = true;
}

bonus.prototype = {
	draw: function() {
		ctx.drawImage(this.image, this.posX, this.posY, this.width, this.height);
	},
	move: function() {
		this.posY += 1;
		this.draw();
		if (manager.pad.padY == this.posY) {
			clearInterval(tevBonus);
			if (this.posX >= manager.pad.padX && this.posX <= manager.pad.padX + padWidth) {
				this.funcBonus();
			}
		}
	},
	play: function() {
		if (this.activated) {
			tevBonus = setInterval(
				     (function(self) {         //Self-executing func which takes 'this' as self
				         return function() {   //Return a function in the context of 'self'
				             self.move(); //Thing you wanted to run as non-window 'this'
				         }
				     })(this),
				     this.INTERVAL     //normal interval, 'this' scope not impacted here.
				 ); 
		}
		//this.funcBonus();
	}
}

function brick(value, x, y) {
	this.width = brickWidth;
	this.height = brickHeight;
	this.value = value;
	this.posXInf = boxx + (this.width * x);
	this.posYInf = boxy + (this.height * y);
	this.posXSup = this.posXInf + this.width;
	this.posYSup = this.posYInf + this.height;
	this.brickboundx = this.posXSup + ballrad;
	this.inbrickboundy = this.posYInf + ballrad;
	this.inbrickboundx = this.posXInf - ballrad;
	this.brickboundy = this.posYSup - ballrad;
	if (value != 0) {
		this.image = new Image();
		this.image.src = 'brick' + value + '.gif';
		if (value != 'x') {
			this.currentBreaks = 0;
		}
	}
	
}


brick.prototype = {
	draw: function() {
		if (this.image != null) {
			if (this.currentBreaks >= 1) {
				this.image.src = 'brick' + this.value + '_broken' + this.currentBreaks + '.gif';
				ctx.drawImage(this.image, this.posXInf, this.posYInf,this.width, this.height);
			}
			else {
				ctx.drawImage(this.image, this.posXInf, this.posYInf,this.width, this.height);
			}
		}
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
				if (levels[l][b] == 2) {
					bricks[l][b].bonus = new bonus('bonus1', bonusScore, bricks[l][b].posXInf, bricks[l][b].posYSup);
				}
				cntBricks += 1;
			}
		}
	}
	totalBricks = cntBricks;
}

function bonusScore() {
	score += 15;
	document.getElementById("currentScore").innerText = score;
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

function winGame() {
	return totalBricksHit == totalBricks;
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

window.addEventListener('load', function() {
	canvas = document.getElementById('canvas');
	if (!canvas || !canvas.getContext) {
		return;
	}
	
	ctx = canvas.getContext('2d');
	if (!ctx) {
		return;
	}
	
	init();
}, false);

window.addEventListener("keydown", function (e) {
  keys[e.keyCode] = false;
  keys[37] = false;
  keys[38] = false;
  keys[39] = false;
  
	// Top
	if (e.keyCode == 38) {
		if (stop) {
			doRestart();
		}
	}
	
  	if (e.keyCode == 37) {
  		keys[37] = true;
  	}
  	
  	if (e.keyCode == 39) {
  		keys[39] = true;
  	}
});
window.addEventListener("keyup", function (e) {
  keys[e.keyCode] = false;
  
  keys[37] = false;
  keys[38] = false;
  keys[39] = false;
});

function init(){
	manager = new Manager();
  clearInterval(tev);
  var level = "level" + currentLevel + ".txt";
  stop = true;
  loadFile(level, fillBricks);
  
  document.getElementById("area").style.backgroundImage = "url('background_level" + currentLevel + ".gif')";
  //ctx.strokeRect(boxx, boxy, boxwidth, boxheight);
	manager.init();
	if (score > highscore) {
		highscore = score;
	}
	if (lost) {
		score = 0;
	}
	
	totalBricksHit = 0;
	lost = false;
	document.getElementById("highscore").innerText = highscore;
	document.getElementById("currentScore").innerText = score;
	document.getElementById("currentLevel").innerText = currentLevel;
}

function playLoop() {
	whatKey();
	manager.movePad();
	requestId = requestAnimationFrame(playLoop);
}
  
  
function movePad() {
	manager.movePad
}


var keys = [];
var velX = 0;
var maxSpeed = 5;

function doRestart() {
	init();
	stop = false;
	//document.getElementById("btn").innerText = "stop";
	tev = setInterval(moveBall, ballSpeed);
	playLoop();
}

function doStop() {
	//init();
	stop = true;
	window.cancelAnimationFrame(requestId);
	clearInterval(tev);
	clearInterval(tevBonus);
	//document.getElementById("btn").innerText = "restart";
	//window.removeEventListener('keydown', getKeyAndMove, false);

}

function whatKey() {
	// Left
	if (keys[37]) {
		//velX = -10;
		if (velX > -maxSpeed) {
		  velX -= 10;
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
	//this.image = new Image();
	
}

Manager.prototype = {
	init: function() {
		var posPadX = (boxwidth / 2) - (padWidth / 4);
		var posPadY = boxheight - boxy/ 2;
		var posBallX = posPadX + (padWidth / 2);
		var posBallY = posPadY - 20;
		this.pad = new Pad(posPadX, posPadY, padWidth, padHeight); 
		this.myball = new Ball(posBallX, posBallY, ballrad);
		boxboundx = boxwidth + boxx - ballrad * 2;
		boxboundy = this.pad.padY - ballrad;
		inboxboundx = boxx + ballrad;
		inboxboundy = boxy + ballrad;
		
		//this.drawBackground();
		this.myball.draw();
		drawBricks();
		this.pad.draw();
		//ctx.fill();
	},
	drawBackground: function() {
		//ctx.drawImage(this.image, boxx, boxy, boxwidth, boxheight);
	},
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
		
		var win = false;

		if (isBrick) {
			// limite droite de la brique
			if (nbally > brick.inbrickboundy && nbally < brick.brickboundy) {
				this.myball.posvX = -this.myball.posvX;
				nballx = this.myball.posX;
			}
			//else
			// limite gauche de la brique
			//if (nballx >= brick.inbrickboundx) {
			//	this.myball.posvX = -this.myball.posvX;
			//	nballx = this.myball.posX;
			//}
			//else
			// limite supérieure de la brique
			else if (nbally>= brick.inbrickboundy) {
				//this.myball.posvY = angleY;
				//nbally = this.myball.posY - this.myball.posvY;
				this.myball.posvY = -this.myball.posvY;
				nbally = this.myball.posY;
			}
			//else
			// limite inférieure de la brique
			else if (nbally <= brick.brickboundy) {
				//this.myball.posvY = angleY;
				//nbally = this.myball.posY - this.myball.posvY;
				this.myball.posvY = -this.myball.posvY;
				nbally = this.myball.posY;
			}
			
			win = winGame();
		}
		else {
			// Rebond droit
			if (nballx > boxboundx) {
				this.myball.posvX = -this.myball.posvX;
				nballx = boxboundx;
			}
			
			// Rebond gauche
			if (nballx < inboxboundx) {
				nballx = inboxboundx;
				this.myball.posvX = -this.myball.posvX;
			}
			
			// Rebond haut
			if (nbally < inboxboundy) {
				nbally = inboxboundy;						
				this.myball.posvY = -this.myball.posvY;
			}
				
			// Rebond bas (pad ou vide)
			if (nbally > boxboundy) {
				if (nballx < this.pad.padX - this.myball.rad || nballx > this.pad.padX + this.pad.padWidth + this.myball.rad) {
					lost = true;
				}
				else {
					nbally = boxboundy;
					
					var angle10Left = this.pad.padX + (this.pad.padWidth * (10/100));
					var angle20Left = this.pad.padX + (this.pad.padWidth* (20/100));
					var angle30Left = this.pad.padX + (this.pad.padWidth* (30/100));
					var angle10Right = this.pad.padX + this.pad.padWidth - (this.pad.padWidth * (10/100));
					var angle20Right = this.pad.padX + this.pad.padWidth - (this.pad.padWidth* (20/100));
					var angle30Right = this.pad.padX + this.pad.padWidth - (this.pad.padWidth* (30/100));

					if (((this.myball.posX >= angle20Left && this.myball.posX < angle30Left) && this.myball.posvX > 0) || ((this.myball.posX >= angle30Right && this.myball.posX < angle20Right) && this.myball.posvX < 0 )) {
						if ((this.myball.posX >= angle20Left && this.myball.posX < angle30Left) && this.myball.posvX > 0) {
							this.myball.posvX = -(Math.abs(angleX) + 1);
							this.myball.posvY = -(Math.abs(angleY) - 1);
						}
						if ((this.myball.posX >= angle30Right && this.myball.posX < angle20Right) && this.myball.posvX < 0) {
							
							this.myball.posvX = Math.abs(angleX) + 1;
							this.myball.posvY = -(Math.abs(angleY) - 1);
						}
						
						nballx = this.myball.posX + this.myball.posvX;
						nbally = this.myball.posY + this.myball.posvY;
					}
					else if (((this.myball.posX >= angle10Left && this.myball.posX < angle20Left) && this.myball.posvX > 0) || ((this.myball.posX >= angle20Right && this.myball.posX < angle10Right) && this.myball.posvX < 0 )) {
						if ((this.myball.posX >= angle10Left && this.myball.posX < angle20Left) && this.myball.posvX > 0) {
							this.myball.posvX = -(Math.abs(angleX) + 2);
							this.myball.posvY = -(Math.abs(angleY) - 2);
						}
						if ((this.myball.posX >= angle20Right && this.myball.posX < angle10Right) && this.myball.posvX < 0) {
							
							this.myball.posvX = Math.abs(angleX) + 2;
							this.myball.posvY = -(Math.abs(angleY) - 2);
						}
						
						nballx = this.myball.posX + this.myball.posvX;
						nbally = this.myball.posY + this.myball.posvY;
					}
					else if ((nballx < angle10Left && this.myball.posvX > 0) || (nballx > angle10Right && this.myball.posvX < 0 )) {
						if (nballx < angle10Left && this.myball.posvX > 0) {
							this.myball.posvX = -(Math.abs(angleX) + 3);
							this.myball.posvY = -(Math.abs(angleY) - 3);
						}
						if (nballx > angle10Right && this.myball.posvX < 0) {
							
							this.myball.posvX = Math.abs(angleX) + 3;
							this.myball.posvY = -(Math.abs(angleY) - 3);
						}
						
						nballx = this.myball.posX + this.myball.posvX;
						nbally = this.myball.posY + this.myball.posvY;
					}
					else {
						this.myball.posvY = angleY;
						if (this.myball.posvX < 0) {
							this.myball.posvX = -angleX;
						}
						else {
							this.myball.posvX = angleX;
						}
						nbally = this.myball.posY + this.myball.posvY;
						nabllx = this.myball.posX + this.myball.posvX;
						//this.myball.posvX = -this.myball.posvX;
					}
				}
			}
		}
		
		if (!lost) {
			if (win)
			{
				alert("Gagné!");
				currentLevel += 1;
				doStop();
			}
			else {
				this.myball.posX = nballx;
				this.myball.posY = nbally;
			}
		}
		else {
			alert("Perdu! :(");
			doStop();
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
					brick.currentBreaks += 1;
					if (brick.currentBreaks == brick.value) {
						if (brick.bonus != null) {
							brick.bonus.play();
						}
						brick.value = "0";
						totalBricksHit += 1;
					}
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
	this.image = new Image();
	this.image.src = 'ball.gif';
}

Ball.prototype = {
	move: function() {
		this.clear();
		//this.moveandcheck();
		this.draw();
	},
	draw: function() {
		//ctx.fillStyle = "black";
		//ctx.beginPath();
		//ctx.arc(this.posX, this.posY, this.rad, 0, Math.PI * 2, true);
		ctx.drawImage(this.image, this.posX, this.posY, this.rad * 2, this.rad * 2);
		//ctx.fill();
		
	},
	clear: function() {
		ctx.clearRect(boxx, boxy, boxwidth, boxheight);
		//ctx.clearRect(boxx, boxy, this.rad *2, this.rad * 2);
	}
}
 
function Pad(x,y,width,height) {
	this.padX = x;
	this.padY = y;
	this.padWidth = width;
	this.padHeight = height;
	this.image = new Image();
	this.image.src = 'pad.gif';
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
		//ctx.fillRect(this.padX, this.padY, this.padWidth, this.padHeight);
		ctx.drawImage(this.image, this.padX, this.padY, this.padWidth, this.padHeight);
	},
	clear: function() {
		//ctx.clearRect(this.padX - ball.rad + 1, this.padY - 1, this.padWidth + ball.rad + 1, this.padHeight * 2);
	}
}

 

