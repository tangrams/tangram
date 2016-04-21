import Utils from './utils/utils';
import ShaderProgram from './gl/shader_program';
import {mat4, mat3, vec3} from './utils/gl-matrix';

// Abstract base class
export default class Camera {

    constructor(name, view, options = {}) {
        this.view = view;
        this.position = options.position;
        this.zoom = options.zoom;
    }

    // Create a camera by type name, factory-style
    static create(name, view, config) {
        switch (config.type) {
            case 'isometric':
                return new IsometricCamera(name, view, config);
            case 'flat':
                return new FlatCamera(name, view, config);
            case 'perspective':
            /* falls through */
            default:
                return new PerspectiveCamera(name, view, config);
        }
    }

    // Update method called once per frame
    update() {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram(program) {
    }

    // Sync camera position/zoom to scene view
    updateView () {
        if (this.position || this.zoom) {
            var view = {};
            if (this.position) {
                view = { lng: this.position[0], lat: this.position[1], zoom: this.position[2] };
            }
            if (this.zoom) {
                view.zoom = this.zoom;
            }
            this.view.setView(view);
        }
    }

    // Set model-view and normal matrices
    setupMatrices (matrices, program) {
        // Model view matrix - transform tile space into view space (meters, relative to camera)
        mat4.multiply(matrices.model_view32, this.view_matrix, matrices.model);
        program.uniform('Matrix4fv', 'u_modelView', matrices.model_view32);

        // Normal matrices - transforms surface normals into view space
        mat3.normalFromMat4(matrices.normal32, matrices.model_view32);
        mat3.invert(matrices.inverse_normal32, matrices.normal32);
        program.uniform('Matrix3fv', 'u_normalMatrix', matrices.normal32);
        program.uniform('Matrix3fv', 'u_inverseNormalMatrix', matrices.inverse_normal32);
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

    constructor(name, view, options = {}) {
        super(name, view, options);
        this.type = 'perspective';

        // a single scalar, or pairs of stops mapping zoom levels, e.g. [zoom, focal length]
        this.focal_length = options.focal_length;
        this.fov = options.fov;
        if (!this.focal_length && !this.fov) {
            // Default focal length ranges by zoom
            this.focal_length = [[16, 2], [17, 2.5], [18, 3], [19, 4], [20, 6]];
        }

        this.vanishing_point = options.vanishing_point || [0, 0]; // [x, y]
        this.vanishing_point = this.vanishing_point.map(parseFloat); // we implicitly only support px units here
        this.vanishing_point_skew = [];

        this.position_meters = null;
        this.view_matrix = new Float64Array(16);
        this.projection_matrix = new Float32Array(16);

        // 'camera' is the name of the shader block, e.g. determines where in the shader this code is injected
        ShaderProgram.replaceBlock('camera', `
            uniform mat4 u_projection;
            uniform vec3 u_eye;
            uniform vec2 u_vanishing_point;

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
        var viewport_height = this.view.size.css.height * this.view.meters_per_pixel;

        // Compute camera properties to fit desired view
        var { height, fov } = this.constrainCamera({
            view_height: viewport_height,
            focal_length: Utils.interpolate(this.view.zoom, this.focal_length),
            fov: Utils.interpolate(this.view.zoom, this.fov)
         });

        // View matrix
        var position = [this.view.center.meters.x, this.view.center.meters.y, height];
        this.position_meters = position;

        // mat4.lookAt(this.view_matrix,
        //     vec3.fromValues(...position),
        //     vec3.fromValues(position[0], position[1], height - 1),
        //     vec3.fromValues(0, 1, 0));
        // Exclude camera height from view matrix
        mat4.lookAt(this.view_matrix,
            vec3.fromValues(position[0], position[1], 0),
            vec3.fromValues(position[0], position[1], -1),
            vec3.fromValues(0, 1, 0));

        // Projection matrix
        mat4.perspective(this.projection_matrix, fov, this.view.aspect, 1, height * 2);

        // Convert vanishing point from pixels to viewport space
        this.vanishing_point_skew[0] = this.vanishing_point[0] / this.view.size.css.width;
        this.vanishing_point_skew[1] = this.vanishing_point[1] / this.view.size.css.height;

        // Adjust projection matrix to include vanishing point skew
        this.projection_matrix[8] = -this.vanishing_point_skew[0]; // z column of x row, e.g. amount z skews x
        this.projection_matrix[9] = -this.vanishing_point_skew[1]; // z column of y row, e.g. amount z skews y

        // Translate geometry into the distance so that camera is appropriate height above ground
        // Additionally, adjust xy to compensate for any vanishing point skew, e.g. move geometry so that the displayed g
        // plane of the map matches that expected by a traditional web mercator map at this [lat, lng, zoom].
        mat4.translate(this.projection_matrix, this.projection_matrix,
            vec3.fromValues(
                viewport_height/2 * this.view.aspect * -this.vanishing_point_skew[0],
                viewport_height/2 * -this.vanishing_point_skew[1],
                0
            )
        );

        // Include camera height in projection matrix
        mat4.translate(this.projection_matrix, this.projection_matrix, vec3.fromValues(0, 0, -height));
    }

    update() {
        super.update();
        this.updateMatrices();
    }

    setupProgram(program) {
        program.uniform('Matrix4fv', 'u_projection', this.projection_matrix);
        program.uniform('3f', 'u_eye', [0, 0, this.position_meters[2]]);
        program.uniform('2fv', 'u_vanishing_point', this.vanishing_point_skew);
    }

}

// Isometric-style projection
// Note: this is actually an "axonometric" projection, but I'm using the colloquial term isometric because it is more recognizable.
// An isometric projection is a specific subset of axonometric projections.
// 'axis' determines the xy skew applied to a vertex based on its z coordinate, e.g. [0, 1] axis causes buildings to be drawn
// straight upwards on screen at their true height, [0, .5] would draw them up at half-height, [1, 0] would be sideways, etc.
class IsometricCamera extends Camera {

    constructor(name, view, options = {}) {
        super(name, view, options);
        this.type = 'isometric';
        this.axis = options.axis || { x: 0, y: 1 };
        if (this.axis.length === 2) {
            this.axis = { x: this.axis[0], y: this.axis[1] }; // allow axis to also be passed as 2-elem array
        }

        this.position_meters = null;
        this.viewport_height = null;

        this.view_matrix = new Float64Array(16);
        this.projection_matrix = new Float32Array(16);

        // 'camera' is the name of the shader block, e.g. determines where in the shader this code is injected
        ShaderProgram.replaceBlock('camera', `
            uniform mat4 u_projection;
            uniform vec3 u_eye;
            uniform vec2 u_vanishing_point;

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

        this.viewport_height = this.view.size.css.height * this.view.meters_per_pixel;
        var position = [this.view.center.meters.x, this.view.center.meters.y, this.viewport_height];
        this.position_meters = position;

        // View
        mat4.identity(this.view_matrix);
        mat4.translate(this.view_matrix, this.view_matrix, vec3.fromValues(-position[0], -position[1], 0));

        // Projection
        mat4.identity(this.projection_matrix);

        // apply isometric skew
        this.projection_matrix[8] = this.axis.x / this.view.aspect; // z column of x row, e.g. amount z skews x
        this.projection_matrix[9] = this.axis.y;                    // z column of x row, e.g. amount z skews y

        // convert meters to viewport
        mat4.scale(this.projection_matrix, this.projection_matrix,
            vec3.fromValues(
                2 / this.view.size.meters.x,
                2 / this.view.size.meters.y,
                2 / this.view.size.meters.y
            )
        );
    }

    setupProgram(program) {
        program.uniform('Matrix4fv', 'u_projection', this.projection_matrix);

        program.uniform('3fv', 'u_eye', [0, 0, this.viewport_height]);
        // program.uniform('3f', 'u_eye', this.viewport_height * this.axis.x, this.viewport_height * this.axis.y, this.viewport_height);
        program.uniform('2fv', 'u_vanishing_point', [0, 0]);
    }

}

// Flat projection (e.g. just top-down, no perspective) - a degenerate isometric camera
class FlatCamera extends IsometricCamera {

    constructor(name, view, options = {}) {
        super(name, view, options);
        this.type = 'flat';
    }

    update() {
        // Axis is fixed to (0, 0) for flat camera
        this.axis.x = 0;
        this.axis.y = 0;

        super.update();
    }

}
