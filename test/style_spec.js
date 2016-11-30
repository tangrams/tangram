import chai from 'chai';
let assert = chai.assert;

import {StyleManager} from '../src/styles/style_manager';
import {Style} from '../src/styles/style';
import Context from '../src/gl/context';
import ShaderProgram from '../src/gl/shader_program';
import Camera from '../src/camera';
import Light from '../src/light';

import sampleScene from './fixtures/sample-scene';

var canvas, gl;

describe('Styles:', () => {

    let style_manager;

    beforeEach(() => {
        style_manager = new StyleManager();
    });

    describe('StyleManager:', () => {

        beforeEach(() => {
            // These create global shader blocks required by all rendering styles
            Camera.create('default', null, { type: 'flat' });
            Light.inject();

            canvas = document.createElement('canvas');
            gl = Context.getContext(canvas, { alpha: false });

            style_manager.init();
        });

        afterEach(() => {
            style_manager.destroy();
            canvas = null;
            gl = null;
        });

        it('initializes built-in styles', () => {
            assert.equal(style_manager.styles.polygons.constructor, Style.constructor);
            assert.equal(style_manager.styles.points.constructor, Style.constructor);
            assert.equal(style_manager.styles.text.constructor, Style.constructor);
        });

        it('creates a custom style', () => {
            style_manager.create('rainbow', sampleScene.styles.rainbow);
            assert.equal(style_manager.styles.rainbow.constructor, Style.constructor);
            assert.equal(style_manager.styles.rainbow.base, 'polygons');
        });

        describe('builds custom styles w/dependencies from stylesheet', () => {

            beforeEach(() => {
                ShaderProgram.reset();
                style_manager.build(sampleScene.styles);
                style_manager.initStyles();
            });

            it('compiles parent custom style', () => {
                style_manager.styles.rainbow.setGL(gl);
                style_manager.styles.rainbow.getProgram();
                assert.equal(style_manager.styles.rainbow.constructor, Style.constructor);
                assert.equal(style_manager.styles.rainbow.base, 'polygons');
                assert.ok(style_manager.styles.rainbow.program.compiled);
            });

            it('compiles child style dependent on another custom style', () => {
                style_manager.styles.rainbow_child.setGL(gl);
                style_manager.styles.rainbow_child.getProgram();
                assert.equal(style_manager.styles.rainbow_child.constructor, Style.constructor);
                assert.equal(style_manager.styles.rainbow_child.base, 'polygons');
                assert.ok(style_manager.styles.rainbow_child.program.compiled);
            });

            it('compiles a style with the same style mixed by multiple ancestors', () => {
                style_manager.styles.descendant.setGL(gl);
                style_manager.styles.descendant.getProgram();
                assert.equal(style_manager.styles.descendant.constructor, Style.constructor);
                assert.equal(style_manager.styles.descendant.base, 'polygons');
                assert.ok(style_manager.styles.descendant.program.compiled);
            });

        });

    });

    describe('Style:', () => {

        beforeEach(() => {
            canvas = document.createElement('canvas');
            gl = Context.getContext(canvas, { alpha: false });
            style_manager.init();
        });

        afterEach(() => {
            style_manager.destroy();
            canvas = null;
            gl = null;
        });

        it('compiles a program', () => {
            style_manager.styles.polygons.init();
            style_manager.styles.polygons.setGL(gl);
            style_manager.styles.polygons.getProgram();
            assert.ok(style_manager.styles.polygons.program.compiled);
        });

        it('injects a dependent uniform in a custom style', () => {
            style_manager.create('scale', sampleScene.styles.scale);
            style_manager.styles.scale.init();
            style_manager.styles.scale.setGL(gl);
            style_manager.styles.scale.getProgram();
            assert.ok(style_manager.styles.scale.program.compiled);
        });

    });

});
