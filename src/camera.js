import {Geo} from './geo';
import GLProgram from './gl/gl_program';

import glMatrix from 'gl-matrix';
var mat4 = glMatrix.mat4;
var vec3 = glMatrix.vec3;

// Note: We want something more like an interface here. Such a thin base class may not be worth it, but does provide some notational clarity anyway.
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
            default:
                return new FlatCamera(scene, config);
        }
    }

    // Update method called once per frame
    update() {
    }

    // Called once per frame per program (e.g. for main render pass, then for eac additional pass for feature selection, etc.)
    setupProgram(gl_program) {
    }

}

export class PerspectiveCamera extends Camera {

    constructor(scene, options = {}) {
        super(scene);
        this.focal_length = 2.5;
        this.perspective_mat = mat4.create();

        GLProgram.removeTransform('camera');
        GLProgram.addTransform(
            'camera',

            'uniform mat4 u_perspective;',

            'void cameraProjection (inout vec4 position) { \n\
                position = u_perspective * position; \n\
            }'
        );
    }

    update() {
        // Height of the viewport in meters at current zoom
        var meter_zoom_y = this.scene.css_size.height * Geo.metersPerPixel(this.scene.zoom);

        // Distance that camera should be from ground such that it fits the field of view expected
        // for a conventional web mercator map at the current zoom level and camera focal length
        var camera_height = meter_zoom_y / 2 * this.focal_length;

        // Perspective matrix params
        // Adjusment of focal length (arctangent) is because perspective matrix builder expects field-of-view in radians, but we are
        // passing the final value expected to be in the perspective matrix, so we need to reverse-calculate the original FOV here.
        var fov = Math.atan(1 / this.focal_length) * 2;
        var aspect = this.scene.view_aspect;
        var znear = 1;                           // zero clipping plane cause artifacts, looks like z precision issues (TODO: why?)
        var zfar = (camera_height + znear) * 5;  // put geometry in near 20% of clipping plane, to take advantage of higher-precision depth range (TODO: calculate the depth needed to place geometry at z=0 in normalized device coords?)

        mat4.perspective(this.perspective_mat, fov, aspect, znear, zfar);

        // Translate geometry into the distance so that camera is appropriate level above ground
        mat4.translate(this.perspective_mat, this.perspective_mat, vec3.fromValues(0, 0, -camera_height));
    }

    setupProgram(gl_program) {
        gl_program.uniform('Matrix4fv', 'u_perspective', false, this.perspective_mat);
    }

}

// Isometric-style projection
export class IsometricCamera extends Camera {

    constructor(scene, options = {}) {
        super(scene);
        this.meter_view_mat = mat4.create();

        GLProgram.removeTransform('camera');
        GLProgram.addTransform(
            'camera',

            'uniform mat4 u_meter_view;',

            'vec2 isometric_axis = vec2(0., 1.);',
            'float isometric_scale = 1.;',

            'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                position.xy += position.z * isometric_axis * isometric_scale / 1.; \n\
                                                                                    \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }'
        );
    }

    update() {
        // Convert mercator meters to screen space
        mat4.identity(this.meter_view_mat);
        mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
    }

    setupProgram(gl_program) {
        gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
    }

}

// Flat projection (e.g. just top-down, no perspective)
export class FlatCamera extends Camera {

    constructor(scene, options = {}) {
        super(scene);
        this.meter_view_mat = mat4.create();

        GLProgram.removeTransform('camera');
        GLProgram.addTransform(
            'camera',

            'uniform mat4 u_meter_view;',

            'void cameraProjection (inout vec4 position) { \n\
                position = u_meter_view * position; \n\
                                                                \n\
                // Reverse z for depth buffer so up is negative, \n\
                // and scale down values so objects higher than one screen height will not get clipped \n\
                position.z = -position.z / 100. + 1.; \n\
            }'
        );
    }

    update() {
        // Convert mercator meters to screen space
        mat4.identity(this.meter_view_mat);
        mat4.scale(this.meter_view_mat, this.meter_view_mat, vec3.fromValues(1 / this.scene.meter_zoom.x, 1 / this.scene.meter_zoom.y, 1 / this.scene.meter_zoom.y));
    }

    setupProgram(gl_program) {
        gl_program.uniform('Matrix4fv', 'u_meter_view', false, this.meter_view_mat);
    }

}
