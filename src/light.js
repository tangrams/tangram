import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

// Abstract light
export default class Light {

    constructor (scene, config) {
        this.name = config.name;
        this.scene = scene;

        this.ambient = GLSL.expandVec4(config.ambient || 0);
        this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        this.specular = GLSL.expandVec4(config.specular || 0);
    }

    // Create a light by type name, factory-style
    // 'config' must include 'name' and 'type', along with any other type-specific properties
    static create (scene, config) {
        if (Light.types[config.type]) {
            return new Light.types[config.type](scene, config);
        }
    }

    // Inject all provided light definitions, and calculate cumulative light function
    static inject (lights) {

        // Clear previous injections
        ShaderProgram.removeTransform(Light.transform);

        // Collect uniques types of lights
        let types = {};
        for (let light_name in lights) {
            types[lights[light_name].type] = true;
        }

        // Inject each type of light
        for (let type in types) {
            Light.types[type].inject();
        }

        // Inject per-instance blocks and construct the list of functions to calculate each light
        let calculateList = "";
        for (let light_name in lights) {

            // Define instance
            lights[light_name].inject();

            // Add the calculation function to the list
            calculateList += `calculateLight(g_${light_name}, _eyeToPoint, _normal);\n`;
        }

        // Glue together the final calculate lighting function that sums all the lights
        let calculateFunction = `
            vec4 calculateLighting(in vec3 _eyeToPoint, in vec3 _normal, in vec4 _color) {

                ` + calculateList + `

                //  Final light intensity calculation
                vec4 color = vec4(0.0);

                #ifdef TANGRAM_MATERIAL_EMISSION
                    color = g_material.emission;
                #endif

                #ifdef TANGRAM_MATERIAL_AMBIENT
                    color += g_light_accumulator_ambient * g_material.ambient;
                #endif

                #ifdef TANGRAM_MATERIAL_DIFFUSE
                    color += g_light_accumulator_diffuse * _color * g_material.diffuse;
                #endif

                #ifdef TANGRAM_MATERIAL_SPECULAR
                    color += g_light_accumulator_specular * g_material.specular;
                #endif

                // Clamp final color
                color = clamp(color, 0.0, 1.0);

                return color;
            }`;

        ShaderProgram.addTransform(Light.transform, calculateFunction);
    }

    // Common instance definition
    inject () {
        let instance =  `
            uniform ${this.struct_name} u_${this.name};
            ${this.struct_name} g_${this.name} = u_${this.name};\n`;

        ShaderProgram.addTransform(Light.transform, instance);
    }

    // Update method called once per frame
    update () {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional
    // pass for feature selection, etc.)
    setupProgram (_program) {
        //  Three common light properties
        _program.uniform('4fv', `u_${this.name}.ambient`, this.ambient);
        _program.uniform('4fv', `u_${this.name}.diffuse`, this.diffuse);
        _program.uniform('4fv', `u_${this.name}.specular`, this.specular);
    }

}

Light.types = {}; // references to subclasses by short name
Light.transform = 'lighting'; // shader transform name


// Light subclasses

class DirectionalLight extends Light {

    constructor(scene, config) {
        super(scene, config);
        this.type = 'directional';
        this.struct_name = 'DirectionalLight';

        this.direction = (config.direction || [0.2, 0.7, -0.5]).map(parseFloat); // [x, y, z]
    }

    // Inject struct and calculate function
    static inject() {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/directionalLight']);
    }

    setupProgram (_program) {
        super.setupProgram(_program);
        _program.uniform('3fv', `u_${this.name}.direction`, this.direction);
    }

}
Light.types['directional'] = DirectionalLight;


class PointLight extends Light {

    constructor (scene, config) {
        super(scene, config);
        this.type = 'point';
        this.struct_name = 'PointLight';

        this.position = (config.position || [0, 0, 200]).map(parseFloat); // [x, y, z]
        this.constantAttenuation = config.constantAttenuation ? parseFloat(config.constantAttenuation) : 0;
        this.linearAttenuation = config.constantAttenuation ? parseFloat(config.constantAttenuation) : 0;
        this.quadraticAttenuation = config.constantAttenuation ? parseFloat(config.constantAttenuation) : 0;
    }

    // Inject struct and calculate function
    static inject () {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/pointLight']);
    }

    // Inject isntance-specific settings
    inject() {
        super.inject();

        if(this.constantAttenuation !== 0) {
            ShaderProgram.defines['TANGRAM_POINTLIGHT_CONSTANT_ATTENUATION'] = true;
        }
        if(this.constantAttenuation !== 0) {
            ShaderProgram.defines['TANGRAM_POINTLIGHT_LINEAR_ATTENUATION'] = true;
        }
        if(this.constantAttenuation !== 0) {
            ShaderProgram.defines['TANGRAM_POINTLIGHT_QUADRATIC_ATTENUATION'] = true;
        }
    }

    setupProgram (_program) {
        super.setupProgram(_program);

        _program.uniform('4f', `u_${this.name}.position`,
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_CONSTANT_ATTENUATION']) {
            _program.uniform('1f', `u_${this.name}.constantAttenuation`, this.constantAttenuation);
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_LINEAR_ATTENUATION']) {
            _program.uniform('1f', `u_${this.name}.linearAttenuation`, this.linearAttenuation);
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_QUADRATIC_ATTENUATION']) {
            _program.uniform('1f', `u_${this.name}.quadraticAttenuation`, this.quadraticAttenuation);
        }
    }
}
Light.types['point'] = PointLight;


class SpotLight extends PointLight {

    constructor (scene, config) {
        super(scene, config);
        this.type = 'spotlight';
        this.struct_name = 'SpotLight';

        this.direction = (config.direction || [0, 0, -1]).map(parseFloat); // [x, y, z]
        this.exponent = config.exponent ? parseFloat(config.exponent) : 0.2;
        this.angle = config.angle ? parseFloat(config.angle) : 20;
    }

    // Inject struct and calculate function
    static inject () {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/spotLight']);
    }

    setupProgram (_program) {
        super.setupProgram(_program);

        _program.uniform('3fv', `u_${this.name}.direction`, this.direction);
        _program.uniform('1f', `u_${this.name}.spotCosCutoff`, Math.cos(this.angle * 3.14159 / 180));
        _program.uniform('1f', `u_${this.name}.spotExponent`, this.exponent);
    }

}
Light.types['spotlight'] = SpotLight;
