//Snake Variables
var snakeX = [];
var snakeY = [];
var npSnakeX = [];
var npSnakeY = [];
var snakeNormals = [0, 0, -1];
var dir = "left";
var npDir = "left"
var FPS = 5;
var snakeSize = 4;
var npSize = 4;
var colorsIndex = [
    [1, 0, 0],
    [0, 0, 1],
    [.5, .5, .5]
];
var gameOver = false;
var foodX = 0.3;
var foodY = 0.8;
var gameVertexBuffers;
var gameNormBuffers;
var snakeIndex = 0;
var gameCoordArray = [];
var gameNormArray = [];
var player2 = false;
var score1 = 0;
var score2 = 0;
var invincibleP1 = false;
var inviCounterP1 = 1;
var invincibleP2 = false;
var inviCounterP2 = 1;
var scoreMultiplier = 1;
var shoulder = false;

function game() {
    moveSnake();
    movenpSnake();
    drawSnake();
    drawFood();
    drawnp();
    if (!invincibleP1) checkDeath();
    else {
        inviCounterP1--;
        if (inviCounterP1 == 1) {
            invincibleP1 = false;
            colorsIndex[0] = [1, 0, 0];
        }
    }
    if (!player2) checknpDeath();
    else {
        if (!invincibleP2) check2pDeath();
        else {
            inviCounterP2--;
            if (inviCounterP2 == 1) {
                invincibleP2 = false;
                colorsIndex[2] = [0.5, 0.5, 0.5];
            }
        }
    }
    bindGameBuffers();
    renderGame();
    setEye();
}

function moveSnake() {
    moveBody();
    switch (dir) {
        case "left":
            snakeX[0] += 0.05;
            break;
        case "up":
            snakeY[0] += 0.05;
            break;
        case "right":
            snakeX[0] -= 0.05;
            break;
        case "down":
            snakeY[0] -= 0.05;
            break;
    }
    checkEat(0);
}

function movenpSnake() {
    movenpBody();
    switch (npDir) {
        case "left":
            npSnakeX[0] += 0.05;
            break;
        case "up":
            npSnakeY[0] += 0.05;
            break;
        case "right":
            npSnakeX[0] -= 0.05;
            break;
        case "down":
            npSnakeY[0] -= 0.05;
            break;
    }
    checkEat(1);
}

function drawSnake() {
    var snakeCoords = [];
    gameCoordArray = [];
    gameNormArray = [];
    for (var i = 0; i < 6; i++) gameNormArray = gameNormArray.concat([0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0]);
    for (i = 1; i < snakeSize; i++)
        for (var j = 0; j < 6; j++) gameNormArray = gameNormArray.concat([0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
    for (var i = 0; i < snakeSize; i++) createCube(snakeCoords, snakeX[i], snakeY[i]);
    gameCoordArray = gameCoordArray.concat(snakeCoords);
}

function drawFood() {
    var foodCoords = [];
    for (var i = 0; i < 6; i++) gameNormArray = gameNormArray.concat([0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0]);
    createCube(gameCoordArray, foodX, foodY);
}

function drawnp() {
    var npCoords = [];
    for (var i = 0; i < 6; i++) gameNormArray = gameNormArray.concat([0, 0, -1], [1, 0, 0], [-1, 0, 0], [0, -1, 0]);
    for (i = 1; i < npSize; i++)
        for (var j = 0; j < 6; j++) gameNormArray = gameNormArray.concat([0, 0, -1], [0, 0, -1], [0, 0, -1], [0, 0, -1]);
    for (i = 0; i < npSize; i++) createCube(gameCoordArray, npSnakeX[i], npSnakeY[i]);
}

function bindGameBuffers() {
    gameVertexBuffers = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gameVertexBuffers);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gameCoordArray), gl.STATIC_DRAW);
    gameNormBuffers = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, gameNormBuffers);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(gameNormArray), gl.STATIC_DRAW);
}

function renderGame() {
    for (i = 0; i <= 2; i++) {
        snakeMMatrix = mat4.create();
        snakeVMatrix = mat4.create();
        snakePMatrix = mat4.create();
        vec3.add(temp, Eye, lookAtVector);
        mat4.lookAt(snakeVMatrix, Eye, temp, up);
        mat4.perspective(snakePMatrix, 45, 1, 0.5, 100);
        gl.uniformMatrix4fv(modelMatrixULoc, false, snakeMMatrix);
        gl.uniformMatrix4fv(viewMatrixULoc, false, snakeVMatrix);
        gl.uniformMatrix4fv(projMatrixULoc, false, snakePMatrix);
        gl.uniform3fv(lightPosULoc, lightPosition);
        gl.uniform3fv(lightColULoc, lightColor);
        gl.uniform3fv(ambColorULoc, [0.1, 0.1, 0.1]);
        gl.uniform3fv(difColorULoc, colorsIndex[i]);
        gl.uniform3fv(spcColorULoc, [0.3, 0.3, 0.3]);
        gl.uniform1f(nULoc, 11);
        gl.bindBuffer(gl.ARRAY_BUFFER, gameVertexBuffers); // activate
        gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed
        gl.bindBuffer(gl.ARRAY_BUFFER, gameNormBuffers); // activate
        gl.vertexAttribPointer(normAttrib, 3, gl.FLOAT, false, 0, 0); // feed
        switch (i) {
            case 0:
                gl.drawArrays(gl.TRIANGLES, 0, snakeSize * 24);
                break;
            case 1:
                gl.drawArrays(gl.TRIANGLES, snakeSize * 24, 24);
                break;
            case 2:
                gl.drawArrays(gl.TRIANGLES, (snakeSize + 1) * 24, npSize * 24);
                break;
        }
    }
}