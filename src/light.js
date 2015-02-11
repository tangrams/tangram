/*global Light */
import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders

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

    static inject(lights) {

        // clear previous injections
        ShaderProgram.removeTransform(Light.transform);

        // inject global things here

        // inject materials
        ShaderProgram.defines['LIGHT_X'] = true;

        // Collect all types of lights
        let types = {};
        for (let name in lights) {
            types[lights[name].type] = true;
        }

        // Inject each type of light
        for (let type in types) {
            switch (type) {
                case 'point':
                    PointLight.inject();
                    break;
                case 'directional':
                    DirectionalLight.inject();
                    break;
                case 'spotlight':
                    SpotLight.inject();
                    break;
            }            
        }

        // inject per-instance
        for (let name in lights) {
            lights[name].inject();
        }

        // inject the compute light wrapper

        let compute = `
            vec4 computeLight(...) {
                ${Object.keys(lights).map(name => 'calculateLight(' + name + ');\n')}
            }
        `;

        // ShaderProgram.removeTransform(Light.transform); // ??
        ShaderProgram.addTransform(Light.transform, compute);
        
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

// Directional light implementing diffuse, specular, and ambient terms
class DirectionalLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'directional';

        this.direction = (options.direction || [0.2, 0.7, -0.5]).map(parseFloat); // [x, y, z]
        this.color = (options.color || [1, 1, 1]).map(parseFloat);
        this.ambient = !isNaN(parseFloat(options.ambient)) ? parseFloat(options.ambient) : 0.5;
        );
    }

    static inject() {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/directionalLight']);
    }

    inject() {
        
    }

    setupProgram(program) {
        program.uniform('3fv', 'u_directional_light_direction', this.direction);
        program.uniform('3fv', 'u_directional_light_color', this.color);
        program.uniform('1f', 'u_directional_light_ambient', this.ambient);
    }

}


// Point light implementing diffuse, specular, and ambient terms
class PointLight extends Light {

    constructor(scene, options = {}) {
        super(scene);
        this.type = 'point';

        this.color = (options.color || [1, 1, 1]).map(parseFloat);
        this.position = (options.position || [0, 0, 200]).map(parseFloat); // [x, y, z]
        this.ambient = !isNaN(parseFloat(options.ambient)) ? parseFloat(options.ambient) : 0.5;
        this.backlight = options.backlight || false;
    }

    static inject() {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/pointLight']);
    }

    inject() {
        
    }

    setupProgram(program) {
        program.uniform('4f', 'u_point_light_position',
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);
        program.uniform('3fv', 'u_point_light_color', this.color);

        this.uniform_name_color = `u_${this.name}_light_color`;
        // program.uniform('3fv', this.uniform_name_color, this.color);
        // program.uniform('3fv', `u_${this.name}_light_color`, this.color);

        // let material = {
        //     ambient: [1, 0, 0],
        //     diffuse: [1, 1, 0]
        // };
        // program.setUniforms({ u_material: material });

        // program.uniform('3fv', 'u_material.ambient', material.ambient);
        // program.uniform('3fv', 'u_material.diffuse', material.diffuse);



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
    }

    static inject() {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/spotLight']);
    }

    inject() {
        
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
