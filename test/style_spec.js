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

// These create global shader blocks required by all rendering styles
Camera.create('default', null, { type: 'flat' });
Light.create(null, {});

var canvas, gl;

describe('Styles:', () => {

    describe('StyleManager:', () => {

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

        it('initializes built-in styles', () => {
            assert.equal(Styles.polygons.constructor, Style.constructor);
            assert.equal(Styles.points.constructor, Style.constructor);
        });

        it('creates a custom style', () => {
            StyleManager.update('rainbow', sampleScene.config.styles.rainbow);
            assert.equal(Styles.rainbow.constructor, Style.constructor);
            assert.equal(Styles.rainbow.extends, 'polygons');
        });

        it('builds & compiles custom styles from stylesheet', () => {
            // debugger;
            StyleManager.build(sampleScene.config.styles);
            Styles.rainbow.setGL(gl);
            Styles.rainbow.compile();
            assert.equal(Styles.rainbow.constructor, Style.constructor);
            assert.equal(Styles.rainbow.extends, 'polygons');
            assert.ok(Styles.rainbow.compiled);
            assert.ok(Styles.rainbow.program.compiled);
        });

        it('loads a remote style from a URL', (done) => {
            let styles = { windows: { url: 'http://localhost:9876/base/test/fixtures/sample-remote-style.yaml' } };
            StyleManager.preload(styles).then(() => {
                StyleManager.build(styles);
                Styles.windows.setGL(gl);
                Styles.windows.compile();
                assert.ok(Styles.windows.compiled);
                assert.ok(Styles.windows.program.compiled);
                done();
            });
        });

        it('loads a remote style from a URL, with a different local name', (done) => {
            let styles = { localName: {
                name: 'windows',
                url: 'http://localhost:9876/base/test/fixtures/sample-remote-style.yaml'
            } };
            StyleManager.preload(styles).then(() => {
                StyleManager.build(styles);
                Styles.localName.setGL(gl);
                Styles.localName.compile();
                assert.ok(Styles.localName.compiled);
                assert.ok(Styles.localName.program.compiled);
                done();
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
            StyleManager.update('scale', sampleScene.config.styles.scale);
            Styles.scale.init();
            Styles.scale.setGL(gl);
            Styles.scale.compile();
            assert.ok(Styles.scale.compiled);
            assert.ok(Styles.scale.program.compiled);
        });

    });

});