import Scene from '../src/scene';
import TileSource from '../src/tile_source';
import sampleScene from './fixtures/sample-scene';

let worker_url = '/dist/tangram.debug.js';

function loadWorkerContent(url) {
    let xhr = new XMLHttpRequest(), response;

    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4 && xhr.status === 200) {
            response = xhr.responseText;
        }
    };

    xhr.onerror = (error) => {
        throw error;
    };

    xhr.open('GET', url, false);
    xhr.send();
    return response;
}

let workerBody = loadWorkerContent(worker_url);

sinon.stub(Scene, 'loadWorkerUrl').returns(Promise.resolve(
    URL.createObjectURL(new Blob([workerBody], { type: 'application/javascript' }))
));

window.makeScene = function (options) {
    options = options || {};

    options.disableRenderLoop = true;
    options.workerUrl = '/dist/tangram.debug.js';
    options.worker_timeout = 1000;

    return new Scene(
        TileSource.create(_.clone(sampleScene.tile_source)),
        sampleScene.config,
        options
    );

};
