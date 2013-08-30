var canvas;
var ctx;
var tev;
var stop;
var boxx = 2;
var boxy = 10;
var boxwidth = 400;
var boxheight = 320;
var bricks;
var brickBonus = [bonusScore, bonusShot, bonusBall, bonusSuperBall, bonusLife];
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
var superballrad = 6;
var bonusWidth = 15;
var bonusHeight = 10;

var boxboundx;
var boxboundy;
var inboxboundx;
var inboxboundy;

var cursor;
var requestId;

var ballSpeed = 15;
var superballSpeed = 10;
var bonusSpeed = 17;
var lost = false;
var bonusDuration = 5000;

var padImg = 'pad.gif';
var padShotImg = 'pad_shot.gif';
var ballImg = 'ball.gif';
var superBallImg = 'superball.gif';

var shoots = [];
var bonuss = [];
var balls = [];

var lives = 3;
var resetLevel = true;

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
	this.tevBonus;
}

bonus.prototype = {
	draw: function() {
		ctx.drawImage(this.image, this.posX, this.posY, this.width, this.height);
	},
	move: function() {
		this.clear();
		this.posY += 1;
		this.draw();
		if (manager.pad.padY == this.posY) {
			this.clear();
			clearInterval(this.tevBonus);
			var i = bonuss.indexOf(this);
			bonuss.splice(i, 1);
			if (this.posX >= manager.pad.padX && this.posX <= manager.pad.padX + padWidth) {
				this.funcBonus();
			}
		}
	},
	play: function() {
		if (this.activated) {
			this.tevBonus = setInterval(
				     (function(self) {         //Self-executing func which takes 'this' as self
				         return function() {   //Return a function in the context of 'self'
				             self.move(); //Thing you wanted to run as non-window 'this'
				         }
				     })(this),
				     10     //normal interval, 'this' scope not impacted here.
				 ); 
		}
		//this.funcBonus();
	},
	clear: function() {
		ctx.clearRect(this.posX, this.posY, this.width, this.height);
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
		ctx.clearRect(this.posXInf, this.posYInf,this.width, this.height);
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
			if (levels[l][b] == "0") {
				bricks[l][b] = null;
			}
			else {
				bricks[l][b] = new brick(levels[l][b], b, l);
				if (levels[l][b] != "x") {
					var randomnumber = Math.floor(Math.random() * brickBonus.length);
					if (levels[l][b] >= 1) {
						bricks[l][b].bonus = new bonus('bonus1', brickBonus[randomnumber], bricks[l][b].posXInf, bricks[l][b].posYSup);
						bonuss.push(bricks[l][b].bonus);
					}
					cntBricks += 1;
				}
			}
		}
	}
	totalBricks = cntBricks;
}

function clearAllIntervals() {
	for (var s = 0; s < balls.length; s++) {
		clearInterval(balls[s].tev);
		clearTimeout(balls[s].tevTimeOut);
	}
	
	for (var s = 0; s < shoots.length; s++) {
		clearInterval(shoots[s].tevShoot);
	}
	
	for (var b = 0; b < bonuss.length; b++) {
		clearInterval(bonuss[b].tevBonus);
	}
}

//////////////////////////////////
// Bonus Methods
//////////////////////////////////

function bonusScore() {
	score += 15;
	document.getElementById("currentScore").innerText = score;
}

function bonusShot() {
	manager.pad.isPadShot = true;
}

function bonusBall() {
	var posBallX = manager.pad.padX + (padWidth / 2);
	var posBallY = manager.pad.padY - 20;

	var ball = new Ball(posBallX, posBallY, ballrad);
	ball.play();
}

function bonusSuperBall() {
	for (var b = 0; b < balls.length; b++) {
		balls[b].doSuperball();
	}
}

function bonusLife() {
	lives += 1;
	document.getElementById("lives").innerText = lives;
}


//////////////////////////////////

function drawBricks() {
	for(var l = 0; l < bricks.length; l++) {
		for (var b = 0; b < bricks[l].length; b++) {
			if (bricks[l][b] != null && bricks[l][b].value != "0") {
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
		else if (this.manager.pad.isPadShot) {
			this.manager.shoot();
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
  //clearInterval(tev);
  clearAllIntervals();
  ctx.clearRect(boxx, boxy, boxwidth, boxheight);
  
  if (lost && lives == 0) {
  	currentLevel = 1;
  	lives = 3;
	score = 0;
  	resetLevel = true;
  }
  
  if (resetLevel) {
	  totalBricksHit = 0;
	  var level = "level" + currentLevel + ".txt";
	  loadFile(level, fillBricks);
  }
  
  stop = true;
  document.getElementById("area").style.backgroundImage = "url('background_level" + currentLevel + ".gif')";
  //ctx.strokeRect(boxx, boxy, boxwidth, boxheight);
	manager.init();
	if (score > highscore) {
		highscore = score;
	}

	lost = false;
	document.getElementById("highscore").innerText = highscore;
	document.getElementById("currentScore").innerText = score;
	document.getElementById("currentLevel").innerText = currentLevel;
	document.getElementById("lives").innerText = lives;
	
}

function playLoop() {
	whatKey();
	//ctx.clearRect(boxx, boxy, boxwidth, boxheight);
	manager.movePad();
	//moveBall();
	drawBricks();
	if (!stop) {
		requestId = requestAnimationFrame(playLoop);
	}
}
  
  
function movePad() {
	manager.movePad
}


var keys = [];
var velX = 0;
var maxSpeed = 5;

function doRestart() {
	//init();
	stop = false;
	//document.getElementById("btn").innerText = "stop";
	//tev = setInterval(moveBall, ballSpeed);
	manager.moveBall();
	playLoop();
}

function doStop() {
	//init();
	stop = true;
	window.cancelAnimationFrame(requestId);
	//clearInterval(tev);
	clearAllIntervals();
	init();
	//clearInterval(tevBonus);
	//clearInterval(tevShoot);
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
		this.doubleBall = false;
		this.tevTimeout;
		
		//this.drawBackground();
		this.myball.draw();
		drawBricks();
		this.pad.draw();
		//ctx.fill();
	},
	movePad: function() {
		this.pad.clear();
		this.pad.move();
	},
	moveBall: function() {
		//this.myball.clear();
		//moveandcheck(this.myball, this.pad);
		this.myball.play();
		//drawBricks();
	},
	shoot: function() {
		var shoot = new Shoot(this.pad.padX + Math.floor(this.pad.padWidth / 2), this.pad.padY);
		shoots.push(shoot);
		shoot.doShoot();
		this.tevTimeout = setTimeout(
				     (function(self) {         //Self-executing func which takes 'this' as self
				         return function() {   //Return a function in the context of 'self'
				             self.resetPad(); //Thing you wanted to run as non-window 'this'
				         }
				     })(this),
				     bonusDuration//this.INTERVAL     //normal interval, 'this' scope not impacted here.
			); 

		//var b = getBrick(this.padShotX, this.padShotY);
		//var isBrick = checkBrick(b);
		//if (isBrick) {
		//	clearInterval(this.tevShoot);
		//	var i = shoots.indexOf(this);
		//	shoots.splice(i, 1);
		//	this.clearShoot();
		//}
	},
	resetPad: function() {
		clearInterval(this.tevTimeout);
		this.pad.isPadShot = false;
	}
}

function moveandcheck(ball, pad) {
		// on anticipe le d�placement de la balle
		// en x...
		var nballx = ball.posX + ball.posvX;
		// ... et en y
		var nbally = ball.posY + ball.posvY;
		
		var brick = getBrick(nballx, nbally);
		var isBrick = checkBrick(brick, ball.damages);
		
		var win = false;

		if (isBrick) {
			// limite droite de la brique
			if (!ball.superball && nbally > brick.inbrickboundy && nbally < brick.brickboundy) {
				ball.posvX = -ball.posvX;
				nballx = ball.posX;
			}
			//else
			// limite gauche de la brique
			//if (nballx >= brick.inbrickboundx) {
			//	ball.posvX = -ball.posvX;
			//	nballx = ball.posX;
			//}
			//else
			// limite supérieure de la brique
			else if (!ball.superball && nbally>= brick.inbrickboundy) {
				//ball.posvY = angleY;
				//nbally = ball.posY - ball.posvY;
				ball.posvY = -ball.posvY;
				nbally = ball.posY;
			}
			//else
			// limite inférieure de la brique
			else if (!ball.superball && nbally <= brick.brickboundy) {
				//ball.posvY = angleY;
				//nbally = ball.posY - ball.posvY;
				ball.posvY = -ball.posvY;
				nbally = ball.posY;
			}
			
			win = winGame();
		}
		else {
			// Rebond droit
			if (nballx > boxboundx) {
				ball.posvX = -ball.posvX;
				nballx = boxboundx;
			}
			
			// Rebond gauche
			if (nballx < inboxboundx) {
				nballx = inboxboundx;
				ball.posvX = -ball.posvX;
			}
			
			// Rebond haut
			if (nbally < inboxboundy) {
				nbally = inboxboundy;						
				ball.posvY = -ball.posvY;
			}
				
			// Rebond bas (pad ou vide)
			if (nbally > boxboundy) {
				if (nballx < pad.padX - ball.rad || nballx > pad.padX + pad.padWidth + ball.rad) {
					lost = true;
				}
				else {
					nbally = boxboundy;
					
					var angle10Left = pad.padX + (pad.padWidth * (10/100));
					var angle20Left = pad.padX + (pad.padWidth* (20/100));
					var angle30Left = pad.padX + (pad.padWidth* (30/100));
					var angle10Right = pad.padX + pad.padWidth - (pad.padWidth * (10/100));
					var angle20Right = pad.padX + pad.padWidth - (pad.padWidth* (20/100));
					var angle30Right = pad.padX + pad.padWidth - (pad.padWidth* (30/100));

					if (((ball.posX >= angle20Left && ball.posX < angle30Left) && ball.posvX > 0) || ((ball.posX >= angle30Right && ball.posX < angle20Right) && ball.posvX < 0 )) {
						if ((ball.posX >= angle20Left && ball.posX < angle30Left) && ball.posvX > 0) {
							ball.posvX = -(Math.abs(angleX) + 1);
							ball.posvY = -(Math.abs(angleY) - 1);
						}
						if ((ball.posX >= angle30Right && ball.posX < angle20Right) && ball.posvX < 0) {
							
							ball.posvX = Math.abs(angleX) + 1;
							ball.posvY = -(Math.abs(angleY) - 1);
						}
						
						nballx = ball.posX + ball.posvX;
						nbally = ball.posY + ball.posvY;
					}
					else if (((ball.posX >= angle10Left && ball.posX < angle20Left) && ball.posvX > 0) || ((ball.posX >= angle20Right && ball.posX < angle10Right) && ball.posvX < 0 )) {
						if ((ball.posX >= angle10Left && ball.posX < angle20Left) && ball.posvX > 0) {
							ball.posvX = -(Math.abs(angleX) + 2);
							ball.posvY = -(Math.abs(angleY) - 2);
						}
						if ((ball.posX >= angle20Right && ball.posX < angle10Right) && ball.posvX < 0) {
							
							ball.posvX = Math.abs(angleX) + 2;
							ball.posvY = -(Math.abs(angleY) - 2);
						}
						
						nballx = ball.posX + ball.posvX;
						nbally = ball.posY + ball.posvY;
					}
					else if ((nballx < angle10Left && ball.posvX > 0) || (nballx > angle10Right && ball.posvX < 0 )) {
						if (nballx < angle10Left && ball.posvX > 0) {
							ball.posvX = -(Math.abs(angleX) + 3);
							ball.posvY = -(Math.abs(angleY) - 3);
						}
						if (nballx > angle10Right && ball.posvX < 0) {
							
							ball.posvX = Math.abs(angleX) + 3;
							ball.posvY = -(Math.abs(angleY) - 3);
						}
						
						nballx = ball.posX + ball.posvX;
						nbally = ball.posY + ball.posvY;
					}
					else {
						ball.posvY = angleY;
						if (ball.posvX < 0) {
							ball.posvX = -angleX;
						}
						else {
							ball.posvX = angleX;
						}
						nbally = ball.posY + ball.posvY;
						nabllx = ball.posX + ball.posvX;
						//ball.posvX = -ball.posvX;
					}
				}
			}
		}
		
		if (!lost) {
			if (win)
			{
				alert("Gagné!");
				currentLevel += 1;
				resetLevel = true;
				doStop();
			}
			else {
				ball.posX = nballx;
				ball.posY = nbally;
			}
		}
		else {
			clearInterval(ball.tev);
			clearTimeout(ball.tevTimeOut);
			var i = balls.indexOf(ball);
			balls.splice(i, 1);
			ball.id = -1;
			if (balls.length == 0) {
				lives -= 1;
				resetLevel = false;
				alert("Perdu! :(");
				doStop();
			}
			else {
				lost = false;
			}
		}
		
	}

function getBrick(nposx, nposy) {
		var brick = null;
		var x = Math.floor((nposx + ballrad / 4 - boxx) / brickWidth);
		var y = Math.floor((nposy + ballrad / 4 - boxy) / brickHeight);
		
		if (x >= 0 && y >= 0) {
			brick = bricks[y][x];
		}
		
		return brick;
	}
	
function checkBrick(brick, damages) {
		var isBrick = false;
		if (brick != null) {
			isBrick = brick.value != "0";
		
			if (isBrick) {
				if (brick.value != "x") {
					score += parseInt(brick.value);
					document.getElementById("currentScore").innerText = score;
					brick.currentBreaks += damages;
					if (brick.currentBreaks >= brick.value) {
						if (brick.bonus != null) {
							brick.bonus.play();
						}
						brick.value = "0";
						brick.clear();
						totalBricksHit += 1;
					}
				}
			}
		}

		return isBrick;
	}

function Shoot(posX, posY) {
	this.padShotX = posX;
	this.padShotY = posY;
	this.shotSpeed = 10;
	this.tevShoot;
	this.damages = 1;
}

Shoot.prototype = {
	doShoot: function(){
		//if (this.pad.isPadShot) {
		
			this.tevShoot = setInterval(
				     (function(self) {         //Self-executing func which takes 'this' as self
				         return function() {   //Return a function in the context of 'self'
				             self.draw(); //Thing you wanted to run as non-window 'this'
				         }
				     })(this),
				     30//this.INTERVAL     //normal interval, 'this' scope not impacted here.
			); 
			
		//}
	},
	draw: function() {
		this.clear();
		
		ctx.beginPath();
			
		//this.shotSpeed += 1;
		if (this.padShotY > boxy) {
			ctx.moveTo(this.padShotX, this.padShotY);
			ctx.lineTo(this.padShotX, this.padShotY - this.shotSpeed);
			ctx.stroke();
			this.padShotY = this.padShotY - this.shotSpeed;
		}
		else {
			clearInterval(this.tevShoot);
			var i = shoots.indexOf(this);
			shoots.splice(i, 1);
			this.clear();
		}
		
		ctx.closePath();
		
		var b = getBrick(this.padShotX, this.padShotY);
		var isBrick = checkBrick(b, this.damages);
		if (isBrick) {
			clearInterval(this.tevShoot);
			var i = shoots.indexOf(this);
			shoots.splice(i, 1);
			this.clear();
		}
		
		var win = winGame();
		if (win) {
			alert("Gagné!");
			currentLevel += 1;
			doStop();
		}
	},
	clear: function() {
		ctx.clearRect(Math.floor(this.padShotX) - 5, Math.floor(this.padShotY), 6, this.shotSpeed);
	}
}

function Ball(x,y,rad) {
	this.posX = x;
	this.posY = y;
	this.posvX = angleX;
	this.posvY = angleY;
	this.rad = rad;
	this.speed = ballSpeed;
	this.image = new Image();
	this.image.src = 'ball.gif';
	this.damages = 1;
	this.superball = false;
	this.tev;
	this.tevTimeOut;
	balls.push(this);
	this.id = balls.length;
}

Ball.prototype = {
	move: function() {
		//this.clear();
		//this.moveandcheck();
		this.draw();
	},
	moveBall: function() {
		this.clear();
		moveandcheck(this, manager.pad);
		if (this.id == -1) {
			this.clear();
		}
		else {
			this.move();
		}
	},
	play: function() {
		this.tev = setInterval(
			     (function(self) {         //Self-executing func which takes 'this' as self
			         return function() {   //Return a function in the context of 'self'
			             self.moveBall(); //Thing you wanted to run as non-window 'this'
			         }
			     })(this),
			     this.speed     //normal interval, 'this' scope not impacted here.
			 ); 
	},
	draw: function() {
		//ctx.fillStyle = "black";
		//ctx.beginPath();
		//ctx.arc(this.posX, this.posY, this.rad, 0, Math.PI * 2, true);
		ctx.drawImage(this.image, this.posX, this.posY, this.rad * 2, this.rad * 2);
		//ctx.fill();
		
	},
	doSuperball: function() {
		if (!this.superball) {
			this.image.src = superBallImg;
			this.rad = superballrad;
			this.damages = 99;
			this.superball = true;
			this.speed = superballSpeed;
			
			clearInterval(this.tev);
			this.play();
			
			this.tevTimeOut = setTimeout(
					     (function(self) {         //Self-executing func which takes 'this' as self
					         return function() {   //Return a function in the context of 'self'
					             self.resetBall(); //Thing you wanted to run as non-window 'this'
					         }
					     })(this),
					     bonusDuration//this.INTERVAL     //normal interval, 'this' scope not impacted here.
				); 
		}
	},
	resetBall: function() {
		this.clear();
		this.image.src = ballImg;
		this.rad = ballrad;
		this.superball = false;
		this.speed = ballSpeed;
		
		clearTimeout(this.tevTimeOut);
		clearInterval(this.tev);
		this.play();
	},
	clear: function() {
		//ctx.clearRect(boxx, boxy, boxwidth, boxheight);
		ctx.clearRect(Math.floor(this.posX), this.posY, this.rad * 2, this.rad * 2);
	}
}
 
function Pad(x,y,width,height) {
	this.padX = x;
	this.padY = y;
	this.padWidth = width;
	this.padHeight = height;
	this.image = new Image();
	//this.image.src = padImg;
	this.isPadShot = false;
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

		//this.clear();
		this.padX = ncursorx;
		this.draw();
		
		velX = 0;
	},
	draw: function() {
		if (this.isPadShot) {
			this.image.src = padShotImg;
		}
		else {
			this.image.src = padImg;
		}
		
		ctx.drawImage(this.image, this.padX, this.padY, this.padWidth, this.padHeight);
	},
	clear: function() {
		ctx.clearRect(Math.floor(this.padX), Math.floor(this.padY), this.padWidth, this.padHeight);
	}
}

 

