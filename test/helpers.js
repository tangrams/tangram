import Scene from '../src/scene';
import * as URLs from '../src/utils/urls';

/*
    Special web worker treatment:

    - Custom worker build to use the Babel runtime (since there seem to be issues w/multiple instances of the
      polyfill getting instantiated on each test run otherwise).
    - Stub the worker so that we only load it once, to avoid flooding connections (was causing disconnnect errors).
*/

sinon.stub(Scene.prototype, 'getWorkerUrl').returns(
    'http://localhost:9876/tangram.debug.js'
);

sinon.stub(URLs, 'revokeObjectURL').returns(null);

let container = document.createElement('div');
container.style.width = '250px';
container.style.height = '250px';
document.body.appendChild(container);

window.makeScene = function (options) {
    options = options || {};

    options.disableRenderLoop = options.disableRenderLoop || true;
    options.container = options.container || container;
    options.logLevel =  options.logLevel || 'info';

    return new Scene(
        options.config || 'http://localhost:9876/base/test/fixtures/sample-scene.yaml',
        options
    );

};
