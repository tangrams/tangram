import Scene from '../src/scene';

let container = document.createElement('div');
container.style.width = '250px';
container.style.height = '250px';
document.body.appendChild(container);

// Use test-specific worker build for web workers
window.Tangram = window.Tangram || {};
window.Tangram.workerURL = 'http://localhost:9876/base/build/worker.test.js';

// Helper for loading scene
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
