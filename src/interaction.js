import Scene from './scene';

export function init(layer) {
  var scene = layer.scene;
  var view = scene.view;
  var camera = view.camera;

  scene.canvas.onmousedown = handleMouseDown;
  scene.canvas.onmouseup = handleMouseUp;
  scene.canvas.onmousemove = handleMouseMove;

  // track mouse state
  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

  // track drag position
  var startingX = 0;
  var startingY = 0;

  // track drag distance from the starting position
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
      // otherwise camera resets position and rotation with each drag
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
      view.roll = camera.roll;
      view.pitch = camera.pitch;
      camera.update();
      scene.tile_manager.updateLabels();
  }
}
