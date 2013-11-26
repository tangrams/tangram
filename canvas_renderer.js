CanvasRenderer.prototype = Object.create(VectorRenderer.prototype);

function CanvasRenderer (leaflet, layers)
{
    VectorRenderer.apply(this, arguments);
}

CanvasRenderer.prototype.init = function CanvasRendererInit ()
{
    // Selection info shown on hover
    this.selection_info = document.createElement('div');
    this.selection_info.setAttribute('class', 'label');
    this.selection_info.style.display = 'none';

    this.initMapHandlers();
};

// Leaflet map/layer handlers
CanvasRenderer.prototype.initMapHandlers = function CanvasRendererInitMapHandlers ()
{
    var renderer = this;

    this.leaflet.layer.on('tileunload', function (event) {
        var tile = event.tile;
        var key = tile.getAttribute('data-tile-key');
        if (key && renderer.tiles[key]) {
            console.log("unload " + key);
            renderer.removeTile(key);
        }
    });
};

CanvasRenderer.prototype.addTile = function CanvasRendererAddTile (tile, tileDiv)
{
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.width = Geo.tile_size.x;
    canvas.height = Geo.tile_size.y;
    canvas.style.background = 'rgb(' + this.styles.default.join(',') + ')';

    this.renderTile(tile, context);
    tileDiv.appendChild(canvas);
};

CanvasRenderer.prototype.render = function CanvasRendererRender ()
{
    // Render is a no-op because canvas only needs to be rendered once at the time the tile is added
    // TODO: perhaps add some 'dirty' tile support to enable things like animation or style changes
};

// Scale a GeoJSON coordinate (2-element array) from [min, max] to tile pixels
// returns a copy of geometry.coordinates transformed into Points
CanvasRenderer.prototype.scaleGeometryToPixels = function scaleGeometryToPixels (geometry, min, max)
{
    return Geo.transformGeometry(geometry, function (coordinates) {
        return Point(
            Math.round((coordinates[0] - min.x) * Geo.tile_size.x / (max.x - min.x)), // rounding removes seams but causes aliasing
            Math.round((coordinates[1] - min.y) * Geo.tile_size.y / (max.y - min.y))
        );
    });
};

// Renders a line given as an array of Points
// line = [Point, Point, ...]
CanvasRenderer.prototype.renderLine = function renderLine (line, properties, style, context)
{
    var segments = line;
    var style = style || {};
    var color = (style.color && (style.color[properties.kind] || style.color.default)) || [255, 0, 0];
    var size = (style.size && (style.size[properties.kind] || style.size.default)) || 1;
    var dash = (style.dash && (style.dash[properties.kind] || style.dash.default));

    var c = context;
    c.beginPath();
    c.strokeStyle = 'rgb(' + color.join(',') + ')';
    c.lineCap = 'round';
    c.lineWidth = size;
    if (c.setLineDash) {
        if (dash) {
            c.setLineDash(dash.map(function (d) { return d * size; }));
        }
        else {
            c.setLineDash([]);
        }
    }

    for (var r=0; r < segments.length - 1; r ++) {
        var segment = [
            segments[r].x, segments[r].y,
            segments[r + 1].x, segments[r + 1].y
        ];

        c.moveTo(segment[0], segment[1]);
        c.lineTo(segment[2], segment[3]);
    };

    c.closePath();
    c.stroke();
};

// Renders a polygon given as an array of Points
// polygon = [Point, Point, ...]
CanvasRenderer.prototype.renderPolygon = function renderPolygon (polygon, properties, style, context)
{
    var segments = polygon;
    var color = (style.color && (style.color[properties.kind] || style.color.default)) || [255, 0, 0];
    var border_color = style.border && ((style.border.color && (style.border.color[properties.kind] || style.border.color.default)) || [255, 0, 0]);
    var border_size = style.border && ((style.border.size && (style.border.size[properties.kind] || style.border.size.default)) || 1);
    var border_dash = style.border && (style.border.dash && (style.border.dash[properties.kind] || style.border.dash.default));

    var c = context;
    c.beginPath();
    c.fillStyle = 'rgb(' + color.join(',') + ')';
    c.moveTo(segments[0].x, segments[0].y);

    for (var r=1; r < segments.length; r ++) {
        c.lineTo(segments[r].x, segments[r].y);
    };

    c.closePath();
    c.fill();

    // Border
    if (style.border) {
        c.strokeStyle = 'rgb(' + border_color.join(',') + ')';
        c.lineCap = 'round';
        c.lineWidth = border_size;
        if (c.setLineDash) {
            if (border_dash) {
                c.setLineDash(border_dash.map(function (d) { return d * border_size; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

// Renders a point given as a Point object
CanvasRenderer.prototype.renderPoint = function renderPoint (point, properties, style, context)
{
    var color = (style.color && (style.color[properties.kind] || style.color.default)) || [255, 0, 0];
    var size = (style.size && (style.size[properties.kind] || style.size.default)) || 5;
    var border_color = style.border && ((style.border.color && (style.border.color[properties.kind] || style.border.color.default)) || [255, 0, 0]);
    var border_size = style.border && ((style.border.size && (style.border.size[properties.kind] || style.border.size.default)) || 1);
    var border_dash = style.border && (style.border.dash && (style.border.dash[properties.kind] || style.border.dash.default));

    var c = context;
    c.fillStyle = 'rgb(' + color.join(',') + ')';

    c.beginPath();
    c.arc(point.x, point.y, size, 0, 2 * Math.PI);
    c.closePath();
    c.fill();

    // Border
    if (style.border) {
        c.strokeStyle = 'rgb(' + border_color.join(',') + ')';
        c.lineWidth = border_size;
        if (c.setLineDash) {
            if (border_dash) {
                c.setLineDash(border_dash.map(function (d) { return d * border_size; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

var cutout_context = document.createElement('canvas').getContext('2d');
CanvasRenderer.prototype.renderGeometry = function renderGeometry (geometry, properties, style, context)
{
    var g, h, polys;

    if (geometry.type == 'LineString') {
        this.renderLine(geometry.pixels, properties, style, context);
    }
    else if (geometry.type == 'MultiLineString') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderLine(geometry.pixels[g], properties, style, context);
        }
    }
    else if (geometry.type == 'Polygon' || geometry.type == 'MultiPolygon') {
        if (geometry.type == 'Polygon') {
            polys = [geometry.pixels]; // treat Polygon as a degenerate MultiPolygon to avoid duplicating code
        }
        else {
            polys = geometry.pixels;
        }

        for (g=0; g < polys.length; g++) {
            // Polygons with holes:
            // Render to a separate canvas, using composite operations to cut holes out of polygon, then copy back to the main canvas
            if (polys[g].length > 1) {
                if (cutout_context.canvas.width != context.canvas.width || cutout_context.canvas.height != context.canvas.height) {
                    cutout_context.canvas.width = context.canvas.width;
                    cutout_context.canvas.height = context.canvas.height;
                }
                cutout_context.clearRect(0, 0, cutout_context.canvas.width, cutout_context.canvas.height);

                cutout_context.globalCompositeOperation = 'source-over';
                this.renderPolygon(polys[g][0], properties, style, cutout_context);

                cutout_context.globalCompositeOperation = 'destination-out';
                for (h=1; h < polys[g].length; h++) {
                    this.renderPolygon(polys[g][h], properties, style, cutout_context);
                }
                context.drawImage(cutout_context.canvas, 0, 0);

                // After compositing back to main canvas, draw outlines on holes
                if (style.border) {
                    for (h=1; h < polys[g].length; h++) {
                        this.renderLine(polys[g][h], properties, style.border, context);
                    }
                }
            }
            // Regular closed polygons
            else {
                this.renderPolygon(polys[g][0], properties, style, context);
            }
        }
    }
    else if (geometry.type == 'Point') {
        this.renderPoint(geometry.pixels, properties, style, context);
    }
    else if (geometry.type == 'MultiPoint') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderPoint(geometry.pixels[g], properties, style, context);
        }
    }
};

// Generates a random color not yet present in the provided hash of colors
CanvasRenderer.prototype.generateColor = function generateColor (color_map)
{
    var r, g, b, key;
    color_map = color_map || {};
    while (true) {
        r = ~~(Math.random() * 256);
        g = ~~(Math.random() * 256);
        b = ~~(Math.random() * 256);
        key = (r + (g << 8) + (b << 16) + (255 << 24)) >>> 0; // need unsigned right shift to convert to positive #

        if (color_map[key] === undefined) {
            color_map[key] = { color: [r, g, b] };
            break;
        }
    }
    return color_map[key];
};

// Render a GeoJSON tile onto canvas
CanvasRenderer.prototype.renderTile = function renderTile (tile, context)
{
    var renderer = this;

    // Selection rendering - off-screen canvas to render a collision map for feature selection
    var selection = { colors: {} };
    var selection_canvas = document.createElement('canvas');
    selection_canvas.width = Geo.tile_size.x;
    selection_canvas.height = Geo.tile_size.y;
    var selection_context = selection_canvas.getContext('2d');
    var selection_color;
    var selection_count = 0;

    // Render layers
    for (var t in renderer.layers) {
        var layer = renderer.layers[t];
        tile.layers[layer.name].features.forEach(function(feature) {
            // Scale mercator coords to tile pixels
            feature.geometry.pixels = this.scaleGeometryToPixels(feature.geometry, tile.min, tile.max);

            // Draw visible geometry
            if (layer.visible != false) {
                this.renderGeometry(feature.geometry, feature.properties, this.styles[layer.name], context);
            }

            // Draw mask for interactivity
            if (layer.selection == true && feature.properties.name != null && feature.properties.name != '') {
                selection_color = this.generateColor(selection.colors);
                selection_color.properties = feature.properties;
                selection_count++;
                this.renderGeometry(feature.geometry, feature.properties, { color: { default: selection_color.color }, size: this.styles[layer.name].size }, selection_context);
            }
            else {
                // If this geometry isn't interactive, mask it out so geometry under it doesn't appear to pop through
                this.renderGeometry(feature.geometry, feature.properties, { color: { default: [0, 0, 0] }, size: this.styles[layer.name].size }, selection_context);
            }

        }, this);
    }

    // Selection events
    var selection_info = this.selection_info;
    if (selection_count > 0) {
        this.tiles[tile.key].selection = selection;

        selection.pixels = new Uint32Array(selection_context.getImageData(0, 0, selection_canvas.width, selection_canvas.height).data.buffer);

        // TODO: fire events on selection to enable custom behavior
        context.canvas.onmousemove = function (event) {
            var hit = { x: event.offsetX, y: event.offsetY }; // layerX/Y
            var off = hit.y * Geo.tile_size.x + hit.x;
            var color = selection.pixels[off];
            var feature = selection.colors[color];
            if (feature != null) {
                context.canvas.style.cursor = 'crosshair';
                selection_info.style.left = (hit.x + 5) + 'px';
                selection_info.style.top = (hit.y + 5) + 'px';
                selection_info.innerHTML = '<span class="labelInner">' + feature.properties.name + /*' [' + feature.properties.kind + ']*/'</span>';
                selection_info.style.display = 'block';
                context.canvas.parentNode.appendChild(selection_info);
            }
            else {
                context.canvas.style.cursor = null;
                selection_info.style.display = 'none';
                if (selection_info.parentNode == context.canvas.parentNode) {
                    context.canvas.parentNode.removeChild(selection_info);
                }
            }
        };
    }
    else {
        context.canvas.onmousemove = function (event) {
            context.canvas.style.cursor = null;
            selection_info.style.display = 'none';
            if (selection_info.parentNode == context.canvas.parentNode) {
                context.canvas.parentNode.removeChild(selection_info);
            }
        };
    }
};
