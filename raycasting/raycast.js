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
        //kepp the rayAngle in the range from 0 to 2PI. The Angel will be positive
        this.rayAngle = normalizeAngel(rayAngle);
        this.wallHitX = 0; // the ray hits the vertical position
        this.wallHitY = 0; // the ray hits the horizontal position 
        this.distance = 0; // distance between the player and the collision with the wall
        this.wasHitVertical = false; //hit with vertical or horizontal wall line

        this.isRayFacingDown = this.rayAngle > 0 && this.rayAngle < Math.PI;
        this.isRayFacingUp = !this.isRayFacingDown;

        this.isRayFacingRight = this.rayAngle < Math.PI / 2 || this.rayAngle > 1.5 * Math.PI;
        this.isRayFacingLeft = !this.isRayFacingRight;
    }
    render() {
        stroke("rgba(255, 0, 0, 0.3)");
        line(player.x, player.y, this.wallHitX, this.wallHitY);
    } 
    cast(columnId) {
        var xIntercept, yIntercept;
        var xStep, yStep;
        var foundHorzWallHit = false;
        var horzWallHitX = 0;
        var horzWallHitY = 0;
        //handle the horizontal intersaction

        // find the y-coordinate of the closest horizonral grid intersaction
        yIntercept = Math.floor(player.y / TILE_SIZE) * TILE_SIZE;
        yIntercept += this.isRayFacingUp  ?  0 : TILE_SIZE;
        // find the x-coordinate of the closest horizonral grid intersaction
        xIntercept = player.x + (yIntercept - player.y) / Math.tan(this.rayAngle);

        //calculate steps
        yStep = TILE_SIZE;
        yStep *= this.isRayFacingUp ? -1 : 1;
        xStep = yStep / Math.tan(this.rayAngle);
        xStep *= (this.isRayFacingLeft && xStep > 0) ? -1 : 1;
        xStep *= (this.isRayFacingRight && xStep < 0) ? -1 : 1;

        var nextHorzTouchX = xIntercept;
        var nextHorzTouchY = yIntercept;
        if (this.isRayFacingUp)
            nextHorzTouchY--;
        // increment xStep and yStep until we find a wall
        while (nextHorzTouchX >= 0 && nextHorzTouchX <= WINDOW_WIDTH && nextHorzTouchY >= 0 && nextHorzTouchY <= WINDOW_HEIGHT) {
            if (grid.wallCollapse(nextHorzTouchX, nextHorzTouchY)) {
                foundHorzWallHit = true;
                horzWallHitX = nextHorzTouchX;
                horzWallHitY = nextHorzTouchY;
                //remove later; for testing purpose only
                //stroke("red");
                //line(player.x, player.y, wallHitX, wallHitY);
                break;
            } else {
                nextHorzTouchX += xStep;
                nextHorzTouchY += yStep;
            }
        }

        //handle the vertical intersaction

        var foundVertWallHit = false;
        var vertWallHitX = 0;
        var vertWallHitY = 0;
        // find the x-coordinate of the closest vertical grid intersaction
        xIntercept = Math.floor(player.x / TILE_SIZE) * TILE_SIZE;
        xIntercept += this.isRayFacingLeft  ?  0 : TILE_SIZE;
        // find the y-coordinate of the closest vertical grid intersaction
        yIntercept = player.y + (xIntercept - player.x) * Math.tan(this.rayAngle);

        //calculate steps
        xStep = TILE_SIZE;
        xStep *= this.isRayFacingLeft ? -1 : 1;

        yStep = xStep * Math.tan(this.rayAngle);
        yStep *= (this.isRayFacingUp && yStep > 0) ? -1 : 1;
        yStep *= (this.isRayFacingDown && yStep < 0) ? -1 : 1;

        var nextVertTouchX = xIntercept;
        var nextVertTouchY = yIntercept;
        if (this.isRayFacingLeft)
            nextVertTouchX--;
        // increment xStep and yStep until we find a wall
        while (nextVertTouchX >= 0 && nextVertTouchX <= WINDOW_WIDTH && nextVertTouchY >= 0 && nextVertTouchY <= WINDOW_HEIGHT) {
            if (grid.wallCollapse(nextVertTouchX, nextVertTouchY)) {
                foundVertWallHit = true;
                vertWallHitX = nextVertTouchX;
                vertWallHitY = nextVertTouchY;
                //remove later; for testing purpose only
                //stroke("red");
                //line(player.x, player.y, wallHitX, wallHitY);
                break;
            } else {
                nextVertTouchX += xStep;
                nextVertTouchY += yStep;
            }
        }
        //calculate both the horizontal and vertical distance and choose the smallest value
        var horzHitDistance = (foundHorzWallHit) 
                                ? distanceBetweenPoints(player.x, player.y, horzWallHitX. horzWallHitY)
                                : Number.MAX_VALUE;
        var vertHitDistance = (foundVertWallHit) 
                                ? distanceBetweenPoints(player.x, player.y, vertWallHitX. vertWallHitY)
                                : Number.MAX_VALUE;
        //stores the smallest of the distances
        this.wallHitX = (horzHitDistance < vertHitDistance) ? horzWallHitX : vertWallHitX;
        this.wallHitY = (horzHitDistance < vertHitDistance) ? horzWallHitY : vertWallHitY;
        this.distance = (horzHitDistance < vertHitDistance) ? horzHitDistance : vertHitDistance;
        this.wasHitVertical = (vertHitDistance < horzHitDistance);
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
    for (var i = 0; i < NUM_RAYS; ++i) {
        //for (var i = 0; i < 2; ++i) {
        var ray = new Ray(rayAngle);
        //raycasting
        ray.cast(columnId);
        rays.push(ray);
        rayAngle += FOV_ANGLE / NUM_RAYS;
        columnId++;
    }
}

function distanceBetweenPoints(xStart, yStart, xEnd, yEnd) {
    return Math.sqrt((xEnd - xStart) * (xEnd - xStart) + (yEnd - yStart) * (yEnd - yStart));
}

function normalizeAngel(angle) {
    angle = angle % (2 * Math.PI);
    if (angle < 0) {
        angle += 2 * Math.PI;
    }
    return angle;
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

    //remove later; for testing purpose only
    //castAllRays();

}

