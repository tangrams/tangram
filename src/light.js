/*global Light */
import ShaderProgram from './gl/shader_program';

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
            case 'spotlight':
                return new SpotLight(scene, config);
            /* falls through */
            default:
                return new NoLight(scene, config);
        }
    }

    // Update method called once per frame
    update() {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram(program) {
    }

}

// Shader transform name
Light.transform = 'lighting';


// Point light implementing diffuse, specular, and ambient terms
class PointLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'point';

        this.color = (options.color || [1, 1, 1]).map(parseFloat);
        this.position = (options.position || [0, 0, 200]).map(parseFloat); // [x, y, z]
        this.ambient = !isNaN(parseFloat(options.ambient)) ? parseFloat(options.ambient) : 0.5;
        this.backlight = options.backlight || false;

        ShaderProgram.removeTransform(Light.transform);
        ShaderProgram.addTransform(Light.transform, `
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
            uniform vec3 u_point_light_color;
            uniform float u_point_light_ambient;
            uniform bool u_point_light_backlight;

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return pointLight(
                    position, normal, u_point_light_color,
                    u_point_light_position,
                    u_point_light_ambient,
                    u_point_light_backlight
                );
            }`
        );
    }

    setupProgram(program) {
        program.uniform('4f', 'u_point_light_position',
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);
        program.uniform('3fv', 'u_point_light_color', this.color);
        program.uniform('1f', 'u_point_light_ambient', this.ambient);
        program.uniform('1i', 'u_point_light_backlight', this.backlight);
    }

}

class SpotLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'spotlight';

        this.position = (options.position || [0, 0, 500]).map(parseFloat); // [x, y, z]
        this.direction = (options.direction || [0, 0, -1]).map(parseFloat); // [x, y, z]
        this.inner_angle = parseFloat(options.inner_angle || 20);
        this.outer_angle = parseFloat(options.outer_angle || 25);
        this.color = (options.color || [1, 1, 1]).map(parseFloat);
        this.ambient = !isNaN(parseFloat(options.ambient)) ? parseFloat(options.ambient) : 0.2;

        ShaderProgram.removeTransform(Light.transform);
        ShaderProgram.addTransform(Light.transform, `
            vec3 spotLight(
                vec4 position,
                vec3 normal,
                vec3 color,
                vec4 light_pos,
                vec3 light_dir,
                float inner_angle,
                float outer_angle,
                float light_ambient) {

                // Lambert shading
                vec3 light_to_pos = normalize(position.xyz - light_pos.xyz); // from light point to vertex

                float inner_cutoff = cos(radians(inner_angle));
                float outer_cutoff = cos(radians(outer_angle));

                light_dir = normalize(light_dir);
                float angle = dot(light_dir, light_to_pos);

                if (angle > outer_cutoff) {
                    float intensity = mix(.2, 1., max(0., dot(normal, light_to_pos * -1.0)));

                    if (angle < inner_cutoff) {
                        intensity *= mix(1., 0., (inner_cutoff - angle) / (inner_cutoff - outer_cutoff));
                    }

                    color *= intensity + light_ambient;
                }
                else {
                    color *= light_ambient;
                }

                return color;
            }

            uniform vec4 u_spotlight_position;
            uniform vec3 u_spotlight_direction;
            uniform float u_spotlight_inner_angle;
            uniform float u_spotlight_outer_angle;
            uniform vec3 u_spotlight_color;
            uniform float u_spotlight_ambient;

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return spotLight(
                    position, normal, u_spotlight_color,
                    u_spotlight_position,
                    u_spotlight_direction,
                    u_spotlight_inner_angle,
                    u_spotlight_outer_angle,
                    u_spotlight_ambient
                );
            }`
        );
    }

    setupProgram(program) {
        program.uniform('4f', 'u_spotlight_position',
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);
        program.uniform('3fv', 'u_spotlight_direction', this.direction);
        program.uniform('1f', 'u_spotlight_inner_angle', this.inner_angle);
        program.uniform('1f', 'u_spotlight_outer_angle', this.outer_angle);
        program.uniform('3fv', 'u_spotlight_color', this.color);
        program.uniform('1f', 'u_spotlight_ambient', this.ambient);
    }

}

// Directional light implementing diffuse, specular, and ambient terms
class DirectionalLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'directional';

        this.direction = (options.direction || [0.2, 0.7, -0.5]).map(parseFloat); // [x, y, z]
        this.color = (options.color || [1, 1, 1]).map(parseFloat);
        this.ambient = !isNaN(parseFloat(options.ambient)) ? parseFloat(options.ambient) : 0.5;

        ShaderProgram.removeTransform(Light.transform);
        ShaderProgram.addTransform(Light.transform, `
            vec3 directionalLight (
                vec3 normal,
                vec3 color,
                vec3 light_dir,
                float light_ambient) {

                // Flat shading
                light_dir = normalize(light_dir);
                color *= max(0., dot(normal, light_dir * -1.0)) + light_ambient;
                return color;
            }

            uniform vec3 u_directional_light_direction;
            uniform vec3 u_directional_light_color;
            uniform float u_directional_light_ambient;

            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return directionalLight(
                    normal,
                    u_directional_light_color,
                    u_directional_light_direction,
                    u_directional_light_ambient
                );
            }`
        );
    }

    setupProgram(program) {
        program.uniform('3fv', 'u_directional_light_direction', this.direction);
        program.uniform('3fv', 'u_directional_light_color', this.color);
        program.uniform('1f', 'u_directional_light_ambient', this.ambient);
    }

}

// No lighting
class NoLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'none';

        ShaderProgram.removeTransform(Light.transform);
        ShaderProgram.addTransform(Light.transform, `
            vec3 calculateLighting(
                vec4 position,
                vec3 normal,
                vec3 color) {

                return color;
            }`
        );
   }

}
