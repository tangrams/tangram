import ShaderProgram from './gl/shader_program';
import GLSL from './gl/glsl';
import Geo from './geo';
import {StyleParser} from './styles/style_parser';

let fs = require('fs');

const shaderSrc_ambientLight = fs.readFileSync(__dirname + '/gl/shaders/ambientLight.glsl', 'utf8');
const shaderSrc_directionalLight = fs.readFileSync(__dirname + '/gl/shaders/directionalLight.glsl', 'utf8');
const shaderSrc_pointLight = fs.readFileSync(__dirname + '/gl/shaders/pointLight.glsl', 'utf8');
const shaderSrc_spotLight = fs.readFileSync(__dirname + '/gl/shaders/spotLight.glsl', 'utf8');

// Abstract light
export default class Light {

    constructor (view, config) {
        this.name = config.name;
        this.view = view;

        if (config.ambient == null || typeof config.ambient === 'number') {
            this.ambient = GLSL.expandVec4(config.ambient || 0);
        }
        else {
            this.ambient = StyleParser.parseColor(config.ambient);
        }

        if (config.diffuse == null || typeof config.diffuse === 'number') {
            this.diffuse = GLSL.expandVec4(config.diffuse != null ? config.diffuse : 1);
        }
        else {
            this.diffuse = StyleParser.parseColor(config.diffuse);
        }

        if (config.specular == null || typeof config.specular === 'number') {
            this.specular = GLSL.expandVec4(config.specular || 0);
        }
        else {
            this.specular = StyleParser.parseColor(config.specular);
        }
    }

    // Create a light by type name, factory-style
    // 'config' must include 'name' and 'type', along with any other type-specific properties
    static create (view, config) {
        if (Light.types[config.type]) {
            return new Light.types[config.type](view, config);
        }
    }

    // Set light for a style: fragment lighting, vertex lighting, or none
    static setMode (mode, style) {
        if (mode === true) {
            mode = 'fragment';
        }
        mode = Light.enabled && ((mode != null) ? mode : 'fragment'); // default to fragment lighting
        style.defines['TANGRAM_LIGHTING_FRAGMENT'] = (mode === 'fragment');
        style.defines['TANGRAM_LIGHTING_VERTEX'] = (mode === 'vertex');
    }

    // Inject all provided light definitions, and calculate cumulative light function
    static inject (lights) {
        // Clear previous injections
        ShaderProgram.removeBlock(Light.block);

        // If lighting is globally disabled, nothing is injected (mostly for debugging or live editing)
        if (!Light.enabled) {
            return;
        }

        // Construct code to calculate each light instance
        let calculateLights = "";
        if (lights && Object.keys(lights).length > 0) {
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
            for (let light_name in lights) {
                // Define instance
                lights[light_name].inject();

                // Add the calculation function to the list
                calculateLights += `calculateLight(${light_name}, _eyeToPoint, _normal);\n`;
            }
        }
        else {
            // If no light is defined, use 100% omnidirectional diffuse light
            calculateLights = `
                #ifdef TANGRAM_MATERIAL_DIFFUSE
                    light_accumulator_diffuse = vec4(1.);
                #endif
            `;
        }

        // Glue together the final lighting function that sums all the lights
        let calculateFunction = `
            vec4 calculateLighting(in vec3 _eyeToPoint, in vec3 _normal, in vec4 _color) {

                // Do initial material calculations over normal, emission, ambient, diffuse and specular values
                calculateMaterial(_eyeToPoint,_normal);

                // Un roll the loop of individual ligths to calculate
                ${calculateLights}

                //  Final light intensity calculation
                vec4 color = vec4(0.0);

                #ifdef TANGRAM_MATERIAL_EMISSION
                    color = material.emission;
                #endif

                #ifdef TANGRAM_MATERIAL_AMBIENT
                    color += light_accumulator_ambient * _color * material.ambient;
                #else
                    #ifdef TANGRAM_MATERIAL_DIFFUSE
                        color += light_accumulator_ambient * _color * material.diffuse;
                    #endif
                #endif

                #ifdef TANGRAM_MATERIAL_DIFFUSE
                    color += light_accumulator_diffuse * _color * material.diffuse;
                #endif

                #ifdef TANGRAM_MATERIAL_SPECULAR
                    color += light_accumulator_specular * material.specular;
                #endif

                // Clamp final color
                color = clamp(color, 0.0, 1.0);

                return color;
            }`;

        ShaderProgram.addBlock(Light.block, calculateFunction);
    }

    // Common instance definition
    inject () {
        let instance =  `
            uniform ${this.struct_name} u_${this.name};
            ${this.struct_name} ${this.name};
            `;
        let assign = `
            ${this.name} = u_${this.name};\n
        `;

        ShaderProgram.addBlock(Light.block, instance);
        ShaderProgram.addBlock('setup', assign);
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
Light.block = 'lighting'; // shader block name
Light.enabled = true; // lighting can be globally enabled/disabled


// Light subclasses
class AmbientLight extends Light {

    constructor(view, config) {
        super(view, config);
        this.type = 'ambient';
        this.struct_name = 'AmbientLight';
    }

    // Inject struct and calculate function
    static inject() {
        ShaderProgram.addBlock(Light.block, shaderSrc_ambientLight);
    }

    setupProgram (_program) {
        _program.uniform('4fv', `u_${this.name}.ambient`, this.ambient);
    }

}
Light.types['ambient'] = AmbientLight;

class DirectionalLight extends Light {

    constructor(view, config) {
        super(view, config);
        this.type = 'directional';
        this.struct_name = 'DirectionalLight';

        this.direction = (config.direction || [0.2, 0.7, -0.5]).map(parseFloat); // [x, y, z]
    }

    // Inject struct and calculate function
    static inject() {
        ShaderProgram.addBlock(Light.block, shaderSrc_directionalLight);
    }

    setupProgram (_program) {
        super.setupProgram(_program);
        _program.uniform('3fv', `u_${this.name}.direction`, this.direction);
    }

}
Light.types['directional'] = DirectionalLight;


class PointLight extends Light {

    constructor (view, config) {
        super(view, config);
        this.type = 'point';
        this.struct_name = 'PointLight';

        this.position = config.position || [0, 0, '100px'];
        this.position_eye = []; // position in eyespace
        this.origin = config.origin || 'ground';
        this.attenuation = !isNaN(parseFloat(config.attenuation)) ? parseFloat(config.attenuation) : 0;

        if (config.radius) {
            if (Array.isArray(config.radius) && config.radius.length === 2) {
                this.radius = config.radius;
            }
            else {
                this.radius = [null, config.radius];
            }
        }
        else {
            this.radius = null;
        }
    }

    // Inject struct and calculate function
    static inject () {
        ShaderProgram.addBlock(Light.block, shaderSrc_pointLight);
    }

    // Inject isntance-specific settings
    inject() {
        super.inject();

        ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_EXPONENT'] = (this.attenuation !== 0);
        ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_INNER_RADIUS'] = (this.radius != null && this.radius[0] != null);
        ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_OUTER_RADIUS'] = (this.radius != null);
    }

    update () {
        this.updateEyePosition();
    }

    updateEyePosition () {
        if (this.origin === 'world') {
            // For world origin, format is: [longitude, latitude, meters (default) or pixels w/px units]

            // Move light's world position into camera space
            let [x, y] = Geo.latLngToMeters(this.position);
            this.position_eye[0] = x - this.view.camera.position_meters[0];
            this.position_eye[1] = y - this.view.camera.position_meters[1];

            this.position_eye[2] = StyleParser.convertUnits(this.position[2],
                { zoom: this.view.zoom, meters_per_pixel: Geo.metersPerPixel(this.view.zoom) });
            this.position_eye[2] = this.position_eye[2] - this.view.camera.position_meters[2];
        }
        else if (this.origin === 'ground' || this.origin === 'camera') {
            // For camera or ground origin, format is: [x, y, z] in meters (default) or pixels w/px units

            // Light is in camera space by default
            this.position_eye = StyleParser.convertUnits(this.position,
                { zoom: this.view.zoom, meters_per_pixel: Geo.metersPerPixel(this.view.zoom) });

            if (this.origin === 'ground') {
                // Leave light's xy in camera space, but z needs to be moved relative to ground plane
                this.position_eye[2] = this.position_eye[2] - this.view.camera.position_meters[2];
            }
        }
        this.position_eye[3] = 1;
    }

    setupProgram (_program) {
        super.setupProgram(_program);

        _program.uniform('4fv', `u_${this.name}.position`, this.position_eye);

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_EXPONENT']) {
            _program.uniform('1f', `u_${this.name}.attenuationExponent`, this.attenuation);
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_INNER_RADIUS']) {
            _program.uniform('1f', `u_${this.name}.innerRadius`,
                StyleParser.convertUnits(this.radius[0],
                    { zoom: this.view.zoom, meters_per_pixel: Geo.metersPerPixel(this.view.zoom) }));
        }

        if(ShaderProgram.defines['TANGRAM_POINTLIGHT_ATTENUATION_OUTER_RADIUS']) {
            _program.uniform('1f', `u_${this.name}.outerRadius`,
                StyleParser.convertUnits(this.radius[1],
                    { zoom: this.view.zoom, meters_per_pixel: Geo.metersPerPixel(this.view.zoom) }));
        }
    }
}
Light.types['point'] = PointLight;


class SpotLight extends PointLight {

    constructor (view, config) {
        super(view, config);
        this.type = 'spotlight';
        this.struct_name = 'SpotLight';

        this.direction = (config.direction || [0, 0, -1]).map(parseFloat); // [x, y, z]
        this.exponent = config.exponent ? parseFloat(config.exponent) : 0.2;
        this.angle = config.angle ? parseFloat(config.angle) : 20;
    }

    // Inject struct and calculate function
    static inject () {
        ShaderProgram.addBlock(Light.block, shaderSrc_spotLight);
    }

    setupProgram (_program) {
        super.setupProgram(_program);

        _program.uniform('3fv', `u_${this.name}.direction`, this.direction);
        _program.uniform('1f', `u_${this.name}.spotCosCutoff`, Math.cos(this.angle * 3.14159 / 180));
        _program.uniform('1f', `u_${this.name}.spotExponent`, this.exponent);
    }

}
Light.types['spotlight'] = SpotLight;
