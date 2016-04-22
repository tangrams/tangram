import chai from 'chai';
let assert = chai.assert;
// import chaiAsPromised from 'chai-as-promised';
// chai.use(chaiAsPromised);

import {Styles, StyleManager} from '../src/styles/style_manager';
import {Style} from '../src/styles/style';
import Context from '../src/gl/context';
import Camera from '../src/camera';
import Light from '../src/light';

import sampleScene from './fixtures/sample-scene';

var canvas, gl;

describe('Styles:', () => {

    describe('StyleManager:', () => {

        beforeEach(() => {
            // These create global shader blocks required by all rendering styles
            Camera.create('default', null, { type: 'flat' });
            Light.inject();

            canvas = document.createElement('canvas');
            gl = Context.getContext(canvas, { alpha: false });
            StyleManager.init();
        });

        afterEach(() => {
            StyleManager.destroy();
            canvas = null;
            gl = null;
        });

        it('initializes built-in styles', () => {
            assert.equal(Styles.polygons.constructor, Style.constructor);
            assert.equal(Styles.points.constructor, Style.constructor);
            assert.equal(Styles.text.constructor, Style.constructor);
        });

        it('creates a custom style', () => {
            StyleManager.create('rainbow', sampleScene.styles.rainbow);
            assert.equal(Styles.rainbow.constructor, Style.constructor);
            assert.equal(Styles.rainbow.base, 'polygons');
        });

        describe('builds custom styles w/dependencies from stylesheet', () => {

            beforeEach(() => {
                StyleManager.build(sampleScene.styles);
            });

            it('compiles parent custom style', () => {
                Styles.rainbow.setGL(gl);
                Styles.rainbow.compile();
                assert.equal(Styles.rainbow.constructor, Style.constructor);
                assert.equal(Styles.rainbow.base, 'polygons');
                assert.ok(Styles.rainbow.compiled);
                assert.ok(Styles.rainbow.program.compiled);
            });

            it('compiles child style dependent on another custom style', () => {
                Styles.rainbow_child.setGL(gl);
                Styles.rainbow_child.compile();
                assert.equal(Styles.rainbow_child.constructor, Style.constructor);
                assert.equal(Styles.rainbow_child.base, 'polygons');
                assert.ok(Styles.rainbow_child.compiled);
                assert.ok(Styles.rainbow_child.program.compiled);
            });

            it('compiles a style with the same style mixed by multiple ancestors', () => {
                Styles.descendant.setGL(gl);
                Styles.descendant.compile();
                assert.equal(Styles.descendant.constructor, Style.constructor);
                assert.equal(Styles.descendant.base, 'polygons');
                assert.ok(Styles.descendant.compiled);
                assert.ok(Styles.descendant.program.compiled);
            });

        });

    });

    describe('Style:', () => {

        beforeEach(() => {
            canvas = document.createElement('canvas');
            gl = Context.getContext(canvas, { alpha: false });
            StyleManager.init();
        });

        afterEach(() => {
            StyleManager.destroy();
            canvas = null;
            gl = null;
        });

        it('compiles a program', () => {
            Styles.polygons.init();
            Styles.polygons.setGL(gl);
            Styles.polygons.compile();
            assert.ok(Styles.polygons.compiled);
        });

        it('injects a dependent uniform in a custom style', () => {
            StyleManager.create('scale', sampleScene.styles.scale);
            Styles.scale.init();
            Styles.scale.setGL(gl);
            Styles.scale.compile();
            assert.ok(Styles.scale.compiled);
            assert.ok(Styles.scale.program.compiled);
        });

    });

});
