import Scene from './scene';

export function init(layer) {
  var scene = layer.scene;
  var camera = scene.view.camera;

  scene.canvas.onmousedown = handleMouseDown;
  scene.canvas.onmouseup = handleMouseUp;
  scene.canvas.onmousemove = handleMouseMove;

  // track mouse state
  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

  // maintain pitch and roll between drags
  var startingX = 0;
  var startingY = 0;

  // track pitch and roll offset from 0
  var deltaX = null;
  var deltaY = null;

  function degToRad(deg) {
    return deg * Math.PI / 180;
  }

  function handleMouseDown (event) {
      mouseDown = true;
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
  }

  function handleMouseUp (event) {
      mouseDown = false;
      lastMouseX = null;
      lastMouseY = null;
      // track last drag offset and apply that as offset to the next drag –
      // otherwise camera resets pitch and roll with each drag
      startingX = deltaX;
      startingY = deltaY;
  }

  function handleMouseMove (event) {
      if (!mouseDown) {
          return;
      }
      var newX = event.clientX;
      var newY = event.clientY;

      deltaX = startingX + newX - lastMouseX;
      deltaY = startingY + newY - lastMouseY;

      camera.roll = degToRad(deltaY) / 10;
      camera.pitch = degToRad(deltaX) / 10;
      camera.updateMatrices();
      scene.requestRedraw();
  }
}
