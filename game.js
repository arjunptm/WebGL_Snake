function initSnake() {
    snakeX[0] = 0.5;
    snakeY[0] = 0.5;
    snakeX[1] = 0.45;
    snakeY[1] = 0.5;
    snakeX[2] = 0.4;
    snakeY[2] = 0.5;
    snakeX[3] = 0.35;
    snakeY[3] = 0.5;
}

function initnpSnake() {
    npDir = "left";
    npSize = 4;
    npSnakeX[0] = 0.2;
    npSnakeY[0] = 0.2;
    npSnakeX[1] = 0.2;
    npSnakeY[1] = 0.25;
    npSnakeX[2] = 0.2;
    npSnakeY[2] = 0.30;
    npSnakeX[3] = 0.2;
    npSnakeY[3] = 0.35;
}

function rand_5(min, max) {
    return Math.round((Math.random() * (max - min) + min) / 5) * 5;
}

function rand_dir(min, max) {
    return Math.round((Math.random() * (max - min) + min));
}

function randomizeFood() {
    // console.log(rand_10(5,95));
    foodX = (rand_5(5, 95)) / 100.0;
    foodY = (rand_5(5, 95)) / 100.0;
}

function checkEat(whichSnake) {
    if (whichSnake == 0) {
        if ((snakeX[0].toFixed(2) == foodX.toFixed(2)) && (snakeY[0].toFixed(2) == foodY.toFixed(2))) {
            console.log("eat");
            snakeX[snakeSize] = snakeX[snakeSize - 1];
            snakeY[snakeSize] = snakeY[snakeSize - 1];
            snakeSize++;
            score1 += 1 * scoreMultiplier;
            randomizeFood();
            document.getElementById("scoretag").innerHTML = "Snakey's Score: " + score1;;
        }
    }
    if (whichSnake == 1) {
        if ((npSnakeX[0].toFixed(2) == foodX.toFixed(2)) && (npSnakeY[0].toFixed(2) == foodY.toFixed(2))) {
            console.log("eat");
            npSnakeX[npSize] = npSnakeX[npSize - 1];
            npSnakeY[npSize] = npSnakeY[npSize - 1];
            npSize++;
            score2 += 1;
            randomizeFood();
            if (!player2) document.getElementById("npscoretag").innerHTML = "NP Score: " + score2;
            else document.getElementById("npscoretag").innerHTML = "Miss Hiss' Score: " + score2;
        }
    }
}

function endGameCall(id) {
    gameOver = true;
    playSound();
    console.log(snakeX[0], npSnakeX[0], snakeY[0], npSnakeY[0]);
    if (!player2) {
        document.getElementById("gameovermessage").innerHTML = "Game Over.";
    } else if (player2 && id == 0) {
        document.getElementById("gameovermessage").innerHTML = "Snakey loses.";
    } else if (player2 && id == 1) {
        document.getElementById("gameovermessage").innerHTML = "Miss Hiss loses";
    }
    if ((snakeX[0].toFixed(2) == npSnakeX[0].toFixed(2)) && (snakeY[0].toFixed(2) == npSnakeY[0].toFixed(2))) {
        if (!invincibleP1 && !invincibleP2) {
            document.getElementById("gameovermessage").innerHTML = "Head-on collision. Higher score wins.";
        }
    }
}

function checkDeath() {
    if (snakeX[0] > 1) endGameCall(0);
    if (snakeX[0] <= 0.05) endGameCall(0);
    if (snakeY[0] > 1) endGameCall(0);
    if (snakeY[0] <= 0.05) endGameCall(0);
    for (var i = 1; i < snakeSize; i++) {
        if ((snakeX[0] == snakeX[i]) && (snakeY[0] == snakeY[i])) endGameCall(0);
    }
    for (i = 0; i < npSize; i++) {
        if ((snakeX[0].toFixed(2) == npSnakeX[i].toFixed(2)) && (snakeY[0].toFixed(2) == npSnakeY[i].toFixed(2))) endGameCall(0);
    }
}

function checknpDeath() {
    if (npSnakeX[0] > 1) initnpSnake();
    if (npSnakeX[0] <= 0.05) initnpSnake();
    if (npSnakeY[0] > 1) initnpSnake();
    if (npSnakeY[0] <= 0.05) initnpSnake();
    for (var i = 1; i < snakeSize; i++) {
        if ((npSnakeX[0] == npSnakeX[i]) && (npSnakeY[0] == npSnakeY[i])) initnpSnake();
    }
    for (i = 0; i < snakeSize; i++) {
        if ((npSnakeX[0].toFixed(2) == snakeX[i].toFixed(2)) && (npSnakeY[0].toFixed(2) == snakeY[i].toFixed(2))) initnpSnake();
    }
}

function check2pDeath() {
    if (npSnakeX[0] > 1) endGameCall(1);
    if (npSnakeX[0] <= 0.05) endGameCall(1);
    if (npSnakeY[0] > 1) endGameCall(1);
    if (npSnakeY[0] <= 0.05) endGameCall(1);
    for (var i = 1; i < snakeSize; i++) {
        if ((npSnakeX[0] == npSnakeX[i]) && (npSnakeY[0] == npSnakeY[i])) endGameCall(1);
    }
    for (i = 0; i < snakeSize; i++) {
        if ((npSnakeX[0].toFixed(2) == snakeX[i].toFixed(2)) && (npSnakeY[0].toFixed(2) == snakeY[i].toFixed(2))) endGameCall(1);
    }
}

function moveBody() {
    for (var i = snakeSize - 1; i >= 1; i--) {
        snakeX[i] = snakeX[i - 1];
        snakeY[i] = snakeY[i - 1];
    }
}

function movenpBody() {
    for (var i = npSize - 1; i >= 1; i--) {
        npSnakeX[i] = npSnakeX[i - 1];
        npSnakeY[i] = npSnakeY[i - 1];
    }
}

function createCube(cubeCoords, pX, pY) {
    var coordList = [];
    // console.log(pX, pY);
    //top
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX - 0.02, pY + 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY + 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY + 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.07);
    //left
    cubeCoords.push(pX + 0.02, pY + 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY + 0.02, -0.03);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY + 0.02, -0.03);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.03);
    //right
    cubeCoords.push(pX - 0.02, pY + 0.02, -0.07);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.03);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.03);
    cubeCoords.push(pX - 0.02, pY + 0.02, -0.03);
    cubeCoords.push(pX - 0.02, pY + 0.02, -0.07);
    //front
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.03);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.07);
    cubeCoords.push(pX + 0.02, pY - 0.02, -0.03);
    cubeCoords.push(pX - 0.02, pY - 0.02, -0.03);
    return coordList;
}

function playSound() {
    var audio = new Audio('game_over.mp3');
    audio.play();
}

function setEye() {
    if (!player2) {
        if (shoulder) {
            Eye = vec3.fromValues(snakeX[0], snakeY[0] - 0.4, -0.6);
        } else Eye = vec3.fromValues(0.5, -0.7, -1.2);
    }
}

function snakeShaders() {
    // define fragment shader in essl using es6 template strings
    var fSnakeShaderCode = `
    precision mediump float;
    uniform vec3 lightPos;
    uniform vec3 lightCol;
    uniform vec3 ambColor;
    uniform vec3 difColor;
    uniform vec3 spcColor;
    uniform vec3 eyePos;
    uniform float n;
    uniform float lightModel;
    varying vec3 normal;
    varying vec3 vPos;
    // varying vec3 fragColor;

    void main(void) {
            vec3 blinnPhongColor = ambColor * lightCol;
            blinnPhongColor += difColor * lightCol * (max(dot(normalize(normal),normalize((lightPos - vPos))),0.0));
            blinnPhongColor += spcColor * lightCol * ( pow(max (dot (  normalize((lightPos + (eyePos - vPos)  )), normalize(normal)  ),0.0),n ));
            gl_FragColor = vec4(blinnPhongColor, 1.0); // all fragments are white

    }
    `;
    // define vertex shader in essl using es6 template strings
    var vSnakeShaderCode = `
    attribute vec3 vertexPosition;
    varying vec3 vPos;

    attribute vec3 normalPosition;
    varying vec3 normal;
    uniform mat4 uModelMatrix; // the model matrix
    uniform mat4 uViewMatrix;
    uniform mat4 uProjMatrix;

    void main(void) {
        normal = normalPosition;
        vPos = vertexPosition;

        vec3 P = vec3(uModelMatrix * vec4(vertexPosition, 1.0));
        gl_Position = uViewMatrix * vec4(P,1.0);
        gl_Position = uProjMatrix * gl_Position;

    }
    `;
    try {
        var fSnakeShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fSnakeShader, fSnakeShaderCode); // attach code to shader
        gl.compileShader(fSnakeShader); // compile the code for gpu execution
        var vSnakeShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vSnakeShader, vSnakeShaderCode); // attach code to shader
        gl.compileShader(vSnakeShader); // compile the code for gpu execution
        if (!gl.getShaderParameter(fSnakeShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fSnakeShader);
            gl.deleteShader(fSnakeShader);
        } else if (!gl.getShaderParameter(vSnakeShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vSnakeShader);
            gl.deleteShader(vSnakeShader);
        } else { // no compile errors
            var shaderSnakeProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderSnakeProgram, fSnakeShader); // put frag shader in program
            gl.attachShader(shaderSnakeProgram, vSnakeShader); // put vertex shader in program
            gl.linkProgram(shaderSnakeProgram); // link program into gl context
            if (!gl.getProgramParameter(shaderSnakeProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderSnakeProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderSnakeProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderSnakeProgram, "vertexPosition");
                normAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderSnakeProgram, "normalPosition");
                vertexColorAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderSnakeProgram, "vertexColor");
                modelMatrixULoc = gl.getUniformLocation(shaderSnakeProgram, "uModelMatrix"); // ptr to mmat
                viewMatrixULoc = gl.getUniformLocation(shaderSnakeProgram, "uViewMatrix");
                projMatrixULoc = gl.getUniformLocation(shaderSnakeProgram, "uProjMatrix");
                difColorULoc = gl.getUniformLocation(shaderSnakeProgram, "difColor");
                ambColorULoc = gl.getUniformLocation(shaderSnakeProgram, "ambColor");
                spcColorULoc = gl.getUniformLocation(shaderSnakeProgram, "spcColor");
                lightPosULoc = gl.getUniformLocation(shaderSnakeProgram, "lightPos");
                lightColULoc = gl.getUniformLocation(shaderSnakeProgram, "lightCol");
                eyeULoc = gl.getUniformLocation(shaderSnakeProgram, "eyePos");
                nULoc = gl.getUniformLocation(shaderSnakeProgram, "n");
                // lModelULoc = gl.getUniformLocation(shaderSnakeProgram, "lightModel");
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                gl.enableVertexAttribArray(normAttrib);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    catch (e) {
        console.log(e);
    } // end catch
} // end setup shaders