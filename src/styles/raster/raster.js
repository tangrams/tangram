// Raster tile rendering style

import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {StyleParser} from '../style_parser';
import {Polygons} from '../polygons/polygons';

export let RasterStyle = Object.create(Polygons);

Object.assign(RasterStyle, {
    name: 'raster',
    super: Polygons,
    built_in: true,
    selection: false, // no feature selection by default

    init() {
        // Enable texture UVs since they're required for raster tiles
        this.texcoords = true;

        this.super.init.apply(this, arguments);

        // Provide a hook for this object to be called from worker threads
        this.main_thread_target = 'RasterStyle-' + this.name;
        if (Utils.isMainThread) {
            WorkerBroker.addTarget(this.main_thread_target, this);
        }

        // Enable raster texture and configure how it is applied
        this.defines.TANGRAM_RASTER_TEXTURE = true;
        if (this.apply == null || this.apply === 'color') { // default to applying as color
            this.defines.TANGRAM_RASTER_TEXTURE_COLOR = true;
        }
        else if (this.apply === 'normal') {
            this.defines.TANGRAM_RASTER_TEXTURE_NORMAL = true;
        }
    },

    _preprocess (draw) {
        // Raster tiles default to white vertex color, as this color will tint the underlying texture
        draw.color = draw.color || StyleParser.defaults.color;
        return this.super._preprocess.apply(this, arguments);
    },

    endData (tile) {
        return this.super.endData.call(this, tile).then(tile_data => {
            // Add tile texture to mesh
            let texture = tile.texture; // TODO: call data source to get this directly?
            if (texture) {
                tile_data.uniforms = tile_data.uniforms || {};
                tile_data.uniforms.u_raster_texture = texture.url;
                tile_data.textures = [texture.url]; // assign texture ownership to tile

                // Load textures on main thread and return when done
                // We want to block the building of a raster tile mesh until its texture is loaded,
                // to avoid flickering while loading (texture will render as black)
                return WorkerBroker.postMessage(this.main_thread_target+'.loadTextures', { [texture.url]: texture })
                    .then((textures) => {
                        // Set texture width/height (returned after loading from main thread)
                        tile_data.uniforms.u_raster_texture_size = textures[0];
                        tile_data.uniforms.u_raster_texture_pixel_size = [1 / textures[0][0], 1 / textures[0][1]];
                        return tile_data;
                    }
                );
            }

            return tile_data;
        });
    },

    // Called on main thread
    loadTextures (textures) {
        // NB: only return size of textures loaded, because we can't send actual texture objects to worker
        return Texture.createFromObject(this.gl, textures)
            .then(() => {
                return Promise.all(Object.keys(textures).map(t => {
                    return Texture.textures[t] && Texture.textures[t].load();
                }).filter(x => x));
            })
            .then(textures => {
                return textures.map(t => [t.width, t.height]);
            });
    }

});
