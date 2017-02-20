var COLS = 20, //quantity of colums
ROWS = 20, // quantity of rows
EMPTY = 0, //empty space on grid
SNAKE = 1, //part of snake on grid
FRUIT = 2, //fruit on grid
// Directions
LEFT  = 0, 
UP    = 1,
RIGHT = 2,
DOWN  = 3,
//Keys
KEY_LEFT  = 37,
KEY_UP    = 38,
KEY_RIGHT = 39,
KEY_DOWN  = 40,
aux_cols, //quantity of colums
aux_rows, // quantity of rows
canvas,	  //canvas HTML
ctx,	  // Canvas2d 
keystate, 
frames,   //user for animations
score, maxScore = 0,	  //store the score
maxScore, //max score
fruit_position, // used for update the fruit position
interval, record = false, //interval to generate foods

grid = {
	width: null,  
	height: null, 
	_grid: null,  
	
	/**
	 * Initiate and fill a c x r grid with the value of d
	 */	 
	init: function(d, c, r) {
		this.width = c;
		this.height = r;
		this._grid = [];
		for (var x=0; x < c; x++) {
			this._grid.push([]);
			for (var y=0; y < r; y++) {
				this._grid[x].push(d);
			}
		}
	},

	resize: function (c, r) {		
		this.width = c;
		this.height = r;
		canvas.width = c*20;
		canvas.height = r*20;
	},
	
	/**
	 * Set the value of the grid cell at (x, y)	
	 */
	set: function(val, x, y) {
		this._grid[x][y] = val;
	},
	/**
	 * Get the value of the cell at (x, y)	 
	 */
	get: function(x, y) {
		return this._grid[x][y];
	}
},

/**
 * The snake, works as a queue 
 */
snake = {
	direction: null, //current direction of snake
	last: null,		 //reference to last element of snake
	_queue: null,	 //data structure 
	
	/**
	 * Clears the queue and sets the start position and direction
	 */
	init: function(d, x, y) {
		this.direction = d;
		this._queue = [];
		this.insert(x, y);
	},
	
	/**
	 * Adds an element to the queue	 
	 */
	insert: function(x, y) {
		// unshift prepends an element to an array
		this._queue.unshift({x:x, y:y});
		this.last = this._queue[0];
	},
	/**
	 * Removes and returns the first element in the queue.	 	
	 */
	remove: function() {
		// pop returns the last element of an array
		return this._queue.pop();
	},
	/**
	* Revert the order of dataStructure to reverse the direction of snake
	*/
	reverse: function () {
		this._queue.reverse();
		this.last = this._queue[0];
	},

	length: function () {
		return this._queue.length;
	}
};

/**
* return a random x,y empty cordinate from the grid
*/
function getRandomEmptyPosition() {
	var empty = [];
	// iterate through the grid and find all empty cells
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			if (grid.get(x, y) === EMPTY) {
				empty.push({x:x, y:y});
			}
		}
	}
	// chooses a random cell
	return empty[Math.round(Math.random()*(empty.length - 1))];
}

/**
 * Set a food id at a random free cell in the grid
 */
function setFood() {	
	if(fruit_position) grid.set(EMPTY, fruit_position.x, fruit_position.y);
	var randpos = getRandomEmptyPosition();
	fruit_position = {x:randpos.x, y:randpos.y};
	grid.set(FRUIT, randpos.x, randpos.y);		
}

/**
 * Starts the game
 */
function main() {
	// create and initiate the canvas element
	canvas = document.createElement("canvas");
	canvas.width = COLS*20;
	canvas.height = ROWS*20;
	ctx = canvas.getContext("2d");
	// add the canvas element to the body of the document
	document.body.appendChild(canvas);
	ctx.font = "12px Helvetica";
	frames = 0;
	keystate = {};
	// keeps track of the keybourd input
	document.addEventListener("keydown", function(evt) {
		keystate[evt.keyCode] = true;
	});
	document.addEventListener("keyup", function(evt) {
		delete keystate[evt.keyCode];
	});
	// intatiate game objects and starts the game loop
	init();
	loop();
}

/**
 * Init the game
 */
function init() {
	record = false;
	alert("Jogar?");	
	document.getElementsByTagName('body')[0].click();
	aux_rows = ROWS;
	aux_cols = COLS;		
	score = 0;
	grid.resize(COLS, ROWS);
	grid.init(EMPTY, COLS, ROWS);
	var sp = {x:Math.floor(COLS/2), y:ROWS-1};
	snake.init(UP, sp.x, sp.y);
	grid.set(SNAKE, sp.x, sp.y);
	setFood();
	interval = setInterval(function () {
		setFood();
	}, (Math.random()*6) + 4 * 1000);	
}
/**
 * The game loop function, used for game updates and rendering
 */
function loop() {
	update();
	draw();
	// When ready to redraw the canvas call the loop function
	// first. Runs about 60 frames a second
	window.requestAnimationFrame(loop, canvas);
}
/**
 * Updates the game logic
 */
function update() {
	frames++;
	// changing direction of the snake depending on which keys
	// that are pressed
	if (keystate[KEY_LEFT] && snake.direction !== RIGHT) {
		snake.direction = LEFT;
	}
	if (keystate[KEY_UP] && snake.direction !== DOWN) {
		snake.direction = UP;
	}
	if (keystate[KEY_RIGHT] && snake.direction !== LEFT) {
		snake.direction = RIGHT;
	}
	if (keystate[KEY_DOWN] && snake.direction !== UP) {
		snake.direction = DOWN;
	}
	// each five frames update the game state.
	if (frames%15 === 0) {
		// pop the last element from the snake queue i.e. the
		// head
		var nx = snake.last.x;
		var ny = snake.last.y;
		// updates the position depending on the snake direction
		switch (snake.direction) {
			case LEFT:
				nx--;
				break;
			case UP:
				ny--;
				break;
			case RIGHT:
				nx++;
				break;
			case DOWN:
				ny++;
				break;
		}
		// checks all gameover conditions
		if (0 > nx || nx > grid.width-1 || 0 > ny || ny > grid.height-1){
			if(snake.length()>=aux_cols || snake.length()>=aux_rows){
				return init();
			}
			snake.reverse();
			var nx = snake.last.x;
			var ny = snake.last.y;
			if(snake)
			switch (snake.direction) {
			case LEFT:
				grid.resize(--aux_cols, aux_rows);
				snake.direction = RIGHT;				
				nx++;
				break;
			case UP:
				grid.resize(aux_cols, --aux_rows);
				snake.direction = DOWN;				
				ny++;
				break;
			case RIGHT:
				grid.resize(--aux_cols, aux_rows);
				snake.direction = LEFT;				
				nx--;
				break;
			case DOWN:
				grid.resize(aux_cols, --aux_rows);
				snake.direction = UP;											
				ny--;
				break;
		}	
		}else if(grid.get(nx, ny) === SNAKE){
			return init();
		}
		// check wheter the new position are on the fruit item
		if (grid.get(nx, ny) === FRUIT) {
			// increment the score and sets a new fruit position
			score++;
			if(maxScore<score) {maxScore = score; record = true};
			setFood();
		} else {
			// take out the first item from the snake queue i.e
			// the tail and remove id from grid
			var tail = snake.remove();
			grid.set(EMPTY, tail.x, tail.y);
		}
		// add a snake id at the new position and append it to 
		// the snake queue
		grid.set(SNAKE, nx, ny);
		snake.insert(nx, ny);
	}
}
/**
 * Render the grid to the canvas.
 */
function draw() {
	// calculate tile-width and -height
	var tw = canvas.width/grid.width;
	var th = canvas.height/grid.height;
	// iterate through the grid and draw all cells
	for (var x=0; x < grid.width; x++) {
		for (var y=0; y < grid.height; y++) {
			// sets the fillstyle depending on the id of
			// each cell
			switch (grid.get(x, y)) {
				case EMPTY:
					ctx.fillStyle = "#fff";
					break;
				case SNAKE:
					ctx.fillStyle = "#ff0";
					break;
				case FRUIT:
					ctx.fillStyle = "#f00";
					break;
			}
			ctx.fillRect(x*tw, y*th, tw, th);
		}
	}
	// changes the fillstyle once more and draws the score
	// message to the canvas
	ctx.fillStyle = record?"#f00":"#000";
	ctx.fillText("SCORE: " + score, canvas.width-100, 15);
}
// start and run the game
main();