import Scene from '../src/scene';
import * as URLs from '../src/utils/urls';

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
