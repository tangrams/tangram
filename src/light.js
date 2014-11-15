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

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return pointLight(
                    position, normal, color,
                    vec4(0., 0., 150. * u_meters_per_pixel, 1.), // location of point light (in pixels above ground))
                    0.5,    // ambient light
                    true    // backlight flag
                );
            }`
        );
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
