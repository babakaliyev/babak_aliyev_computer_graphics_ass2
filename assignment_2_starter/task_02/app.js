let gl, program;
let vertexCount = 36;
let modelViewMatrix, projectionMatrix;
let eye = [0, 0, 0.1];
let at = [0, 0, 0];
let up = [0, 1, 0];
let left = -1, right = 1, bottom = -1, ytop = 1, near = -10, far = 10;

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

  modelViewMatrix = gl.getUniformLocation(program, 'modelViewMatrix');
  projectionMatrix = gl.getUniformLocation(program, 'projectionMatrix');

  document.addEventListener('keydown', handleKeyDown);

  render();
};

function handleKeyDown(event) {
  switch (event.key) {
    case 't':
    case 'T':
      eye = [0, 1, 0.1]; // Top-side view
      break;
    case 'l':
    case 'L':
      eye = [-1, 0, 0.1]; // Left-side view
      break;
    case 'f':
    case 'F':
      eye = [0, 0, 0.1]; // Front-side view
      break;
    case 'd':
    case 'D':
      rotateCamera(-30); // Rotate clockwise by 30 degrees
      break;
    case 'a':
    case 'A':
      rotateCamera(30); // Rotate counter-clockwise by 30 degrees
      break;
    case 'i':
    case 'I':
      eye = [1, 1, 1]; // Isometric view
      break;
    case 'w':
    case 'W':
      zoomIn(); // Zoom in
      break;
    case 's':
    case 'S':
      zoomOut(); // Zoom out
      break;
  }

  render();
}

function rotateCamera(theta) {
  let radius = Math.sqrt(eye[0] * eye[0] + eye[1] * eye[1]);
  let phi = Math.atan2(eye[1], eye[0]);

  phi += theta * (Math.PI / 180.0);

  eye[0] = radius * Math.cos(phi);
  eye[1] = radius * Math.sin(phi);
}

function zoomIn() {
  left += 0.1;
  right -= 0.1;
  bottom += 0.1;
  ytop -= 0.1;
}

function zoomOut() {
  left -= 0.1;
  right += 0.1;
  bottom -= 0.1;
  ytop += 0.1;
}

function render() {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

  let mvm = lookAt(eye, at, up);
  let proj = ortho(left, right, bottom, ytop, near, far);

  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(proj));

  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);
}

function handleKeyPress(event) {
  // Only handle key presses if the canvas has focus
  if (document.activeElement.tagName === 'CANVAS') {
    handleKeyDown(event);
  }
}
