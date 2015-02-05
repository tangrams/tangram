// Polygon rendering style

import {Style} from '../style';
import {StyleParser} from '../style_parser';
import gl from '../../gl/constants'; // web workers don't have access to GL context, so import all GL constants
import VertexLayout from '../../gl/vertex_layout';
import Builders from '../builders';
import Texture from '../../gl/texture';
import Geo from '../../geo';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';

export var Text = Object.create(Style);

Object.assign(Text, {
    name: 'text',
    built_in: true,

    init() {
        Style.init.apply(this);

        // Base shaders
        this.vertex_shader_key = 'styles/text/text_vertex';
        this.fragment_shader_key = 'styles/text/text_fragment';

        var attribs = [
            { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_normal', size: 3, type: gl.FLOAT, normalized: false },
            // { name: 'a_normal', size: 3, type: gl.BYTE, normalized: true }, // attrib isn't a multiple of 4!
            // { name: 'a_color', size: 3, type: gl.FLOAT, normalized: false },
            { name: 'a_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            // { name: 'a_selection_color', size: 4, type: gl.FLOAT, normalized: false },
            { name: 'a_selection_color', size: 4, type: gl.UNSIGNED_BYTE, normalized: true },
            { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false },
            { name: 'a_texcoord', size: 2, type: gl.FLOAT, normalized: false }
        ];
        this.vertex_layout = new VertexLayout(attribs);

        this.texcoords = true;

        this.shaders.uniforms = {
            u_alpha_discard: .4
        };

        if (Utils.isMainThread) {
            WorkerBroker.addTarget('Text', this);
        }

        this.texts = {}; // unique texts, keyed by tile
        this.texture = {};
        this.ctx = {};

        this.size = 14;
    },

    setGL (gl) {
        Style.setGL.apply(this, arguments);
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

        this.texture[tile] = new Texture(this.gl, 'labels-' + tile, { filtering: 'nearest' });
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
        let texture_size = Utils.fitPowerOf2(widest, height);
        //let texture_size = 512;

        console.log(`text summary for tile ${tile}: ${widest} widest, ${height} total height, fits in ${texture_size}x${texture_size}px`);

        canvas.width = texture_size;
        canvas.height = texture_size;
        this.ctx[tile].clearRect(0, 0, canvas.width, canvas.height);

        // TODO: cleanup, seems the canvas font settings need to be refreshed whenever canvas size changes
        this.setFont({ size: 12 }, tile);

        for (let text in this.texts[tile]) {
            let info = this.texts[tile][text];

            this.drawText(text, info.position, tile);

            info.texcoords = Builders.getTexcoordsForSprite(
                info.position,
                info.size,
                [texture_size, texture_size]
            );
        }

        this.texture[tile].update();

        return Promise.resolve(this.texts[tile]);
    },

    // Override
    startData () {
        let tile_data = Style.startData.apply(this);
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

        tile_data.uniforms = { label_atlas: 'labels-'+tile };

        return WorkerBroker.postMessage('Text', 'addTexts', tile, this.texts[tile]).then(texts => {

            // this.texcoord_scale = texcoords;
            this.texts[tile] = texts;
            // this.texcoord_scale = this.texts[tile][Object.keys(this.texts[tile])[0]].texcoords;

            tile_data.queue.forEach(q => Style.addFeature.apply(this, q));
            tile_data.queue = [];

            return Style.endData.call(this, tile_data);
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

    _parseFeature (feature, rule_style, context) {
        var style = this.feature_style;

        // style.texture = rule_style.texture;
        // style.sprite = 'test'; //rule_style.sprite;

        // style.size = rule_style.size && StyleParser.parseDistance(rule_style.size, context);
        // style.size = StyleParser.parseDistance(['256px', '256px'], context);

        // var xratio = (this.texcoord_scale[1][0] - this.texcoord_scale[0][0]) / (this.texcoord_scale[1][1] - this.texcoord_scale[0][1]);
        // style.size = StyleParser.parseDistance([`${this.size * xratio}px`, `${this.size}px`], context);

        style.text = feature.properties.name;

        let tile = context.tile.key;
        style.size = this.texts[tile][style.text].size;
        style.size = [style.size[0] * Geo.units_per_pixel, style.size[1] * Geo.units_per_pixel];

        this.texcoord_scale = this.texts[tile][style.text].texcoords;

        return style;
    },

    /**
     * A "template" that sets constant attibutes for each vertex, which is then modified per vertex or per feature.
     * A plain JS array matching the order of the vertex layout.
     */
    makeVertexTemplate(style) {
        // Placeholder values
        var color = style.color || [0, 0, 0, 1];

        // Basic attributes, others can be added (see texture UVs below)
        var template = [
            // position - x & y coords will be filled in per-vertex below
            0, 0, style.z || 0,
            // normal
            0, 0, 1,
            // color
            // TODO: automate multiplication for normalized attribs?
            color[0] * 255, color[1] * 255, color[2] * 255, color[3] * 255,
            // selection color
            style.selection_color[0] * 255, style.selection_color[1] * 255, style.selection_color[2] * 255, style.selection_color[3] * 255,
            // draw order
            style.order
        ];

        // if (this.texcoords) {
            template.push(0, 0);            // Add texture UVs to template only if needed
            // this.setTexcoordScale(style);   // Sets texcoord scale if needed (e.g. for sprite sub-area)
        // }

        return template;

    },

    buildPoints(points, style, vertex_data) {
        // if (!style.color || !style.size) {
        //     return;
        // }

        // WorkerBroker.postMessage('Text', 'addText', style.text); //.then(texcoords => {
            // this.texcoords = texcoords;
            Builders.buildQuadsForPoints(
                points,
                style.size[0] || style.size,
                style.size[1] || style.size,
                vertex_data,
                this.makeVertexTemplate(style),
                { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
            );
        // });
    }

});
