let gl, program;
let vertexCount = 36;
let modelViewMatrix, projectionMatrix;
let eye = [0, 0, 0.1];
let at = [0, 0, 0];
let up = [0, 1, 0];
let fovy = 60; // Field of view in degrees
let aspect = 1; // Aspect ratio of the canvas
let near = 0.1; // Near clipping plane
let far = 10.0; // Far clipping plane

onload = () => {
  let canvas = document.getElementById("webgl-canvas");

  gl = WebGLUtils.setupWebGL(canvas);
  if (!gl) {
    alert('No webgl for you');
    return;
  }

  program = initShaders(gl, 'vertex-shader', 'fragment-shader');
  gl.useProgram(program);

  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

  gl.enable(gl.DEPTH_TEST);

  gl.clearColor(0, 0, 0, 0.5);

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

  vertices = scale(0.5, vertices);

  generateCube(vertices, indices, colors);

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

  generateCube(vertices2, indices, colors);

  modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');
  projectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');

  document.addEventListener('keydown', handleKeyDown);

  render();
};

function generateCube(vertices, indices, colors) {
  let vBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  let vPosition = gl.getAttribLocation(program, 'vPosition');
  gl.vertexAttribPointer(vPosition, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vPosition);

  let iBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint8Array(indices), gl.STATIC_DRAW);

  let cBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);

  let vColor = gl.getAttribLocation(program, 'vColor');
  gl.vertexAttribPointer(vColor, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(vColor);
}
//  these keyboard events will trigger the camera
function handleKeyDown(event) {
  switch (event.key) {
    // Top-side view
    case 't':
    case 'T':
      eye = [0, 1, 0.1]; 
      break;
      // Left-side view
    case 'l':
    case 'L':
      eye = [-1, 0, 0.1]; 
      break;
      // Front-side view
    case 'f':
    case 'F':
      eye = [0, 0, 0.1]; 
      break;
      // rotating clockwise by 10 degrees
    case 'd':
    case 'D':
      rotateCamera(10); 
      break;
      // rotating counter-clockwise by -10 degrees
    case 'a':
    case 'A':
      rotateCamera(-10); 
      break;
      // zoom in
    case 'w':
    case 'W':
      zoomIn();
      break;
      // zoom out
    case 's':
    case 'S':
      zoomOut();
      break;
      // orthographic view
    case 'o':
    case 'O':
      setOrthographicView();
      break;
      // perspective view
    case 'p':
    case 'P':
      setPerspectiveView();
      break;
  }

  render();
}

function rotateCamera(theta) {
  // here we converted theta to radians
  let radians = theta * Math.PI / 180;

  //  a rotation matrix
  let rotationMatrix = mat3(
    Math.cos(radians), -Math.sin(radians), 0,
    Math.sin(radians), Math.cos(radians), 0,
    0, 0, 1
  );

  // rotating up vector
  up = vec3(
    rotationMatrix[0][0] * up[0] + rotationMatrix[0][1] * up[1] + rotationMatrix[0][2] * up[2],
    rotationMatrix[1][0] * up[0] + rotationMatrix[1][1] * up[1] + rotationMatrix[1][2] * up[2],
    rotationMatrix[2][0] * up[0] + rotationMatrix[2][1] * up[1] + rotationMatrix[2][2] * up[2]
  );
}

function zoomIn() {
  fovy -= 5; // Decrease the field of view
  if (fovy < 1) fovy = 1; // Limit the minimum field of view
}

function zoomOut() {
  fovy += 5; // Increase the field of view
  if (fovy > 179) fovy = 179; // Limit the maximum field of view
}
function setOrthographicView() {
    let canvas = document.getElementById("webgl-canvas");
    aspect = canvas.width / canvas.height;
    projectionMatrix = ortho(-2 * aspect, 2 * aspect, -2, 2, -10, 10);
    gl.uniformMatrix4fv(projectionMatrix, false, flatten(projectionMatrix));
  }
  
  function setPerspectiveView() {
    let canvas = document.getElementById("webgl-canvas");
    aspect = canvas.width / canvas.height;
    projectionMatrix = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrix, false, flatten(projectionMatrix));
  }
  

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  
    let mvm = lookAt(eye, at, up);
    gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
  
    let proj = perspective(fovy, aspect, near, far);
    gl.uniformMatrix4fv(projectionMatrix, false, flatten(proj));
  
    gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);
  }
  