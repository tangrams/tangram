// Text rendering style

import Builders from '../builders';
import {StyleParser} from '../style_parser';
import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {Sprites} from '../sprites/sprites';
import Label from './label';

import log from 'loglevel';

export let TextStyle = Object.create(Sprites);

Object.assign(TextStyle, {
    name: 'text',
    super: Sprites,
    built_in: true,
    selection: false,

    init() {

        this.super.init.apply(this);

        // Provide a hook for this object to be called from worker threads
        if (Utils.isMainThread) {
            WorkerBroker.addTarget('TextStyle', this);
        }

        this.texts = {}; // unique texts, keyed by tile
        this.texture = {};
        this.canvas = {};
        this.bboxes = {};

        this.font_style = {
            typeface: 'Helvetica',
            size: '12px',
            fill: 'white'
        };

        // default label style
        this.label_style = {
            lines: { exceed: 60 }
        };
    },

    // Set font style params for canvas drawing
    setFont (tile, { size, typeface, fill, stroke }) {
        this.size = parseInt(size);
        this.buffer = 6; // pixel padding around text
        let ctx = this.canvas[tile].context;

        ctx.font = size + ' ' + typeface;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }
        ctx.fillStyle = fill;
        ctx.lineWidth = 4;
        ctx.miterLimit = 2;
    },

    // Width and height of text based on current font style
    textSize (text, tile) {
        return [
            Math.ceil(this.canvas[tile].context.measureText(text).width) + this.buffer * 2,
            this.size + this.buffer * 2
        ];
    },

    // Draw text at specified location, adjusting for buffer and baseline
    drawText (text, [x, y], tile, stroke) {
        if (stroke) {
            this.canvas[tile].context.strokeText(text, x + this.buffer, y + this.buffer + this.size);
        }
        this.canvas[tile].context.fillText(text, x + this.buffer, y + this.buffer + this.size);
    },

    setTextureTextPositions (texts) {
        // Find widest label and sum of all label heights
        let widest = 0, height = 0;

        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];
                let size = text_info.size;

                text_info.position = [0, height];

                if (size[0] > widest) {
                    widest = size[0];
                }

                height += size[1];
            }
        }

        return [ widest, height ];
    },

    getTextSizes (tile, texts) {
        // create a canvas
        if(!this.canvas[tile]) {
            let canvas = document.createElement('canvas');
            this.canvas[tile] = {
                canvas: canvas,
                context: canvas.getContext('2d')
            };
        }

        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                // update text sizes
                this.setFont(tile, text_infos[text].text_style);
                text_infos[text].size = this.textSize(text, tile);
            }
        }

        return Promise.resolve(texts);
    },

    // Called on main thread to release tile-specific resources
    freeTile (tile) {
        delete this.canvas[tile];
        delete this.texture[tile];
    },

    rasterize (tile, texts, texture_size) {
        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let info = text_infos[text];

                this.setFont(tile, info.text_style);
                this.drawText(text, info.position, tile, info.text_style.stroke);

                info.texcoords = Builders.getTexcoordsForSprite(
                    info.position,
                    info.size,
                    texture_size
                );
            }
        }
    },

    // Called on main thread from worker, to create atlas of labels for a tile
    addTexts (tile, texts) {
        this.texts[tile] = texts;

        let texture_size = this.setTextureTextPositions(texts);
        let context = this.canvas[tile].context;

        log.trace(`text summary for tile ${tile}: fits in ${texture_size[0]}x${texture_size[1]}px`);

        // update the canvas "context"
        this.canvas[tile].canvas.width = texture_size[0];
        this.canvas[tile].canvas.height = texture_size[1];
        context.clearRect(0, 0, texture_size[0], texture_size[1]);

        // create a texture
        let texture = 'labels-' + tile + '-' + (TextStyle.texture_id++);
        this.texture[tile] = new Texture(this.gl, texture, { filtering: 'linear' });
        // this.texture[tile].owner = { tile };

        // ask for rasterization for the text set
        this.rasterize(tile, texts, texture_size);

        this.texture[tile].setCanvas(this.canvas[tile].canvas);
        delete this.texture[tile];
        delete this.canvas[tile]; // we don't need canvas once it has been copied to GPU texture

        return Promise.resolve({ texts: this.texts[tile], texture });
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
            log.trace(`# texts for tile ${tile}: ${count}`);
        }
        if (!count) {
            return Promise.resolve();
        }

        // first call to main thread, ask for text pixel sizes
        return WorkerBroker.postMessage('TextStyle', 'getTextSizes', tile, this.texts[tile]).then(texts => {
            this.bboxes[tile] = [];

            // cleanup of texts that should be removed after occlusion test
            for (let style in texts) {
                let text_infos = texts[style];

                for (let text in text_infos) {
                    let text_info = text_infos[text];
                    let label;
                    let keep_in_tile;
                    let move_in_tile;
                    let geometry = this.texts[tile][style][text].geometry;
                    let exceed_heuristic = this.label_style.lines.exceed;

                    if (geometry.type === "LineString") {
                        let lines = geometry.coordinates;
                        let line = [lines[0]];

                        keep_in_tile = true;
                        move_in_tile = true;

                        label = new Label(text, line[0], text_info.size, lines);
                    } else if (geometry.type === "Point") {
                        let points = [geometry.coordinates];

                        keep_in_tile = true;
                        move_in_tile = false;

                        label = new Label(text, points[0], text_info.size);
                    }
                    else {
                        // TODO: support MultiLineString, MultiPoint, Polygon, and MultiPolygon labels
                        continue;
                    }

                    if (label.discard(move_in_tile, keep_in_tile, this.bboxes[tile], exceed_heuristic)) {
                        // remove the text from the map
                        delete text_infos[text];
                    }

                    text_info.label = label;
                }

                // No labels for this style
                if (Object.keys(text_infos).length === 0) {
                    delete texts[style];
                }
            }

            // No labels for this tile
            if (Object.keys(texts).length === 0) {
                WorkerBroker.postMessage('TextStyle', 'freeTile', tile);
                // early exit
                return;
            }

            // second call to main thread, for rasterizing the set of texts
            return WorkerBroker.postMessage('TextStyle', 'addTexts', tile, texts).then(({ texts, texture }) => {
                this.texts[tile] = texts;

                // Attach tile-specific label atlas to mesh as a texture uniform
                tile_data.uniforms = { u_textures: [texture] };
                tile_data.textures = [texture]; // assign texture ownership to tile

                // Build queued features
                tile_data.queue.forEach(q => this.super.addFeature.apply(this, q));
                tile_data.queue = [];
                delete this.texts[tile];

                return this.super.endData.call(this, tile_data);
            });
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

            let style = this.constructFontStyle(rule, context);
            if (!style) {
                return;
            }

            let style_key = this.constructStyleKey(style);

            // Save font style info on feature for later use during geometry construction
            feature.font_style = style;
            feature.font_style_key = style_key;

            if (!this.texts[tile][style_key]) {
                this.texts[tile][style_key] = {};
            }

            this.texts[tile][style_key][text] = {
                text_style: style,
                geometry: feature.geometry
            };
        }

        tile_data.queue.push([feature, rule, context, tile_data]);
    },

    constructFontStyle (rule, context) {
        let style;

        if (rule.font) {
            rule.font.fill = rule.font.fill && StyleParser.parseColor(rule.font.fill, context);
            rule.font.stroke = rule.font.stroke && StyleParser.parseColor(rule.font.stroke, context);

            style = {
                typeface: rule.font.typeface || this.font_style.typeface,
                size: rule.font.size || this.font_style.size,
                fill: !rule.font.fill ? this.font_style.fill : Utils.toCanvasColor(rule.font.fill),
                stroke: !rule.font.stroke ? this.font_style.stroke : Utils.toCanvasColor(rule.font.stroke)
            };
        }

        return style;
    },

    constructStyleKey ({ typeface, size, fill, stroke }) {
        return `${typeface}/${size}/${fill}/${stroke}`;
    },

    build (style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);

        Builders.buildSpriteQuadsForPoints(
            [ style.label.position ],
            Utils.scaleInt16(style.label.size[0], 128), Utils.scaleInt16(style.label.size[1], 128),
            Utils.scaleInt16(Utils.radToDeg(style.label.angle), 360),
            Utils.scaleInt16(1, 256),
            vertex_data,
            vertex_template,
            this.vertex_layout.index.a_shape,
            { texcoord_index: this.vertex_layout.index.a_texcoord, texcoord_scale: this.texcoord_scale }
        );
    },

    buildLines (lines, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPoints (points, style, vertex_data) {
        this.build(style, vertex_data);
    },

    _parseFeature (feature, rule_style, context) {
        // debugger;
        // console.log(`label ${feature.properties.name} tile ${context.tile.key}`, feature, context.tile);

        let style = this.feature_style;
        let tile = context.tile.key;
        let text = feature.properties.name; // TODO: make configurable
        let style_key = feature.font_style_key;
        let text_info = this.texts[tile] && this.texts[tile][style_key] && this.texts[tile][style_key][text];

        if (!text_info || !text_info.label) {
            return;
        }

        this.texcoord_scale = text_info.texcoords;
        style.text = text;
        style.tile = tile; // to store bbox by tiles
        style.label = text_info.label;

        return style;
    }

});

TextStyle.texture_id = 0;
