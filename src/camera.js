/*global Camera */
import Geo from './geo';
import Utils from './utils/utils';
import ShaderProgram from './gl/shader_program';

import glMatrix from 'gl-matrix';
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;

// Abstract base class
export default class Camera {

    constructor(name, scene, options = {}) {
        this.scene = scene;
        this.position = options.position;
        this.zoom = options.zoom;
        // this.updateScene();
    }

    // Create a camera by type name, factory-style
    static create(name, scene, config) {
        switch (config.type) {
            case 'isometric':
                return new IsometricCamera(name, scene, config);
            case 'flat':
                return new FlatCamera(name, scene, config);
            case 'perspective':
            /* falls through */
            default:
                return new PerspectiveCamera(name, scene, config);
        }
    }

    // Update method called once per frame
    update() {
        // this.updateScene();
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram(program) {
    }

    // Sync camera position and/or zoom to scene
    updateScene () {
        if (this.position || this.zoom) {
            var view = {};
            if (this.position) {
                view = this.position;
            }
            if (this.zoom) {
                view.zoom = this.zoom;
            }
            this.scene.setView(view);
        }
    }

}

/**
    Perspective matrix projection

    This is a specialized perspective camera that, given a desired camera focal length (which can also vary by zoom level),
    constrains the camera height above the ground plane such that the displayed ground area of the map matches that of
    a traditional web mercator map. This means you can set the camera location by [lat, lng, zoom] as you would a typical
    web mercator map, then adjust the focal length as needed.

    Vanishing point can also be adjusted to achieve different "viewing angles", e.g. instead of looking straight down into
    the center of the viewport, the camera appears to be tilted at an angle. For example:

    [0, 0] = looking towards center of viewport
    [-250, -250] = looking 250 pixels from the viewport center to the lower-left corner
    [400, 0] = looking 400 pixels to the right of the viewport center
*/
class PerspectiveCamera extends Camera {

    constructor(name, scene, options = {}) {
        super(name, scene, options);
        this.type = 'perspective';

        // a single scalar, or pairs of stops mapping zoom levels, e.g. [zoom, focal length]
        this.focal_length = options.focal_length;
        this.fov = options.fov;
        if (!this.focal_length && !this.fov) {
            // Default focal length ranges by zoom
            this.focal_length = [[16, 2], [17, 2.5], [18, 3], [19, 4], [20, 6]];
        }

        this.vanishing_point = options.vanishing_point || [0, 0]; // [x, y]

        this.height = null;
        this.viewMatrix = new Float64Array(16);
        this.projectionMatrix = new Float32Array(16);

        // 'camera' is the name of the shader transform, e.g. determines where in the shader this code is injected
        ShaderProgram.removeTransform('camera');
        ShaderProgram.addTransform('camera', `
            uniform mat4 u_projection;

            void cameraProjection (inout vec4 position) {
                position = u_projection * position;
            }`
        );
    }

    // Constrains the camera so that the viewable area matches given the viewport height
    // (in world space, e.g. meters), given either a camera focal length or field-of-view
    // (focal length is used if both are passed).
    constrainCamera({ view_height, height, focal_length, fov }) {
        // Solve for camera height
        if (!height) {
            // We have focal length, calculate FOV
            if (focal_length) {
                fov = Math.atan(1 / focal_length) * 2;
            }
            // We have FOV, calculate focal length
            else if (fov) {
                fov = fov * Math.PI / 180; // convert FOV degrees to radians
                focal_length = 1 / Math.tan(fov / 2);
            }

            // Distance that camera should be from ground such that it fits the field of view expected
            // for a conventional web mercator map at the current zoom level and camera focal length
            height = view_height / 2 * focal_length;
        }
        // Solve for camera focal length / field-of-view
        else {
            focal_length = 2 * height / view_height;
            fov = Math.atan(1 / focal_length) * 2;
        }

        return { view_height, height, focal_length, fov };
    }

    updateMatrices() {
        // TODO: only re-calculate these vars when necessary

        // Height of the viewport in meters at current zoom
        var view_height_meters = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);

        // Compute camera properties to fit desired view
        var { height, fov } = this.constrainCamera({
            view_height: view_height_meters,
            focal_length: Utils.interpolate(this.scene.zoom, this.focal_length),
            fov: Utils.interpolate(this.scene.zoom, this.fov)
         });

        // View matrix
        var position = [this.scene.center_meters.x, this.scene.center_meters.y, height];
        // mat4.lookAt(this.viewMatrix,
        //     vec3.fromValues(...position),
        //     vec3.fromValues(position[0], position[1], height - 1),
        //     vec3.fromValues(0, 1, 0));
        // Exclude camera height from view matrix
        mat4.lookAt(this.viewMatrix,
            vec3.fromValues(position[0], position[1], 0),
            vec3.fromValues(position[0], position[1], -1),
            vec3.fromValues(0, 1, 0));

        // Projection matrix
        mat4.perspective(this.projectionMatrix, fov, this.scene.view_aspect, 1, height + 1);

        // Convert vanishing point from pixels to viewport space
        var vanishing_point = [
            this.vanishing_point[0] / this.scene.css_size.width,
            this.vanishing_point[1] / this.scene.css_size.height
        ];

        // Adjust projection matrix to include vanishing point skew
        this.projectionMatrix[8] = -vanishing_point[0]; // z column of x row, e.g. amount z skews x
        this.projectionMatrix[9] = -vanishing_point[1]; // z column of y row, e.g. amount z skews y

        // Translate geometry into the distance so that camera is appropriate height above ground
        // Additionally, adjust xy to compensate for any vanishing point skew, e.g. move geometry so that the displayed g
        // plane of the map matches that expected by a traditional web mercator map at this [lat, lng, zoom].
        mat4.translate(this.projectionMatrix, this.projectionMatrix,
            vec3.fromValues(
                view_height_meters/2 * this.scene.view_aspect * -vanishing_point[0],
                view_height_meters/2 * -vanishing_point[1],
                0
            )
        );

        // Include camera height in projection matrix
        mat4.translate(this.projectionMatrix, this.projectionMatrix, vec3.fromValues(0, 0, -height));
    }

    update() {
        super.update();
        this.updateMatrices();
    }

    setupProgram(program) {
        program.uniform('Matrix4fv', 'u_projection', false, this.projectionMatrix);
    }

}

// Isometric-style projection
// Note: this is actually an "axonometric" projection, but I'm using the colloquial term isometric because it is more recognizable.
// An isometric projection is a specific subset of axonometric projections.
// 'axis' determines the xy skew applied to a vertex based on its z coordinate, e.g. [0, 1] axis causes buildings to be drawn
// straight upwards on screen at their true height, [0, .5] would draw them up at half-height, [1, 0] would be sideways, etc.
class IsometricCamera extends Camera {

    constructor(name, scene, options = {}) {
        super(name, scene, options);
        this.type = 'isometric';
        this.axis = options.axis || { x: 0, y: 1 };
        if (this.axis.length === 2) {
            this.axis = { x: this.axis[0], y: this.axis[1] }; // allow axis to also be passed as 2-elem array
        }

        this.viewMatrix = new Float64Array(16);
        this.projectionMatrix = new Float32Array(16);

        // 'camera' is the name of the shader transform, e.g. determines where in the shader this code is injected
        ShaderProgram.removeTransform('camera');
        ShaderProgram.addTransform('camera', `
            uniform mat4 u_projection;

            void cameraProjection (inout vec4 position) {
                position = u_projection * position;
                // position.xy += position.z * u_isometric_axis;

                // Reverse z for depth buffer so up is negative,
                // and scale down values so objects higher than one screen height will not get clipped
                // pull forward slightly to avoid going past far clipping plane
                position.z = -position.z / 100. + 1. - 0.001;
            }`
        );
    }

    update() {
        super.update();

        // View
        var position = [this.scene.center_meters.x, this.scene.center_meters.y];
        mat4.identity(this.viewMatrix);
        mat4.translate(this.viewMatrix, this.viewMatrix, vec3.fromValues(-position[0], -position[1], 0));

        // Projection
        mat4.identity(this.projectionMatrix);

        // apply isometric skew
        this.projectionMatrix[8] = this.axis.x / this.scene.view_aspect;    // z column of x row, e.g. amount z skews x
        this.projectionMatrix[9] = this.axis.y;                             // z column of x row, e.g. amount z skews y

        // convert meters to viewport
        mat4.scale(this.projectionMatrix, this.projectionMatrix,
            vec3.fromValues(
                2 / this.scene.viewport_meters.x,
                2 / this.scene.viewport_meters.y,
                2 / this.scene.viewport_meters.y
            )
        );
    }

    setupProgram(program) {
        program.uniform('Matrix4fv', 'u_projection', false, this.projectionMatrix);
    }

}

// Flat projection (e.g. just top-down, no perspective) - a degenerate isometric camera
class FlatCamera extends IsometricCamera {

    constructor(name, scene, options = {}) {
        super(name, scene, options);
        this.type = 'flat';
    }

    update() {
        // Axis is fixed to (0, 0) for flat camera
        this.axis.x = 0;
        this.axis.y = 0;

        super.update();
    }

}
