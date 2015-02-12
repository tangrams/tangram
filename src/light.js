import ShaderProgram from './gl/shader_program';
import shaderSources from './gl/shader_sources'; // built-in shaders
import GLSL from './gl/glsl';

// ABSTRACT LIGHT
export default class Light {

    constructor (_scene, _config) {
        this.name = _config.name;
        this.scene = _scene;

        this.ambient = (_config.ambient || [0, 0, 0]).map(parseFloat);
        this.diffuse = (_config.diffuse || [1, 1, 1]).map(parseFloat);
        this.specular = (_config.specular || [0, 0, 0]).map(parseFloat);

        this.ambient = GLSL.expandVec4(this.ambient);
        this.diffuse = GLSL.expandVec4(this.diffuse);
        this.specular = GLSL.expandVec4(this.specular);
    }

    // Create a light by type name, factory-style
    // _config must include:
    //   - name
    //   - type
    //   - type-specific fields
    static create (_scene, _config) {
        switch (_config.type) {
            case 'point':
                return new PointLight(_scene, _config);
            case 'directional':
                return new DirectionalLight(_scene, _config);
            case 'spotlight':
                return new SpotLight(_scene, _config);
        }
    }

    // Inject all provided light definitions, and cumulative calculate light function
    static inject (_lights) {

        // CLEAR previous injections
        ShaderProgram.removeTransform(Light.transform);

        // Collect all TYPES of lights
        let types = {};
        for (let name in _lights) {
            types[_lights[name].type] = true;
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

        // inject per-instance blocks and construct the list of function to calculate
        let calculateList = "";
        for (let name in _lights) {

            // Define instance
            _lights[name].inject();

            // Add the calculation function to the list
            calculateList += 'calculateLight(g_' + name + ', _eyeToPoint, _normal);\n';
        }

        // Glue together the calculate Lighting function
        let calculateFunction = `
            vec4 calculateLighting(in vec3 _eyeToPoint, in vec3 _normal, in vec4 _color) {

                ` + calculateList + `

                //  Final light intensity calculation
                //
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

                // Clamp final color to be in the right spectrum
                color = clamp(color, 0.0, 1.0);

                return color;
            }`;

        ShaderProgram.addTransform(Light.transform, calculateFunction);

    }

    // Common instance definition
    inject () {
        let instance =  `
            uniform ${this.struct_name} u_${this.name};
            ${this.struct_name} g_${this.name} = u_${this.name};
        `;

        ShaderProgram.addTransform(Light.transform, instance);
    }

    // Update method called once per frame
    update () {
    }

    // Called once per frame per program (e.g. for main render pass, then for each additional pass for feature selection, etc.)
    setupProgram (_program) {
        //  Three common light properties
        _program.uniform('4fv', 'u_'+this.name+'.ambient', this.ambient);
        _program.uniform('4fv', 'u_'+this.name+'.diffuse', this.diffuse);
        _program.uniform('4fv', 'u_'+this.name+'.specular', this.specular);
    }

}

// Shader transform name
Light.transform = 'lighting';


// DIRECTIONAL LIGHT
//
class DirectionalLight extends Light {

    constructor(_scene, _config) {
        super(_scene, _config);
        this.type = 'directional';
        this.struct_name = 'DirectionalLight';

        this.direction = (_config.direction || [0.2, 0.7, -0.5]).map(parseFloat); // [x, y, z]
    }

    // DirectLigth Struct and function
    static inject() {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/directionalLight']);
    }

    setupProgram (_program) {
        super.setupProgram(_program);
        _program.uniform('3fv', 'u_'+this.name+'.direction', this.direction);
    }

}

// POINT LIGHT
//
class PointLight extends Light {

    constructor (_scene, _config) {
        super(_scene, _config);
        this.type = 'point';
        this.struct_name = 'PointLight';

        this.position = (_config.position || [0, 0, 200]).map(parseFloat); // [x, y, z]
        this.constantAttenuation = !isNaN(parseFloat(_config.constantAttenuation)) ? parseFloat(_config.constantAttenuation) : 0.0;
        this.linearAttenuation = !isNaN(parseFloat(_config.constantAttenuation)) ? parseFloat(_config.constantAttenuation) : 0.0;
        this.quadraticAttenuation = !isNaN(parseFloat(_config.constantAttenuation)) ? parseFloat(_config.constantAttenuation) : 0.0;
    }

    static inject () {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/pointLight']);
    }

    inject() {
        super.inject();

        if(this.constantAttenuation !== 0){
            ShaderProgram.defines['TANGRAM_POINTLIGHT_CONSTANT_ATTENUATION'] = true;
        }
        if(this.constantAttenuation !== 0){
            ShaderProgram.defines['TANGRAM_POINTLIGHT_LINEAR_ATTENUATION'] = true;
        }
        if(this.constantAttenuation !== 0){
            ShaderProgram.defines['TANGRAM_POINTLIGHT_QUADRATIC_ATTENUATION'] = true;
        }
    }

    setupProgram (_program) {
        super.setupProgram(_program);
        _program.uniform('4f', 'u_'+name+'.position',
            this.position[0] * this.scene.meters_per_pixel,
            this.position[1] * this.scene.meters_per_pixel,
            this.position[2] * this.scene.meters_per_pixel,
            1);

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_CONSTANT_ATTENUATION']){
            _program.uniform('1f', 'u_'+name+'.constantAttenuation', this.constantAttenuation);
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_LINEAR_ATTENUATION']){
            _program.uniform('1f', 'u_'+name+'.linearAttenuation', this.linearAttenuation);
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_QUADRATIC_ATTENUATION']){
            _program.uniform('1f', 'u_'+name+'.quadraticAttenuation', this.quadraticAttenuation);
        }
    }
}

// SPOT LIGHT
//
class SpotLight extends PointLight {

    constructor (_scene, _config) {
        super(_scene, _config);
        this.type = 'spotlight';
        this.struct_name = 'SpotLight';

        this.direction = (_config.direction || [0, 0, -1]).map(parseFloat); // [x, y, z]
        this.spotExponent = !isNaN(parseFloat(_config.exponent)) ? parseFloat(_config.exponent) : 0.2;
        this.spotCutoff = !isNaN(parseFloat(_config.angle)) ? parseFloat(_config.angle) : 20.0;

        // TODO:
        //      - check style names for spotExponent and spotCutoff

        // Convert to RADIANTS and pre compute get the Cosine
        this.spotCosCutoff = Math.cos(this.cutoff * 3.14159 / 180.0) ;
    }

    static inject () {
        ShaderProgram.addTransform(Light.transform, shaderSources['gl/shaders/spotLight']);
    }

    setupProgram (_program) {
        super.setupProgram(_program);

        _program.uniform('3fv', 'u_'+this.name+'.direction', this.direction);

        _program.uniform('1f', 'u_'+this.name+'.spotCosCutoff', this.spotCosCutoff);
        _program.uniform('1f', 'u_'+this.name+'.spotExponent', this.exponent);
    }

}
