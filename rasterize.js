/* GLOBAL CONSTANTS AND VARIABLES */
/* assignment specific globals */
const WIN_Z = 0; // default graphics window z coord in world space
const WIN_LEFT = 0;
const WIN_RIGHT = 1; // default left and right x coords in world space
const WIN_BOTTOM = 0;
const WIN_TOP = 1; // default top and bottom y coords in world space
const INPUT_TRIANGLES_URL = "map.json"; // triangles file loc
var Eye = new vec3.fromValues(0.5, -0.7, -1.2); // default eye position in world space
var center = new vec3.fromValues(0.5, 0.5, 0.0);
var lookAtVector = vec3.fromValues(0.0, 1, 1.0);
var up = new vec3.fromValues(0.0, 1.0, 0.0);
var lightPosition = new vec3.fromValues(0.6, -0.5, -0.9);
var lightColor = new vec3.fromValues(1.0, 1.0, 1.0);
var temp = new vec3.fromValues(0.0, 0.0, 0.0);
/* webgl globals */
var gl = null; // the all powerful gl object. It's all here folks!
var vertexBuffers = []; // this contains vertex coordinates in triples
var normBuffers = [];
var triangleBuffers = []; // this contains indices into vertexBuffer in triples
var triBufferSize; // the number of indices in the triangle buffer
var vertexColorAttrib;
var ambColorULoc;
var difColorULoc;
var spcColorULoc;
var lightPosULoc;
var lightColULoc;
var eyeULoc;
var nULoc;
var normAttrib;
var vertexPositionAttrib; // where to put position for vertex shader
var modelMatrixULoc;
var viewMatrixULoc;
var lModelULoc;
var projMatrixULoc;
var triSetSizes = [];
var numTriangleSets = 0;
var inputTriangles;
var counter = 1;
// ASSIGNMENT HELPER FUNCTIONS
// get the JSON file from the passed URL
function getJSONFile(url, descr) {
    try {
        if ((typeof(url) !== "string") || (typeof(descr) !== "string")) throw "getJSONFile: parameter not a string";
        else {
            var httpReq = new XMLHttpRequest(); // a new http request
            httpReq.open("GET", url, false); // init the request
            httpReq.send(null); // send the request
            var startTime = Date.now();
            while ((httpReq.status !== 200) && (httpReq.readyState !== XMLHttpRequest.DONE)) {
                if ((Date.now() - startTime) > 3000) break;
            } // until its loaded or we time out after three seconds
            if ((httpReq.status !== 200) || (httpReq.readyState !== XMLHttpRequest.DONE)) throw "Unable to open " + descr + " file!";
            else return JSON.parse(httpReq.response);
        } // end if good params
    } // end try    
    catch (e) {
        console.log(e);
        return (String.null);
    }
} // end get input spheres
// set up the webGL environment
function setupWebGL() {
    // Get the canvas and context
    var canvas = document.getElementById("myWebGLCanvas"); // create a js canvas
    gl = canvas.getContext("webgl"); // get a webgl object from it
    try {
        if (gl == null) {
            throw "unable to create gl context -- is your browser gl ready?";
        } else {
            gl.clearColor(1.0, 1.0, 1.0, 1.0); // use black when we clear the frame buffer
            gl.clearDepth(1.0); // use max when we clear the depth buffer
            gl.enable(gl.DEPTH_TEST); // use hidden surface removal (with zbuffering)
        }
    } // end try
    catch (e) {
        console.log(e);
    } // end catch
} // end setupWebGL
// read triangles in, load them into webgl buffers
function loadTriangles() {
    inputTriangles = getJSONFile(INPUT_TRIANGLES_URL, "triangles");
    if (inputTriangles != String.null) {
        var whichSetVert; // index of vertex in current triangle set
        var whichSetTri; // index of triangle in current triangle set
        var vtxToAdd; // vtx coords to add to the coord array
        var nrmToAdd;
        var triToAdd; // tri indices to add to the index array
        // for each set of tris in the input file
        numTriangleSets = inputTriangles.length;
        for (var whichSet = 0; whichSet < numTriangleSets; whichSet++) {
            inputTriangles[whichSet].normArray = [];
            inputTriangles[whichSet].coordArray = []; // create a list of coords for this tri set
            for (whichSetVert = 0; whichSetVert < inputTriangles[whichSet].vertices.length; whichSetVert++) {
                vtxToAdd = inputTriangles[whichSet].vertices[whichSetVert];
                nrmToAdd = inputTriangles[whichSet].normals[whichSetVert];
                inputTriangles[whichSet].coordArray.push(vtxToAdd[0], vtxToAdd[1], vtxToAdd[2]);
                inputTriangles[whichSet].normArray.push(nrmToAdd[0], nrmToAdd[1], nrmToAdd[2]);
            } // end for vertices in set
            // send the vertex coords to webGL
            vertexBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].coordArray), gl.STATIC_DRAW); // coords to that buffer
            normBuffers[whichSet] = gl.createBuffer(); // init empty vertex coord buffer for current set
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(inputTriangles[whichSet].normArray), gl.STATIC_DRAW); // coords to that buffer
            // set up the triangle index array, adjusting indices across sets
            inputTriangles[whichSet].indexArray = []; // create a list of tri indices for this tri set
            triSetSizes[whichSet] = inputTriangles[whichSet].triangles.length;
            for (whichSetTri = 0; whichSetTri < triSetSizes[whichSet]; whichSetTri++) {
                triToAdd = inputTriangles[whichSet].triangles[whichSetTri];
                inputTriangles[whichSet].indexArray.push(triToAdd[0], triToAdd[1], triToAdd[2]);
            } // end for triangles in set
            // send the triangle indices to webGL
            triangleBuffers[whichSet] = gl.createBuffer(); // init empty triangle index buffer for current tri set
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichSet]); // activate that buffer
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inputTriangles[whichSet].indexArray), gl.STATIC_DRAW); // indices to that buffer
        } // end for each triangle set 
    } // end if triangles found
} // end load triangles
// setup the webGL shaders
function setupShaders() {
    // define fragment shader in essl using es6 template strings
    var fShaderCode = `
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
    var vShaderCode = `
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
        // console.log("fragment shader: "+fShaderCode);
        var fShader = gl.createShader(gl.FRAGMENT_SHADER); // create frag shader
        gl.shaderSource(fShader, fShaderCode); // attach code to shader
        gl.compileShader(fShader); // compile the code for gpu execution
        // console.log("vertex shader: "+vShaderCode);
        var vShader = gl.createShader(gl.VERTEX_SHADER); // create vertex shader
        gl.shaderSource(vShader, vShaderCode); // attach code to shader
        gl.compileShader(vShader); // compile the code for gpu execution
        if (!gl.getShaderParameter(fShader, gl.COMPILE_STATUS)) { // bad frag shader compile
            throw "error during fragment shader compile: " + gl.getShaderInfoLog(fShader);
            gl.deleteShader(fShader);
        } else if (!gl.getShaderParameter(vShader, gl.COMPILE_STATUS)) { // bad vertex shader compile
            throw "error during vertex shader compile: " + gl.getShaderInfoLog(vShader);
            gl.deleteShader(vShader);
        } else { // no compile errors
            var shaderProgram = gl.createProgram(); // create the single shader program
            gl.attachShader(shaderProgram, fShader); // put frag shader in program
            gl.attachShader(shaderProgram, vShader); // put vertex shader in program
            gl.linkProgram(shaderProgram); // link program into gl context
            if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) { // bad program link
                throw "error during shader program linking: " + gl.getProgramInfoLog(shaderProgram);
            } else { // no shader program link errors
                gl.useProgram(shaderProgram); // activate shader program (frag and vert)
                vertexPositionAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexPosition");
                normAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "normalPosition");
                vertexColorAttrib = // get pointer to vertex shader input
                    gl.getAttribLocation(shaderProgram, "vertexColor");
                modelMatrixULoc = gl.getUniformLocation(shaderProgram, "uModelMatrix"); // ptr to mmat
                viewMatrixULoc = gl.getUniformLocation(shaderProgram, "uViewMatrix");
                projMatrixULoc = gl.getUniformLocation(shaderProgram, "uProjMatrix");
                difColorULoc = gl.getUniformLocation(shaderProgram, "difColor");
                ambColorULoc = gl.getUniformLocation(shaderProgram, "ambColor");
                spcColorULoc = gl.getUniformLocation(shaderProgram, "spcColor");
                lightPosULoc = gl.getUniformLocation(shaderProgram, "lightPos");
                lightColULoc = gl.getUniformLocation(shaderProgram, "lightCol");
                eyeULoc = gl.getUniformLocation(shaderProgram, "eyePos");
                nULoc = gl.getUniformLocation(shaderProgram, "n");
                // lModelULoc = gl.getUniformLocation(shaderProgram, "lightModel");
                gl.enableVertexAttribArray(vertexPositionAttrib); // input to shader from array
                gl.enableVertexAttribArray(normAttrib);
                // gl.enableVertexAttribArray(vertexColorAttrib);
            } // end if no shader program link errors
        } // end if no compile errors
    } // end try 
    catch (e) {
        console.log(e);
    } // end catch
} // end setup shaders
var bgColor = 0;

function initRenderTriangles() {
    for (var whichTriSet = 0; whichTriSet < numTriangleSets; whichTriSet++) {
        inputTriangles[whichTriSet].mMatrix = mat4.create();
        inputTriangles[whichTriSet].vMatrix = mat4.create();
        inputTriangles[whichTriSet].pMatrix = mat4.create();
    }
}
// render the loaded model
function renderTriangles() {
    setTimeout(function() {
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clear frame/depth buffers
        for (var whichTriSet = 0; whichTriSet < numTriangleSets; whichTriSet++) {
            vec3.add(temp, Eye, lookAtVector);
            mat4.lookAt(inputTriangles[whichTriSet].vMatrix, Eye, temp, up);
            // inputTriangles[whichTriSet].vMatrix = myLookAt(mat4.create(), Eye, temp, up);
            mat4.perspective(inputTriangles[whichTriSet].pMatrix, 45, 1, 0.5, 100);
            // console.log (inputTriangles[whichTriSet].vMatrix);
            // move back to center
            // scaleUp ();
            gl.uniformMatrix4fv(modelMatrixULoc, false, inputTriangles[whichTriSet].mMatrix);
            gl.uniformMatrix4fv(viewMatrixULoc, false, inputTriangles[whichTriSet].vMatrix);
            gl.uniformMatrix4fv(projMatrixULoc, false, inputTriangles[whichTriSet].pMatrix);
            gl.uniform3fv(lightPosULoc, lightPosition);
            gl.uniform3fv(lightColULoc, lightColor);
            // console.log (ambBuffers[whichTriSet]);
            gl.uniform3fv(ambColorULoc, inputTriangles[whichTriSet].material.ambient);
            gl.uniform3fv(difColorULoc, inputTriangles[whichTriSet].material.diffuse);
            gl.uniform3fv(spcColorULoc, inputTriangles[whichTriSet].material.specular);
            // gl.uniform3fv(spcColorULoc, Eye);
            gl.uniform1f(nULoc, inputTriangles[whichTriSet].material.n);
            // gl.uniform1f(lModelULoc, lightingModel);
            // vertex buffer: activate and feed into vertex shader
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffers[whichTriSet]); // activate
            gl.vertexAttribPointer(vertexPositionAttrib, 3, gl.FLOAT, false, 0, 0); // feed
            gl.bindBuffer(gl.ARRAY_BUFFER, normBuffers[whichTriSet]); // activate
            gl.vertexAttribPointer(normAttrib, 3, gl.FLOAT, false, 0, 0); // feed
            // gl.bindBuffer(gl.ARRAY_BUFFER,colorBuffers[whichTriSet]); // activate
            // gl.vertexAttribPointer(vertexColorAttrib,3,gl.FLOAT,false,0,0); // feed
            // triangle buffer: activate and render
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, triangleBuffers[whichTriSet]); // activate
            gl.drawElements(gl.TRIANGLES, 3 * triSetSizes[whichTriSet], gl.UNSIGNED_SHORT, 0); // render
        } // end for each tri set
        game();
        if (!gameOver) requestAnimationFrame(renderTriangles);
        // else playSound();
        if (!player2) {
            if (counter == 1) {
                npDirFlag = rand_dir(0, 3);
                // console.log (npDirFlag);
                switch (npDirFlag) {
                    // case 32 : selectDeselect();console.log ("space"); break;
                    case 0:
                        if (npDir != "right") npDir = "left";
                        console.log("left");
                        break;
                    case 1:
                        if (npDir != "down") npDir = "up";
                        break;
                    case 2:
                        if (npDir != "left") npDir = "right";
                        break;
                    case 3:
                        if (npDir != "up") npDir = "down";
                        break;
                }
            }
            counter++;
            if (counter >= 3) counter = 1;
        }
        // else alert("Game over");
    }, 1000 / FPS);
} // end render triangles
/* MAIN -- HERE is where execution begins after window load */
function main() {
    setupWebGL(); // set up the webGL environment
    loadTriangles(); // load in the triangles from tri file
    setupShaders(); // setup the webGL shaders
    snakeShaders();
    initSnake();
    initnpSnake();
    initRenderTriangles();
    renderTriangles(); // draw the triangles using webGL
    document.onkeydown = function() {
        switch (window.event.keyCode) {
            // case 32 : selectDeselect();console.log ("space"); break;
            case 37:
                if (dir != "right") dir = "left";
                console.log("left");
                break;
            case 38:
                if (dir != "down") dir = "up";
                break;
            case 39:
                if (dir != "left") dir = "right";
                break;
            case 40:
                if (dir != "up") dir = "down";
                break;
            case 65:
                if (npDir != "right") npDir = "left";
                console.log("left2");
                player2 = true;
                document.getElementById("npscoretag").innerHTML = "Miss Hiss' Score: " + score2;
                break;
            case 87:
                if (npDir != "down") npDir = "up";
                player2 = true;
                document.getElementById("npscoretag").innerHTML = "Miss Hiss' Score: " + score2;
                break;
            case 68:
                if (npDir != "left") npDir = "right";
                player2 = true;
                document.getElementById("npscoretag").innerHTML = "Miss Hiss' Score: " + score2;
                break;
            case 83:
                if (npDir != "up") npDir = "down";
                player2 = true;
                document.getElementById("npscoretag").innerHTML = "Miss Hiss' Score: " + score2;
                break;
            case 32: //if (!player2) FPS==5?FPS=10:FPS=5;
                if (!player2) {
                    if (FPS == 5) {
                        FPS = 10;
                        scoreMultiplier *= 2;
                    } else {
                        FPS = 5;
                        scoreMultiplier /= 2;
                    }
                }
                console.log("space");
                break;
            case 77:
                if (!invincibleP1) {
                    invincibleP1 = true;
                    inviCounterP1 = 5;
                    colorsIndex[0] = [0.9, 0.7, 0.1];
                }
                break;
            case 84:
                if (!invincibleP2 && player2) {
                    invincibleP2 = true;
                    inviCounterP2 = 5;
                    colorsIndex[2] = [0.9, 0.7, 0.1];
                }
                break;
            case 73:
                if (shoulder) {
                    shoulder = false;
                    scoreMultiplier /= 2;
                } else {
                    shoulder = true;
                    scoreMultiplier *= 2;
                }
        }
    }
} // end main