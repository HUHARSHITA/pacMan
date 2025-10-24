const canvas = document.getElementById("canvas");
const canvasContext = canvas.getContext("2d");
const pacmanFrames = document.getElementById("animation");
const ghostFrames = document.getElementById("ghosts");
// --- SOUND SETUP ---
const sounds = {
    bg: new Howl({
        src: ['bg.mp3'],
        volume: 0.4,
        loop: true
    }),
    death: new Howl({
        src: ['death.mp3'],
        volume: 0.6
    })
};

let createRect = (x, y, width, height, color) => {
    canvasContext.fillStyle = color;
    canvasContext.fillRect(x, y, width, height);
};
let gameOver = false;

const DIRECTION_RIGHT = 4;
const DIRECTION_UP = 3;
const DIRECTION_LEFT = 2;
const DIRECTION_BOTTOM = 1;
let lives = 3;
let ghostCount = 2;
let ghostImageLocations = [
    { x: 0, y: 0 },
    { x: 176, y: 0 },
    { x: 0, y: 121 },
    { x: 176, y: 121 },
];
let countdown = 3; 
let countdownActive = true;

// Game variables
let fps = 30;
let pacman;
let oneBlockSize = 20;
let score = 0;
let ghosts = [];
let wallSpaceWidth = oneBlockSize / 1.6;
let wallOffset = (oneBlockSize - wallSpaceWidth) / 2;
let wallInnerColor = "black";

// we now create the map of the walls,
// if 1 wall, if 0 not wall
// 21 columns // 23 rows
let map=[
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,2,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,2,2,1,2,2,1,1,2,2,1,1,1,1,2,1,1,1,1,2,1,2,1,2,1,2,1],
[1,2,1,2,2,1,2,1,2,2,1,2,1,2,2,1,2,1,2,2,2,2,1,2,1,2,1,2,1],
[1,2,1,1,1,1,2,1,2,2,1,2,1,2,1,1,2,1,1,1,1,2,1,1,1,2,1,2,1],
[1,2,1,2,2,1,2,1,1,2,1,2,1,2,1,2,2,2,2,2,1,2,1,2,1,2,1,2,1],
[1,2,1,2,2,1,2,1,2,2,1,2,1,2,2,1,2,1,1,1,1,2,1,2,1,2,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,2,1,1,1,1,1,2,1,1,1,1,1,1,1,1,1,1,1,1,1,2,1,1,1,1,1,2,1],
[1,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,2,1],
[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
];

canvas.width = map[0].length * oneBlockSize;
canvas.height = (map.length + 2) * oneBlockSize;

let randomTargetsForGhosts = [
    { x: 1 * oneBlockSize, y: 1 * oneBlockSize },
    { x: 1 * oneBlockSize, y: (map.length - 2) * oneBlockSize },
    { x: (map[0].length - 2) * oneBlockSize, y: oneBlockSize },
    {
        x: (map[0].length - 2) * oneBlockSize,
        y: (map.length - 2) * oneBlockSize,
    },
];

// for (let i = 0; i < map.length; i++) {
//     for (let j = 0; j < map[0].length; j++) {
//         map[i][j] = 2;
//     }
// }

let createNewPacman = () => {
    pacman = new Pacman(
    1 * oneBlockSize,
    1 * oneBlockSize,
    oneBlockSize,
    oneBlockSize,
    oneBlockSize / 5
    );
};

window.onload = () => {
    canvas.width = map[0].length * oneBlockSize;
    canvas.height = map.length * oneBlockSize + oneBlockSize * 2;

    createNewPacman();
    createGhosts();
    sounds.bg.play();
    gameInterval = setInterval(gameLoop, 1000 / fps);
};


let restartPacmanAndGhosts = () => {
    createNewPacman();
    createGhosts();
};


let onGhostCollision = () => {
    lives--;
    sounds.bg.pause(); // pause background music
    sounds.death.play(); // play death sound

    if (lives < 0) {
        gameOver = true;
        setTimeout(() => {
            sounds.bg.stop();
            alert("💀 Game Over!\nFinal Score: " + score);
            location.reload();
        }, 1500);
        return;
    }

    // Respawn delay (1 second after death sound)
    clearInterval(gameInterval);
    setTimeout(() => {
        restartPacmanAndGhosts();
        sounds.bg.play(); // resume bg music
        gameInterval = setInterval(gameLoop, 1000 / fps);
    }, 1000);
};



let update = () => {
    if (gameOver) return; // stop updating after game over

    pacman.moveProcess();
    pacman.eat();
    updateGhosts();
    if (pacman.checkGhostCollision(ghosts)) {
        onGhostCollision();
    }
};


let drawFoods = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 2) {
                createRect(
                    j * oneBlockSize + oneBlockSize / 3,
                    i * oneBlockSize + oneBlockSize / 3,
                    oneBlockSize / 3,
                    oneBlockSize / 3,
                    "#FEB897"
                );
            }
        }
    }
};

let drawRemainingLives = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText("Lives: ", 220, oneBlockSize * (map.length + 1));

    for (let i = 0; i < lives; i++) {
        canvasContext.drawImage(
            pacmanFrames,
            2 * oneBlockSize,
            0,
            oneBlockSize,
            oneBlockSize,
            350 + i * oneBlockSize,
            oneBlockSize * map.length + 2,
            oneBlockSize,
            oneBlockSize
        );
    }

    // Debug check
    // console.log("Lives:", lives);
};


let drawScore = () => {
    canvasContext.font = "20px Emulogic";
    canvasContext.fillStyle = "white";
    canvasContext.fillText(
        "Score: " + score,
        0,
        oneBlockSize * (map.length + 1)
    );
    if (score==186){
        gameOver = true;
        setTimeout(() => {
            sounds.bg.stop();
            alert("You WON!!\nFinal Score: " + score);
            location.reload();
        }, 1500);
        return;
    }
};

let draw = () => {
    canvasContext.clearRect(0, 0, canvas.width, canvas.height);
    createRect(0, 0, canvas.width, canvas.height, "black");
    drawWalls();
    drawFoods();
    drawGhosts();
    pacman.draw();
    drawScore();
    drawRemainingLives(); // ✅ must be here
};

let drawWalls = () => {
    for (let i = 0; i < map.length; i++) {
        for (let j = 0; j < map[0].length; j++) {
            if (map[i][j] == 1) {
                createRect(
                    j * oneBlockSize,
                    i * oneBlockSize,
                    oneBlockSize,
                    oneBlockSize,
                    "#342DCA"
                );
                if (j > 0 && map[i][j - 1] == 1) {
                    createRect(
                        j * oneBlockSize,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (j < map[0].length - 1 && map[i][j + 1] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth + wallOffset,
                        wallSpaceWidth,
                        wallInnerColor
                    );
                }

                if (i < map.length - 1 && map[i + 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize + wallOffset,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }

                if (i > 0 && map[i - 1][j] == 1) {
                    createRect(
                        j * oneBlockSize + wallOffset,
                        i * oneBlockSize,
                        wallSpaceWidth,
                        wallSpaceWidth + wallOffset,
                        wallInnerColor
                    );
                }
            }
        }
    }
};

let createGhosts = () => {
    ghosts = [];
    for (let i = 0; i < ghostCount * 1.5; i++) {
    let newGhost = new Ghost(
        10 * oneBlockSize,   // middle-ish columns (you can tweak)
        4 * oneBlockSize,    // around the middle row (13 rows total)
        oneBlockSize,
        oneBlockSize,
        pacman.speed / 2,
        ghostImageLocations[i % 4].x,
        ghostImageLocations[i % 4].y,
        124,
        116,
        6 + i
    );
    ghosts.push(newGhost);
}

};

let gameLoop = () => {
    update();
    draw();
};
let gameInterval; // declare it once globally

window.onload = () => {
    createNewPacman();
    createGhosts();
    sounds.bg.play();
    gameInterval = setInterval(gameLoop, 1000 / fps);
};

window.addEventListener("keydown", (event) => {
    let k = event.keyCode;
    setTimeout(() => {
        if (k == 37 || k == 65) {
            // left arrow or a
            pacman.nextDirection = DIRECTION_LEFT;
        } else if (k == 38 || k == 87) {
            // up arrow or w
            pacman.nextDirection = DIRECTION_UP;
        } else if (k == 39 || k == 68) {
            // right arrow or d
            pacman.nextDirection = DIRECTION_RIGHT;
        } else if (k == 40 || k == 83) {
            // bottom arrow or s
            pacman.nextDirection = DIRECTION_BOTTOM;
        }
    }, 1);
});
