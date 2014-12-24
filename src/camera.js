/*global Camera */
import {Geo} from './geo';
import Utils from './utils';
import GLProgram from './gl/gl_program';

import glMatrix from 'gl-matrix';
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;

// Abstract base class
export default class Camera {

    constructor(scene) {
        this.scene = scene;
    }

    // Create a camera by type name, factory-style
    static create(scene, config) {
        switch (config.type) {
            case 'isometric':
                return new IsometricCamera(scene, config);
            case 'perspective':
                return new PerspectiveCamera(scene, config);
            case 'flat':
            /* falls through */
            default:
                return new FlatCamera(scene, config);
        }
    }

    // Update method called once per frame
    update() {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram(program) {
    }

}

// Classic perspective matrix projection
// This is a specialized perspective camera that, given a desired camera focal length (which can also vary by zoom level),
// constrains the camera height above the ground plane such that the displayed ground area of the map matches that of
// a traditional web mercator map. This means you can set the camera location by [lat, lng, zoom] as you would a typical
// web mercator map, then adjust the focal length as needed.
// Vanishing point can also be adjusted to achieve different "viewing angles", e.g. instead of looking straight down into
// the center of the viewport, the camera appears to be tilted at an angle. For example:
// [0, 0] = looking towards center of screen
// [-1, -1] = looking at lower-left corner of screen
// [1, 0] = looking at center-right side of screen
class PerspectiveCamera extends Camera {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'perspective';

        // a single scalar, or pairs of stops mapping zoom levels, e.g. [zoom, focal length]
        this.focal_length = options.focal_length || [[16, 2], [17, 2.5], [18, 3], [19, 4], [20, 6]];

        this.vanishing_point = options.vanishing_point || [0, 0]; // [x, y]
        this._vanishing_point = [];

        this.height = null;
        this.computed_focal_length = null;
        this.perspective_mat = mat4.create();

        // 'camera' is the name of the shader transform, e.g. determines where in the shader this code is injected
        GLProgram.removeTransform('camera');
        GLProgram.addTransform('camera', `
            uniform mat4 u_perspective;

            void cameraProjection (inout vec4 position) {
                position = u_perspective * position;
            }`
        );
    }

    update() {
        // TODO: only re-calculate these vars when necessary

        // Height of the viewport in meters at current zoom
        var meter_zoom_y = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);

        // Determine focal length, which can be a constant value, or interpolated across zoom levels
        this.computed_focal_length = Utils.interpolate(this.scene.zoom, this.focal_length);

        // Distance that camera should be from ground such that it fits the field of view expected
        // for a conventional web mercator map at the current zoom level and camera focal length
        this.height = meter_zoom_y / 2 * this.computed_focal_length;

        // Perspective matrix params
        // Adjusment of focal length (arctangent) is because perspective matrix builder expects field-of-view in radians, but we are
        // passing the final value expected to be in the perspective matrix, so we need to reverse-calculate the original FOV here.
        var fov = Math.atan(1 / this.computed_focal_length) * 2;
        var aspect = this.scene.view_aspect;
        var znear = 1;
        var zfar = (this.height + 1);

        mat4.perspective(this.perspective_mat, fov, aspect, znear, zfar);

        // Convert vanishing point from pixels to viewport space
        this._vanishing_point[0] = this.vanishing_point[0] / this.scene.css_size.width;
        this._vanishing_point[1] = this.vanishing_point[1] / this.scene.css_size.height;

        // Adjust perspective matrix to include vanishing point skew
        this.perspective_mat[8] = -this._vanishing_point[0]; // z column of x row, e.g. factor by which z coordinate skews x coordinate
        this.perspective_mat[9] = -this._vanishing_point[1]; // z column of y row, e.g. factor by which z coordinate skews y coordinate

        // Translate geometry into the distance so that camera is appropriate height above ground
        // Additionally, adjust xy to compensate for any vanishing point skew, e.g. move geometry so that the displayed ground
        // plane of the map matches that expected by a traditional web mercator map at this [lat, lng, zoom].
        mat4.translate(this.perspective_mat, this.perspective_mat, vec3.fromValues(
            meter_zoom_y/2 * aspect * -this._vanishing_point[0],
            meter_zoom_y/2 * -this._vanishing_point[1],
            -this.height)
        );
    }

    setupProgram(program) {
        program.uniform('Matrix4fv', 'u_perspective', false, this.perspective_mat);
    }

}

// Isometric-style projection
// Note: this is actually an "axonometric" projection, but I'm using the colloquial term isometric because it is more recognizable.
// An isometric projection is a specific subset of axonometric projections.
// 'axis' determines the xy skew applied to a vertex based on its z coordinate, e.g. [0, 1] axis causes buildings to be drawn
// straight upwards on screen at their true height, [0, .5] would draw them up at half-height, [1, 0] would be sideways, etc.
class IsometricCamera extends Camera {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'isometric';
        this.axis = options.axis || { x: 0, y: 1 };
        if (this.axis.length === 2) {
            this.axis = { x: this.axis[0], y: this.axis[1] }; // allow axis to also be passed as 2-elem array
        }

        this.meter_view_mat = mat4.create();

        // 'camera' is the name of the shader transform, e.g. determines where in the shader this code is injected
        GLProgram.removeTransform('camera');
        GLProgram.addTransform('camera', `
            uniform mat4 u_meter_view;
            uniform vec2 u_isometric_axis;

            void cameraProjection (inout vec4 position) {
                position = u_meter_view * position;
                position.xy += position.z * u_isometric_axis;

                // Reverse z for depth buffer so up is negative,
                // and scale down values so objects higher than one screen height will not get clipped
                position.z = -position.z / 100. + 1. - 0.001; // pull forward slightly to avoid going past far clipping plane
            }`
        );
    }

    update() {
        // Convert mercator meters to screen space
        mat4.identity(this.meter_view_mat);
        mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
    }

    setupProgram(program) {
        program.uniform('2f', 'u_isometric_axis', this.axis.x / this.scene.view_aspect, this.axis.y);
        program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
    }

}

// Flat projection (e.g. just top-down, no perspective) - a degenerate isometric camera
class FlatCamera extends IsometricCamera {

    constructor(scene, options = {}) {
        super(scene, options);
        this.type = 'flat';
    }

    update() {
        // Axis is fixed to (0, 0) for flat camera
        this.axis.x = 0;
        this.axis.y = 0;

        super.update();
    }

}
