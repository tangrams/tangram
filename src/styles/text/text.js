// Text rendering style

import Builders from '../builders';
import {StyleParser} from '../style_parser';
import Texture from '../../gl/texture';
import WorkerBroker from '../../utils/worker_broker';
import Utils from '../../utils/utils';
import {Sprites} from '../sprites/sprites';
import LabelPoint from './label_point';
import LabelLine from './label_line';

import log from 'loglevel';

export let TextStyle = Object.create(Sprites);

Object.assign(TextStyle, {
    name: 'text',
    super: Sprites,
    built_in: true,
    selection: false,

    init() {

        this.super.init.apply(this, arguments);

        // Provide a hook for this object to be called from worker threads
        if (Utils.isMainThread) {
            WorkerBroker.addTarget('TextStyle', this);
        }

        this.texts = {}; // unique texts, keyed by tile
        this.texture = {};
        this.canvas = {};
        this.bboxes = {};
        this.maxPriority = 0;

        // default font style
        this.font_style = {
            typeface: 'Helvetica 12px',
            fill: 'white',
            capitalized: false,
            stroke: {
                color: 'black',
                width: 3
            }
        };

        // default label style
        this.label_style = {
            priorities: {
                administrative: 4,
                restaurant: 3,
                major_road: 2,
                minor_road: 1
            },
            lines: {
                exceed: 80,
                offset: 0
            },
            points: {
                max_width: 100
            }
        };
    },

    // Set font style params for canvas drawing
    setFont (tile, { font, fill, stroke, stroke_width, px_size }) {
        this.size = parseInt(px_size);
        this.buffer = 6 * this.device_pixel_ratio; // pixel padding around text
        let ctx = this.canvas[tile].context;

        ctx.font = font;
        if (stroke) {
            ctx.strokeStyle = stroke;
        }
        ctx.fillStyle = fill;
        ctx.lineWidth = stroke_width;
        ctx.miterLimit = 2;
    },

    // Width and height of text based on current font style
    textSize (text, tile, capitalized) {
        let str = capitalized ? text.toUpperCase() : text;
        let ctx = this.canvas[tile].context;
        let split = str.split(' ');
        let split_size = {
            " ": this.canvas[tile].context.measureText(" ").width
        };

        for (let i in split) {
            let word = split[i];
            split_size[word] = ctx.measureText(word).width;
        }

        let text_size = [
            this.canvas[tile].context.measureText(str).width,
            this.size
        ];
        let texture_text_size = [
            Math.ceil(text_size[0]) + this.buffer * 2,
            this.size + this.buffer * 2
        ];

        return { split_size, text_size, texture_text_size };
    },

    // Draw text at specified location, adjusting for buffer and baseline
    drawText (text, [x, y], tile, stroke, capitalized) {
        let str = capitalized ? text.toUpperCase() : text;
        if (stroke) {
            this.canvas[tile].context.strokeText(str, x + this.buffer, y + this.buffer + this.size);
        }
        this.canvas[tile].context.fillText(str, x + this.buffer, y + this.buffer + this.size);
    },

    setTextureTextPositions (texts) {
        // Find widest label and sum of all label heights
        let widest = 0, height = 0;

        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];
                let size = text_info.size.texture_text_size;

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
                let text_style = text_infos[text].text_style;
                // update text sizes
                this.setFont(tile, text_style);
                text_infos[text].size = this.textSize(text, tile, text_style.capitalized);
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
                this.drawText(text, info.position, tile, info.text_style.stroke, info.text_style.capitalized);

                info.texcoords = Builders.getTexcoordsForSprite(
                    info.position,
                    info.size.texture_text_size,
                    texture_size
                );

                // sub-texts uv mapping
                for (let i in info.sub_texts) {
                    let sub_text = info.sub_texts[i];

                    if (!info.subtexcoords) {
                        info.subtexcoords = {}
                    }

                    // TODO : compute sub texture coordinates
                    // info.subtexcoords[sub_text] = Builders.getTexcoordsForSprite(
                    //    info.position,
                    //    info.size.texture_text_size,
                    //    texture_size
                    //);
                }
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

    labelsFromGeometry (geometry, { text, size }) {
        let labels = [];

        if (geometry.type === "LineString") {
            let lines = geometry.coordinates;
            labels.push(new LabelLine(text, size, lines, this.label_style.lines, true, true));
        } else if (geometry.type === "MultiLineString") {
            let lines = geometry.coordinates;
            for (let i = 0; i < lines.length; ++i) {
                let line = lines[i];
                labels.push(new LabelLine(text, size, line, this.label_style.lines, true, true));
            }
        } else if (geometry.type === "Point") {
            let width = this.label_style.points.max_width * this.device_pixel_ratio;
            if (width && size.text_size[0] > width) {
            //    let label = LabelPoint.explode(text, geometry.coordinates, size, width, Utils.pixelToMercator(24), false, true);
            //    labels.push(label);
            } else {
                labels.push(new LabelPoint(text, geometry.coordinates, size, null, false, true));
            }
        } else if (geometry.type === "MultiPoint") {
            let points = geometry.coordinates;
            for (let i = 0; i < points.length; ++i) {
                let point = points[i];
                labels.push(new LabelPoint(text, point, size, null, false, true));
            }
        } else if (geometry.type === "Polygon") {
            let centroid = Utils.centroid(geometry.coordinates[0]);
            let area = Utils.polygonArea(geometry.coordinates[0]);
            labels.push(new LabelPoint(text, centroid, size, area, false, false));
        } else if (geometry.type === "MultiPolygon") {
            let centroid = Utils.multiCentroid(geometry.coordinates);
            let area = Utils.multiPolygonArea(geometry.coordinates);
            labels.push(new LabelPoint(text, centroid, size, area, false, false));
        }

        return labels;
    },

    subTextInfos (label_composite, text_info) {
        if (!text_info.sub_texts) {
            text_info.sub_texts = [];
        }

        for (let i in label_composite.labels) {
            let label = label_composite.labels[i];
            text_info.sub_texts.push(label.text);
        }
    },

    createLabels (tile, texts) {
        let labels_priorities = [];

        for (let style in texts) {
            let text_infos = texts[style];

            for (let text in text_infos) {
                let text_info = text_infos[text];

                for (let f = 0; f < this.features[tile][style][text].length; f++) {
                    let feature = this.features[tile][style][text][f];
                    let labels = this.labelsFromGeometry(feature.geometry, { text: text, size: text_info.size });

                    for (let i = 0; i < labels.length; ++i) {
                        let label = labels[i];
                        let area = label.area;

                        labels_priorities[text_info.priority] = labels_priorities[text_info.priority] || [];
                        labels_priorities[text_info.priority].push({ style, feature, label, area });

                        if (label.isComposite()) {
                            this.subTextInfos(label, text_info);
                        }
                    }
                }
            }
        }

        // sort by area size if defined
        for (let p = 0; p < labels_priorities.length; ++p) {
            if (!labels_priorities[p]) {
                continue;
            }

            labels_priorities[p].sort((e1, e2) => {
                if (e1.area && e2.area) {
                    return e1.area < e2.area;
                } else {
                    return false;
                }
            });
        }

        return labels_priorities;
    },

    discardLabels (tile, labels, texts) {
        this.bboxes[tile] = [];

        for (let priority = this.maxPriority; priority >= 0; priority--) {
            if (!labels[priority]) {
                continue;
            }

            for (let i = 0; i < labels[priority].length; i++) {
                let { style, feature, label } = labels[priority][i];

                if (label.discard(this.bboxes[tile])) {
                    texts[style][label.text].ref--;
                } else {
                    if (!feature.labels) {
                        feature.labels = [];
                    }
                    feature.labels.push(label);
                    texts[style][label.text].ref++;
                }
            }
        }

        for (let style in texts) {
            for (let text in texts[style]) {
                if (texts[style][text].ref <= 0) {
                    delete texts[style][text];
                }
            }
        }

        for (let style in texts) {
            let text_infos = texts[style];
            // No labels for this style
            if (Object.keys(text_infos).length === 0) {
                delete texts[style];
            }
        }
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
            let labels = this.createLabels(tile, texts);

            this.discardLabels(tile, labels, texts);

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
        if (feature.properties.name) {
            let text;
            let source = rule.text_source || 'name';

            if (typeof source === 'string') {
                text = feature.properties[source];
            } else if (typeof source === 'function') {
                text = source(context);
            }
            feature.text = text;

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

            let priority = 0;
            if (this.label_style.priorities[feature.properties.kind]) {
                priority = this.label_style.priorities[feature.properties.kind];
            }

            this.maxPriority = Math.max(priority, this.maxPriority);

            if (!this.texts[tile][style_key][text]) {
                this.texts[tile][style_key][text] = {
                    text_style: style,
                    priority: priority,
                    ref: 0
                };
            }

            this.features = this.features || {};
            this.features[tile] = this.features[tile] || {};
            this.features[tile][style_key] = this.features[tile][style_key] || {};
            this.features[tile][style_key][text] = this.features[tile][style_key][text] || [];
            this.features[tile][style_key][text].push(feature);
        }

        tile_data.queue.push([feature, rule, context, tile_data]);
    },

    constructFontStyle (rule, context) {
        let style;

        if (rule.font) {
            rule.font.fill = rule.font.fill && StyleParser.parseColor(rule.font.fill, context);

            if (rule.font.stroke) {
                let color = rule.font.stroke.color || rule.font.stroke;
                rule.font.stroke = {
                    color: StyleParser.parseColor(color, context),
                    width: rule.font.stroke.width
                };
            }

            style = {
                font: rule.font.typeface || this.font_style.typeface,
                fill: !rule.font.fill ? this.font_style.fill : Utils.toCanvasColor(rule.font.fill),
                stroke: !rule.font.stroke.color ? this.font_style.stroke.color : Utils.toCanvasColor(rule.font.stroke.color),
                stroke_width: rule.font.stroke.width || this.font_style.stroke.width,
                capitalized: rule.font.capitalized || this.font_style.capitalized
            };

            let size_regex = /([0-9]*\.)?[0-9]+(px|pt|em|%)/g;
            let ft_size = style.font.match(size_regex)[0];
            let size_kind = ft_size.replace(/([0-9]*\.)?[0-9]+/g, '');

            style.px_size = Utils.toPixelSize(ft_size.replace(/([a-z]|%)/g, ''), size_kind) * this.device_pixel_ratio;
            style.stroke_width *= this.device_pixel_ratio;
            style.font = style.font.replace(size_regex, style.px_size + "px");
        }

        return style;
    },

    constructStyleKey ({ typeface, fill, stroke, stroke_width }) {
        return `${typeface}/${fill}/${stroke}/${stroke_width}`;
    },

    buildLabel (label, vertex_data, vertex_template, texcoord_scale) {
        let angle = label.angle || 0;
        Builders.buildSpriteQuadsForPoints(
            [ label.position ],
            Utils.scaleInt16(label.size.texture_text_size[0], 128),
            Utils.scaleInt16(label.size.texture_text_size[1], 128),
            Utils.scaleInt16(Utils.radToDeg(angle), 360),
            Utils.scaleInt16(1, 256),
            vertex_data,
            vertex_template,
            this.vertex_layout.index.a_shape,
            {
                texcoord_index: this.vertex_layout.index.a_texcoord,
                texcoord_scale: texcoord_scale
            }
        );
    },

    build (style, vertex_data) {
        let vertex_template = this.makeVertexTemplate(style);

        for (let i in style.labels) {
            let label = style.labels[i];

            if (label.isComposite()) {
                for (let j in label.labels) {
                    let subtexcoord_scale = this.subtexcoord_scale[label.text];
                    this.buildLabel(label.labels[j], vertex_data, vertex_template, subtexcoord_scale);
                }
            } else {
                this.buildLabel(label, vertex_data, vertex_template, this.texcoord_scale);
            }
        }
    },

    buildLines (lines, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPoints (points, style, vertex_data) {
        this.build(style, vertex_data);
    },

    buildPolygons (points, style, vertex_data) {
        this.build(style, vertex_data);
    },

    _parseFeature (feature, rule_style, context) {
        // console.log(`label ${feature.properties.name} tile ${context.tile.key}`, feature, context.tile);
        let text = feature.text;

        let style = this.feature_style;
        let tile = context.tile.key;
        let style_key = feature.font_style_key;
        let text_info = this.texts[tile] && this.texts[tile][style_key] && this.texts[tile][style_key][text];

        if (!text_info || !feature.labels) {
            return;
        }

        this.texcoord_scale = text_info.texcoords;
        this.subtexcoord_scale = text_info.subtexcoords;
        style.text = text;
        style.tile = tile; // to store bbox by tiles
        style.labels = feature.labels;

        return style;
    }

});

TextStyle.texture_id = 0;
