import TileSource  from '../src/tile_source';
import Scene       from '../src/scene';
import sampleScene from './fixtures/sample-scene';

export function makeScene(options) {
    options = options || {};
    options.disableRenderLoop = true;
    return new Scene(
        TileSource.create(_.clone(sampleScene.tile_source)),
        sampleScene.layers,
        sampleScene.styles,
        options
    );
}
