import Scene from './scene';
import Geo from './geo';

export function init(layer) {
  var scene = layer.scene;
  var view = scene.view;
  var camera = view.camera;

  scene.canvas.onmousedown = handleMouseDown;
  scene.canvas.onmouseup = handleMouseUp;
  scene.canvas.onmouseleave = handleMouseUp;
  scene.canvas.onmousemove = handleMouseMove;
  scene.container.onwheel = handleScroll;

  // track mouse state
  var mouseDown = false;
  var lastMouseX = null;
  var lastMouseY = null;

  // track drag screen position
  var startingX = 0;
  var startingY = 0;

  // track drag distance from the starting position
  var deltaX = 0;
  var deltaY = 0;
  var orbitDeltaX = null;
  var orbitDeltaY = null;

  // track drag starting map position
  var startingLng = view.center.meters.x;
  var startingLat = view.center.meters.y;

  // track drag distance from the starting map position
  var metersDeltaX = null;
  var metersDeltaY = null;

  // track modifier key state
  var metaKeyDown = false;

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
      startingX = orbitDeltaX;
      startingY = orbitDeltaY;
      startingLng = view.center.meters.x;
      startingLat = view.center.meters.y;
      deltaX = 0;
      deltaY = 0;
  }

  function resetMouseEventVars(event) {
    handleMouseUp(event);
    handleMouseDown(event);
  }

  function handleMouseMove (event) {
    if (!mouseDown) {
        return;
    }
    var newX = event.clientX;
    var newY = event.clientY;

    deltaX = newX - lastMouseX;
    deltaY = newY - lastMouseY;

    if (event.metaKey) { // orbit camera
      if (!metaKeyDown) { // meta key pressed during drag, fake a mouseup/mousedown
        resetMouseEventVars(event);
      }
      metaKeyDown = true;
      orbitDeltaX = startingX + newX - lastMouseX;
      orbitDeltaY = startingY + newY - lastMouseY;
      camera.roll = degToRad(orbitDeltaX * .1);
      camera.pitch = Math.min(degToRad(orbitDeltaY * .1), 0.);
      view.roll = camera.roll;
      view.pitch = camera.pitch;

    } else { // basic pan
      if (metaKeyDown) { // meta key was just released during drag, fake a mouseup/mousedown
        resetMouseEventVars(event);
      } else {
        metersDeltaX = deltaX * Geo.metersPerPixel(view.zoom);
        metersDeltaY = deltaY * Geo.metersPerPixel(view.zoom);

        // compensate for roll
        var cosRoll = Math.cos(scene.view.roll);
        var adjustedDeltaX = metersDeltaX * cosRoll + metersDeltaY * Math.sin(scene.view.roll + Math.PI);
        var adjustedDeltaY = metersDeltaY * cosRoll + metersDeltaX * Math.sin(scene.view.roll);

        var deltaLatLng = Geo.metersToLatLng([startingLng - adjustedDeltaX, startingLat + adjustedDeltaY]);
        view.setView({lng: deltaLatLng[0], lat: deltaLatLng[1]});
      }
      metaKeyDown = false;
    }
    camera.update();
    scene.tile_manager.updateLabels();
  }

  function handleScroll (event) {
    var zoomFactor = .01; // sets zoom speed with scrollwheel/trackpad
    var targetZoom = view.zoom - event.deltaY * zoomFactor;

    // zoom toward pointer location
    var startPosition = [event.clientX, event.clientY];
    var containerCenter = [scene.container.clientWidth / 2, scene.container.clientHeight / 2];
    var offset = [startPosition[0] - containerCenter[0], startPosition[1] - containerCenter[1]];

    // compensate for roll
    var cosRoll = Math.cos(scene.view.roll);
    var adjustedOffset = [offset[0] * cosRoll + offset[1] * Math.sin(scene.view.roll + Math.PI),
                      offset[1] * cosRoll + offset[0] * Math.sin(scene.view.roll)];

    var scrollTarget = [adjustedOffset[0] * Geo.metersPerPixel(view.zoom), adjustedOffset[1] * Geo.metersPerPixel(view.zoom)];
    var panFactor = (targetZoom - view.zoom) * .666; // I don't know why .666 is needed here
    var target = [view.center.meters.x + scrollTarget[0] * panFactor,
                  view.center.meters.y - scrollTarget[1] * panFactor];
    target = Geo.metersToLatLng(target);

    view.setView({lng: target[0], lat: target[1], zoom: targetZoom});

    // have to set these here too because scroll doesn't count as a mousedown
    // so no mouseup will be triggered at the end
    startingLng = view.center.meters.x;
    startingLat = view.center.meters.y;

    // prevent scroll event bubbling
    return false;
  }
}
