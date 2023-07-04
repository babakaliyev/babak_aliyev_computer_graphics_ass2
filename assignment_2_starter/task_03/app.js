let gl, program;
let vertexCount = 36;
let modelViewMatrix;
let projectionMatrix;
let eye = [2, 2, 2]; 
let up=[0,1,0];
let at = [0, 0, 0];
let left = -2, right = 2, bottom = -2, ytop = 2, near = -10, far = 10;
let fovy = 45;

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
// These keyboard events will trigger the camera
function handleKeyDown(event) {
  switch (event.key) {
    // Clockwise by 10 degrees
    case 'd':
    case 'D':
      rotateCamera(10); 
      break;
    // Counter-clockwise by -10 degrees
    case 'a':
    case 'A':
      rotateCamera(-10); 
      break;
    // Isometric view
    case 'i':
    case 'I':
      eye = [2, 2, 2]; 
      up=[0,1,0];
      break;
    // Zoom in
    case 'w':
    case 'W':
      zoomIn(); 
      break;
    // Zoom out
    case 's':
    case 'S':
      zoomOut(); 
      break;
  }

  render();
}
function zoomIn(){
  eye[0] *= 0.5;
  eye[1] *= 0.5;
  eye[2] *= 0.5;
}
function zoomOut(){
  eye[0] *= 1.1;
  eye[1] *= 1.1;
  eye[2] *= 1.1;
}
function rotateCamera(theta) {
  let radians = theta * Math.PI / 180;
  let rotationMatrix;

  if (eye[0] === 0 && eye[1] === 0 && eye[2] === 0.1) {  // Front-side view
    rotationMatrix = mat3(
      Math.cos(radians), -Math.sin(radians), 0,
      Math.sin(radians), Math.cos(radians), 0,
      0, 0, 1
    );
  } else if (eye[0] === -1 && eye[1] === 0 && eye[2] === 0) {  // Left-side view
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
  
  let mvm = lookAt(eye, at, up);
  let proj = perspective(fovy, gl.canvas.width / gl.canvas.height, near, far);

  gl.uniformMatrix4fv(modelViewMatrix, false, flatten(mvm));
  gl.uniformMatrix4fv(projectionMatrix, false, flatten(proj));

  gl.drawElements(gl.TRIANGLES, vertexCount, gl.UNSIGNED_BYTE, 0);

  requestAnimationFrame(render);
}
