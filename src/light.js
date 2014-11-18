/*global Light */
import GLProgram from './gl/gl_program';
// import shaders from './gl/gl_shaders'; // built-in shaders

// import glMatrix from 'gl-matrix';
// var mat4 = glMatrix.mat4;
// var vec3 = glMatrix.vec3;

// Abstract base class
export default class Light {

    constructor(scene) {
        this.scene = scene;
    }

    // Create a light by type name, factory-style
    static create(scene, config) {
        switch (config.type) {
            case 'point':
                return new PointLight(scene, config);
            case 'directional':
                return new DirectionalLight(scene, config);
            /* falls through */
            default:
                return new NoLight(scene, config);
        }
    }

    // Update method called once per frame
    update() {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram(gl_program) {
    }

}

// Shader transform name
Light.transform = 'lighting';


// Point light implementing diffuse, specular, and ambient terms
class PointLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'point';

        this.position = (options.position || [0, 0, 150]).map(parseFloat); // [x, y, z]
        this.ambient = parseFloat(options.ambient || 0.5);
        this.backlight = options.backlight || false;

        GLProgram.removeTransform(Light.transform);
        GLProgram.addTransform(Light.transform, `
            vec3 pointLight(
                vec4 position,
                vec3 normal,
                vec3 color,
                vec4 light_pos,
                float light_ambient,
                const bool backlight) {

                // Lambert shading
                vec3 light_dir = normalize(position.xyz - light_pos.xyz); // from light point to vertex
                color *= abs(max(float(backlight) * -1., dot(normal, light_dir * -1.0))) + light_ambient;
                return color;
            }

            uniform vec4 u_point_light_position;
            uniform float u_point_light_ambient;
            uniform bool u_point_light_backlight;

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return pointLight(
                    position, normal, color,
                    u_point_light_position,
                    u_point_light_ambient,
                    u_point_light_backlight
                );
            }`
        );
    }

    setupProgram(gl_program) {
        gl_program.uniform('4f', 'u_point_light_position',
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);
        gl_program.uniform('1f', 'u_point_light_ambient', this.ambient);
        gl_program.uniform('1i', 'u_point_light_backlight', this.backlight);
    }

}

// Directional light implementing diffuse, specular, and ambient terms
class DirectionalLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'directional';

        GLProgram.removeTransform(Light.transform);
        GLProgram.addTransform(Light.transform, `
            vec3 directionalLight (
                vec3 normal,
                vec3 color,
                vec3 light_dir,
                float light_ambient) {

                // Flat shading
                light_dir = normalize(light_dir);
                color *= dot(normal, light_dir * -1.0) + light_ambient;
                return color;
            }

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return directionalLight(
                    normal, color,
                    vec3(0.2, 0.7, -0.5), // direction of light for flat shading
                    0.5 // ambient light
                );
            }`
        );
    }

}

// No lighting
class NoLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'none';

        GLProgram.removeTransform(Light.transform);
        GLProgram.addTransform(Light.transform, `
            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return color;
            }`
        );
   }

}
