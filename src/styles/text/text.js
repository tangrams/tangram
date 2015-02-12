// Polygon rendering style

import Builders from '../builders';
import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {Sprites} from '../sprites/sprites';
import {Vector} from '../../vector';
import {Label} from './label';

export var Text = Object.create(Sprites);

Object.assign(Text, {
    name: 'text',
    super: Sprites,
    built_in: true,

    init() {

        this.super.init.apply(this);

        // Provide a hook for this object to be called from worker threads
        if (Utils.isMainThread) {
            WorkerBroker.addTarget('Text', this);
        }

        this.texts = {}; // unique texts, keyed by tile
        this.texture = {};
        this.ctx = {};

        this.size = 14;
    },

    // Set font style params for canvas drawing
    // TODO: un-hardcode
    setFont ({ size }, tile) {
        this.size = size;
        this.buffer = 6; // pixel padding around text

        this.ctx[tile].font = `${this.size}px Helvetica`;
        this.ctx[tile].strokeStyle = 'black';
        this.ctx[tile].fillStyle = 'white';
        this.ctx[tile].lineWidth = 4;
        this.ctx[tile].miterLimit = 2;
    },

    // Width and height of text based on current font style
    textSize (text, tile) {
        return [
            Math.ceil(this.ctx[tile].measureText(text).width) + this.buffer * 2,
            this.size + this.buffer * 2
        ];
    },

    // Draw text at specified location, adjusting for buffer and baseline
    drawText (text, [x, y], tile) {
        // TODO: optional stroke
        this.ctx[tile].strokeText(text, x + this.buffer, y + this.buffer + this.size);
        this.ctx[tile].fillText(text, x + this.buffer, y + this.buffer + this.size);
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    addTexts (tile, texts) {
        var canvas = document.createElement('canvas');

        this.texture[tile] = new Texture(this.gl, 'labels-' + tile, { filtering: 'linear' });
        this.texture[tile].setCanvas(canvas);
        this.ctx[tile] = canvas.getContext('2d');
        this.texts[tile] = texts;

        this.setFont({ size: 12 }, tile);

        // Find widest label and sum of all label heights
        let widest = 0, height = 0;
        for (let text in this.texts[tile]) {
            let size = this.textSize(text, tile);

            this.texts[tile][text] = {
                size,
                position: [0, height]
             };

            if (size[0] > widest) {
                widest = size[0];
            }
            height += size[1];
        }

        // Find smallest power-of-2 texture size
        let texture_size = [ widest, height ];
        //let texture_size = 512;

        console.log(`text summary for tile ${tile}: ${widest} widest, ${height} total height, fits in ${texture_size[0]}x${texture_size[1]}px`);

        canvas.width = texture_size[0];
        canvas.height = texture_size[1];
        this.ctx[tile].clearRect(0, 0, canvas.width, canvas.height);

        // TODO: cleanup, seems the canvas font settings need to be refreshed whenever canvas size changes
        this.setFont({ size: 12 }, tile);

        for (let text in this.texts[tile]) {
            let info = this.texts[tile][text];

            this.drawText(text, info.position, tile);

            info.texcoords = Builders.getTexcoordsForSprite(
                info.position,
                info.size,
                texture_size
            );
        }

        this.texture[tile].update();

        return Promise.resolve(this.texts[tile]);
    },

    // Override
    startData () {
        let tile_data = this.super.startData.apply(this);
        tile_data.queue = [];
        return tile_data;
    },

    // Override
    endData (tile_data) {
        // Count collected text
        let tile, count;
        if (tile_data.queue.length > 0) {
            tile = tile_data.queue[0][2].tile.key;
            count = Object.keys(this.texts[tile]||{}).length;
            console.log(`# texts for tile ${tile}: ${count}`);
        }
        if (!count) {
            return Promise.resolve();
        }

        // Attach tile-specific label atlas to mesh as a texture uniform
        tile_data.uniforms = { u_textures: ['labels-'+tile] };

        // Call to main thread to render label atlas for this tile, and return size & UV info
        return WorkerBroker.postMessage('Text', 'addTexts', tile, this.texts[tile]).then(texts => {

            this.texts[tile] = texts;

            // Build queued features
            tile_data.queue.forEach(q => this.super.addFeature.apply(this, q));
            tile_data.queue = [];

            return this.super.endData.call(this, tile_data);
        });
    },

    // Override to queue features instead of processing immediately
    addFeature (feature, rule, context, tile_data) {
        // Collect text
        let text = feature.properties.name;
        if (text) {
            let tile = context.tile.key;
            if (!this.texts[tile]) {
                this.texts[tile] = {};
            }

            this.texts[tile][text] = true;
        }

        tile_data.queue.push([feature, rule, context, tile_data]);
    },

    buildLines (lines, style, vertex_data) {
        var vertex_template = this.makeVertexTemplate(style);
        let line = lines[0];

        if (line.length > 2) {
            return;
        }

        let p0 = line[0];
        let p1 = line[1];
        let p0p1 = Vector.sub(p1, p0);

        p0p1 = Vector.normalize(p0p1);

        let theta = Math.atan2(p0p1[0], p0p1[1]) + Math.PI / 2;

        if (theta > Math.PI / 2 || theta < -Math.PI / 2) {
            theta += Math.PI;
        }

        //let label = new Label(style.text, style.tile, line[0], style.size, theta);

        Builders.buildSpriteQuadsForPoints(
            [ line[0] ],
            Utils.scaleInt16(style.size[0], 128), Utils.scaleInt16(style.size[1], 128),
            Utils.scaleInt16(Utils.radToDeg(theta), 360), 
            Utils.scaleInt16(style.scale, 256),
            vertex_data,
            vertex_template,
            this.vertex_layout.index.a_shape,
            { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
        );
    },

    _parseFeature (feature, rule_style, context) {
        let style = this.feature_style;
        let tile = context.tile.key;

        style.text = feature.properties.name;

        // max allowed width + height of 128 pixels
        style.size = this.texts[tile][style.text].size;
        style.size = [
            Math.min((style.size[0] || style.size), 256),
            Math.min((style.size[1] || style.size), 256) 
        ];

        style.angle = rule_style.angle || 0;
        if (typeof style.angle === 'function') {
            style.angle = style.angle(context);
        }

        // factor by which sprites scales from current zoom level to next zoom level
        style.scale = rule_style.scale || 1;

        // to store bbox by tiles
        style.tile = tile;

        // whether the labels should be removed when out of tile boundaries
        style.keep_in_tile = true;
        style.move_in_tile = true;

        // Set UVs
        this.texcoord_scale = this.texts[tile][style.text].texcoords;

        return style;
    }

});
