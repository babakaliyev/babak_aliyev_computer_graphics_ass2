let gl, program;
let vertexCount = 36;
let modelViewMatrix;
let projectionMatrix;
let eye = [0, 0, 0.1];
let at = [0, 0, 0];
let up = [0, 1, 0];
let left = -2, right = 2, bottom = -2, ytop = 2, near = -10, far = 10;
let fovy=45;


let isOrthographic = false; // Flag for orthographic projection

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert("No webgl for you");
    return;
  }

  program = initShaders(gl, "vertex-shader", "fragment-shader");
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);


  let indices = [
    0, 3, 1,
    1, 3, 2,
    4, 7, 5,
    5, 7, 6,
    3, 7, 2,
    2, 7, 6,
    4, 0, 5,
    5, 0, 1,
    1, 2, 5,
    5, 2, 6,
    0, 3, 4,
    4, 3, 7,
  ];

  let colors = [
    0, 0, 0,
    0, 0, 1,
    0, 1, 0,
    0, 1, 1,
    1, 0, 0,
    1, 0, 1,
    1, 1, 0,
    1, 1, 1,
  ];

  
  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, "vColor");
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);

  modelViewMatrix = gl.getUniformLocation(program, "modelViewMatrix");

  // Add event listeners for keyboard events
  document.addEventListener("keydown", handleKeyDown);

  render();
};

let vertices = [
  -1, -1, 1,
  -1, 1, 1,
  1, 1, 1,
  1, -1, 1,
  -1, -1, -1,
  -1, 1, -1,
  1, 1, -1,
  1, -1, -1,
];

let vertices2 = [
  3, -1, -1,
  3, 1, -1,
  5, 1, -1,
  5, -1, -1,
  3, -1, -3,
  3, 1, -3,
  5, 1, -3,
  5, -1, -3,
];
function createCube(vertices) {
  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, "vPosition");
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);
}
// These keyboard events will trigger the camera
function handleKeyDown(event) { 
  switch (event.key) {
    case "i":
    case "I":
      eye = [2, 2, 2];
      up = [0, 1, 0];
      break;
    case 'd':
    case 'D':
      rotateCamera(10);
      break;
    // Counter-clockwise rotation by -10 degrees
    case 'a':
    case 'A':
      rotateCamera(-10);
      break;
      case "w":
      case "W":
      // Zoom in camera
      zoomInCamera();
      break;
    case "s":
    case "S":
      zoomOutCamera();
     break;
    case "o":
    case "O":
      isOrthographic = true;
      break;
    case "p":
    case "P":
      isOrthographic = false;
      break;
  }
}
// Zoom in camera function
function zoomInCamera() {
  if (isOrthographic) {
    left += 1.0;
    right -= 1.0;
    bottom += 1.0;
    ytop -= 1.0;
  } else {
    eye[2] -= 0.1;
  }
}
// zoom out  camera function
function zoomOutCamera() {
  if (isOrthographic) {
    left -= 1.0;
    right += 1.0;
    bottom -= 1.0;
    ytop += 1.0;
  } else {
    eye[2] += 0.1;
  }
}

function rotateCamera(theta) {
  let radians = theta * Math.PI / 180;
  let rotationMatrix;

  if (eye[0] === 0 && eye[1] === 0 && eye[2] === 0.1) {  
    rotationMatrix = mat3(
      Math.cos(radians), -Math.sin(radians), 0,
      Math.sin(radians), Math.cos(radians), 0,
      0, 0, 1
    );
  } else if (eye[0] === -1 && eye[1] === 0 && eye[2] === 0) {  
    rotationMatrix = mat3(
      Math.cos(radians), 0, Math.sin(radians),
      0, 1, 0,
      -Math.sin(radians), 0, Math.cos(radians)
    );
  } else {
    rotationMatrix = mat3(
      Math.cos(radians), -Math.sin(radians), 0,
      Math.sin(radians), Math.cos(radians), 0,
      0, 0, 1
    );
  }

  up = vec3(
    rotationMatrix[0][0] * up[0] + rotationMatrix[0][1] * up[1] + rotationMatrix[0][2] * up[2],
    rotationMatrix[1][0] * up[0] + rotationMatrix[1][1] * up[1] + rotationMatrix[1][2] * up[2],
    rotationMatrix[2][0] * up[0] + rotationMatrix[2][1] * up[1] + rotationMatrix[2][2] * up[2]
  );
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  if (isOrthographic) {
    let projectionMatrix = ortho(left, right, bottom, ytop, near, far);
    let mvm = lookAt(eye, at, up);
    let MofP= mult(projectionMatrix, mvm);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(MofP));
    createCube(vertices);
    createCube(vertices2); 
  } 
else {
    let projectionMatrix = perspective(fovy, gl.canvas.width / gl.canvas.height, near, far);
    let mvm = lookAt(eye, at, up);
    MofP = mult(projectionMatrix, mvm);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(MofP));
    createCube(vertices);
    createCube(vertices2); 
  }

  requestAnimationFrame(render);
}






