import Geo from './utils/geo';

// TODO
// export function init(scene, camera) {
export function init(scene) {
    var view = scene.view;
    view.interactionLayer = this;
    // var orbitSpeed = 0.1; // controls mouse-to-orbit speed

    // set event handlers
    scene.canvas.onmousedown = handleMouseDown;
    scene.canvas.onmouseup = handleMouseUp;
    scene.canvas.onclick = handleClick;
    scene.canvas.ondblclick = handleDoubleclick;
    scene.canvas.onmouseleave = handleMouseLeave;
    scene.canvas.onmousemove = handleMouseMove;
    scene.container.onwheel = handleScroll;

    // track mouse state
    var mouseDown = false;
    var lastMouseX = null;
    var lastMouseY = null;

    // track drag screen position
    // var startingX = 0;
    // var startingY = 0;

    // track drag distance from the starting position
    var deltaX = 0;
    var deltaY = 0;

    // function degToRad(deg) {
    //   return deg * Math.PI / 180;
    // }
    // function radToDeg(rad) {
    //   return rad / Math.PI * 180;
    // }

    // // track orbit drag distance, preset with any pre-existing orbit
    // var orbitDeltaX = radToDeg(camera.roll / orbitSpeed);
    // var orbitDeltaY = radToDeg(camera.pitch / orbitSpeed);

    // track drag starting map position
    var startingX = view.center ? view.center.meters.x : null;
    var startingY = view.center ? view.center.meters.y : null;

    // track drag distance from the starting map position
    var metersDeltaX = null;
    var metersDeltaY = null;

    // track modifier key state
    var metaKeyDown = false;

    function handleMouseDown(event) {
        mouseDown = true;
        lastMouseX = event.clientX;
        lastMouseY = event.clientY;
        view.markUserInput();
        startingX = view.center ? view.center.meters.x : null;
        startingY = view.center ? view.center.meters.y : null;

        // don't select UI text on a doubleclick
        if (event.detail > 1) {
            event.preventDefault();
        }
    }

    // TODO
    // function handleMouseUp(event) {
    function handleMouseUp() {
        mouseDown = false;
        lastMouseX = null;
        lastMouseY = null;
        // track last drag offset and apply that as offset to the next drag –
        // otherwise camera resets position and rotation with each drag
        // startingX = orbitDeltaX;
        // startingY = orbitDeltaY;
        startingX = view.center.meters.x;
        startingY = view.center.meters.y;
        deltaX = 0;
        deltaY = 0;
        view.moveEnd();
        scene.update();
    }

    function handleClick(event) {
        if (view.panning) {
            view.setPanning(false);
            return;
        }
        // TODO pass tangramLayer?
        event.lngLat = this.map.unproject([event.clientX, event.clientY]);
        view.onClick(event);
    }

    function handleDoubleclick(event) {
        var newX = event.clientX;
        var newY = event.clientY;

        let deltaX = newX - window.innerWidth / 2;
        let deltaY = newY - window.innerHeight / 2;

        let metersDeltaX = deltaX * Geo.metersPerPixel(view.zoom);
        let metersDeltaY = deltaY * Geo.metersPerPixel(view.zoom);

        let destination = Geo.metersToLatLng([view.center.meters.x + metersDeltaX, view.center.meters.y - metersDeltaY]);
        view.flyTo({
            start: { center: { lng: view.center.lng, lat: view.center.lat }, zoom: view.zoom },
            end: { center: { lng: destination[0], lat: destination[1] }, zoom: view.zoom + 1 }
        });
        scene.update();
    }

    function handleMouseLeave(event) {
        if (!metaKeyDown) { // trigger mouseup on pan, but not orbit
            handleMouseUp(event);
        }
    }

    function resetMouseEventVars(event) {
        handleMouseUp(event);
        handleMouseDown(event);
    }

    function handleMouseMove(event) {
        if (!mouseDown) {
            if (view.panning) {
                view.setPanning(false); // reset pan timer
            }
            return;
        }
        var newX = event.clientX;
        var newY = event.clientY;

        deltaX = newX - lastMouseX;
        deltaY = newY - lastMouseY;

        // pan camera
        if (metaKeyDown) { // meta key was just released during drag, fake a mouseup/mousedown
            resetMouseEventVars(event);
        } else {

            metersDeltaX = deltaX * Geo.metersPerPixel(view.zoom);
            metersDeltaY = deltaY * Geo.metersPerPixel(view.zoom);

            var deltaLatLng = Geo.metersToLatLng([startingX - metersDeltaX, startingY + metersDeltaY]);
            view.setView({ lng: deltaLatLng[0], lat: deltaLatLng[1] });
        }
        metaKeyDown = false;
        view.setPanning(true);
        view.markUserInput();
        scene.requestRedraw();
    }

    function handleScroll(event) {
        var zoomFactor = 0.01; // sets zoom speed with scrollwheel/trackpad
        var targetZoom = view.zoom - event.deltaY * zoomFactor;

        // zoom toward pointer location
        var startPosition = [event.clientX, event.clientY];
        var containerCenter = [scene.container.clientWidth / 2, scene.container.clientHeight / 2];
        var offset = [startPosition[0] - containerCenter[0], startPosition[1] - containerCenter[1]];

        // compensate for roll
        var cosRoll = Math.cos(view.roll);
        var adjustedOffset = [offset[0] * cosRoll + offset[1] * Math.sin(view.roll + Math.PI),
            offset[1] * cosRoll + offset[0] * Math.sin(view.roll)];

        var scrollTarget = [adjustedOffset[0] * Geo.metersPerPixel(view.zoom), adjustedOffset[1] * Geo.metersPerPixel(view.zoom)];
        var panFactor = (targetZoom - view.zoom) * 0.666; // TODO: learn why 0.666 is needed here
        var target = [view.center.meters.x + scrollTarget[0] * panFactor,
            view.center.meters.y - scrollTarget[1] * panFactor];
        target = Geo.metersToLatLng(target);

        view.setView({ lng: target[0], lat: target[1], zoom: targetZoom });
        scene.update();

        // have to set these here too because scroll doesn't count as a mousedown
        // so no mouseup will be triggered at the end
        startingX = view.center.meters.x;
        startingY = view.center.meters.y;

        // prevent scroll event bubbling
        return false;
    }
}
