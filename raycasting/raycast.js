const TILE_SIZE = 32;
const MAP_NUM_ROWS = 11;
const MAP_NUM_COLS = 15;

const WINDOW_WIDTH = MAP_NUM_COLS * TILE_SIZE;
const WINDOW_HEIGHT = MAP_NUM_ROWS * TILE_SIZE;

const FOV_ANGLE = 60 * (Math.PI / 180);

const WALL_STRIP_WIDTH = 20;
const NUM_RAYS = WINDOW_WIDTH / WALL_STRIP_WIDTH;

class Map {
    constructor() {
        this.grid = [
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1],
            [1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
        ];
    }
    render() {
        for (var i = 0; i < MAP_NUM_ROWS; i++) {
            for (var j = 0; j < MAP_NUM_COLS; j++) {
                var tileX = j * TILE_SIZE; 
                var tileY = i * TILE_SIZE;
                var tileColor = this.grid[i][j] == 1 ? "#222" : "#fff";
                stroke("#222"); //Sets the color used to draw lines and borders around shapes
                fill(tileColor); //Sets the color used to fill shapes
                rect(tileX, tileY, TILE_SIZE, TILE_SIZE); //Draws a rectangle to the screen. 
            }
        }
    }
    //checks wall collision 
    wallCollapse(newX, newY) {
        //proof if we are outside the windows
        if (newX < 0 || newX > WINDOW_WIDTH || newY < 0 || newY > WINDOW_HEIGHT) {
            return true;
        }
        var mapGridIndexX = Math.floor(newX / TILE_SIZE);
        var mapGridIndexY = Math.floor(newY / TILE_SIZE);
        return this.grid[mapGridIndexY][mapGridIndexX] != 0;
    }
}

class Player {
    constructor() {
        this.x = WINDOW_WIDTH / 2;
        this.y = WINDOW_HEIGHT / 2;
        this.radius = 3;
        this.turnDirectionn = 0; //-1 if left, +1 if right
        this.walkDirection = 0; // -1 if back, +1 if front
        this.rotationAngle = Math.PI / 2;
        this.moveSpeed = 2.0;
        this.rotationSpeed = 2 * (Math.PI / 180);
    }

    //update player position based on turnDirection and walkDirection
    update() {
        //console.log(this.turnDirectionn);
        this.rotationAngle += this.turnDirectionn * this.rotationSpeed;

        var moveStep = this.walkDirection  * this.moveSpeed;
        var newPlayerX = this.x + moveStep * Math.cos(this.rotationAngle);
        var newPlayerY = this.y + moveStep * Math.sin(this.rotationAngle);
        //move if there is not a wall
        if (!grid.wallCollapse(newPlayerX, newPlayerY)) {
            this.x = newPlayerX;
            this.y = newPlayerY;
        }

    }
    render() {
        noStroke(); //Disables drawing the stroke (outline)
        fill("red");
        circle(this.x, this.y, this.radius);
        stroke("red");
        // instead of 30 px might be used any other value
        line(this.x, this.y, this.x + Math.cos(this.rotationAngle) * 30,
                this.y + Math.sin(this.rotationAngle) * 30);
    }
}

class Ray {
    constructor(rayAngle) {
        this.rayAngle = rayAngle;
    }
    render() {
        stroke("rgba(255, 0, 0, 0.3)");
        line(player.x, player.y, 
            player.x + Math.cos(this.rayAngle) * 30,
            player.y + Math.sin(this.rayAngle) * 30);
    }
}

var grid = new Map();
var player = new Player();
var rays = [];

//handles key events
function keyPressed() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = +1;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = -1;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirectionn = +1;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirectionn = -1;
    }
}

function keyReleased() {
    if (keyCode == UP_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == DOWN_ARROW) {
        player.walkDirection = 0;
    } else if (keyCode == RIGHT_ARROW) {
        player.turnDirectionn = 0;
    } else if (keyCode == LEFT_ARROW) {
        player.turnDirectionn = 0;
    }
}

function castAllRays() {
    var columnId = 0;
    // start first ray subtracting half of the FOV
    var rayAngle = player.rotationAngle - (FOV_ANGLE / 2);
    rays = [];
    //loop all columns casting the rays
    //for (var i = 0; i < NUM_RAYS; ++i) {
        for (var i = 0; i < 2; ++i) {
        var ray = new Ray(rayAngle);
        //raycasting

        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}

function setup() {
    createCanvas(WINDOW_WIDTH, WINDOW_HEIGHT);

}

// update all game objects before we render the next frame
function update() {
    player.update();
    castAllRays();
}

function draw() {
    update();

    grid.render();
    for (ray of rays) {
        ray.render();
    }
    player.render();
}

