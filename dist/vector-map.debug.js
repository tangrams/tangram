!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.Tangram=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
var Point = _dereq_('../point.js');
var Geo = _dereq_('../geo.js');
var VectorRenderer = _dereq_('../vector_renderer.js');

VectorRenderer.CanvasRenderer = CanvasRenderer;
CanvasRenderer.prototype = Object.create(VectorRenderer.prototype);

function CanvasRenderer (tile_source, layers, styles, options)
{
    VectorRenderer.call(this, 'CanvasRenderer', tile_source, layers, styles, options);

    // Selection info shown on hover
    this.selection_info = document.createElement('div');
    this.selection_info.setAttribute('class', 'label');
    this.selection_info.style.display = 'none';

    // For drawing multipolygons w/canvas composite operations
    this.cutout_context = document.createElement('canvas').getContext('2d');
}

// CanvasRenderer.prototype.addTile = function CanvasRendererAddTile (tile, tileDiv)
CanvasRenderer.prototype._tileWorkerCompleted = function (tile)
{
    var canvas = document.createElement('canvas');
    var context = canvas.getContext('2d');

    canvas.style.width = Geo.tile_size + 'px';
    canvas.style.width = Geo.tile_size + 'px';
    canvas.width = Math.round(Geo.tile_size * this.device_pixel_ratio);
    canvas.height = Math.round(Geo.tile_size * this.device_pixel_ratio);
    canvas.style.background = this.colorToString(this.styles.default);

    this.renderTile(tile, context);

    var tileDiv = document.querySelector("div[data-tile-key='" + tile.key + "']");
    tileDiv.appendChild(canvas);
};

// Scale a GeoJSON coordinate (2-element array) from [min, max] to tile pixels
// returns a copy of geometry.coordinates transformed into Points
CanvasRenderer.prototype.scaleGeometryToPixels = function scaleGeometryToPixels (geometry)
{
    var renderer = this;
    return Geo.transformGeometry(geometry, function (coordinates) {
        return Point(
            // Math.round((coordinates[0] - min.x) * Geo.tile_size / (max.x - min.x)), // rounding removes seams but causes aliasing
            // Math.round((coordinates[1] - min.y) * Geo.tile_size / (max.y - min.y))
            coordinates[0] * Geo.tile_size * renderer.device_pixel_ratio / VectorRenderer.tile_scale,
            coordinates[1] * Geo.tile_size * renderer.device_pixel_ratio / VectorRenderer.tile_scale * -1 // adjust for flipped y-coord
        );
    });
};

// Renders a line given as an array of Points
// line = [Point, Point, ...]
CanvasRenderer.prototype.renderLine = function renderLine (line, style, context)
{
    var segments = line;
    var color = style.color;
    var width = style.width;
    var dash = style.dash;

    var c = context;
    c.beginPath();
    c.strokeStyle = this.colorToString(color);
    c.lineCap = 'round';
    c.lineWidth = width;
    if (c.setLineDash) {
        if (dash) {
            c.setLineDash(dash.map(function (d) { return d * width; }));
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
CanvasRenderer.prototype.renderPolygon = function renderPolygon (polygon, style, context)
{
    var segments = polygon;
    var color = style.color;
    var width = style.width;
    var outline_color = style.outline && style.outline.color;
    var outline_width = style.outline && style.outline.width;
    var outline_dash = style.outline && style.outline.dash;

    var c = context;
    c.beginPath();
    c.fillStyle = this.colorToString(color);
    c.moveTo(segments[0].x, segments[0].y);

    for (var r=1; r < segments.length; r ++) {
        c.lineTo(segments[r].x, segments[r].y);
    };

    c.closePath();
    c.fill();

    // Outline
    if (outline_color && outline_width) {
        c.strokeStyle = this.colorToString(outline_color);
        c.lineCap = 'round';
        c.lineWidth = outline_width;
        if (c.setLineDash) {
            if (outline_dash) {
                c.setLineDash(outline_dash.map(function (d) { return d * outline_width; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

// Renders a point given as a Point object
CanvasRenderer.prototype.renderPoint = function renderPoint (point, style, context)
{
    var color = style.color;
    var size = style.size;
    var outline_color = style.outline && style.outline.color;
    var outline_width = style.outline && style.outline.width;
    var outline_dash = style.outline && style.outline.dash;

    var c = context;
    c.fillStyle = this.colorToString(color);

    c.beginPath();
    c.arc(point.x, point.y, size, 0, 2 * Math.PI);
    c.closePath();
    c.fill();

    // Outline
    if (outline_color && outline_width) {
        c.strokeStyle = this.colorToString(outline_color);
        c.lineWidth = outline_width;
        if (c.setLineDash) {
            if (outline_dash) {
                c.setLineDash(outline_dash.map(function (d) { return d * outline_width; }));
            }
            else {
                c.setLineDash([]);
            }
        }
        c.stroke();
    }
};

CanvasRenderer.prototype.renderFeature = function renderFeature (feature, style, context)
{
    var g, h, polys;
    var geometry = feature.geometry;

    if (geometry.type == 'LineString') {
        this.renderLine(geometry.pixels, style, context);
    }
    else if (geometry.type == 'MultiLineString') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderLine(geometry.pixels[g], style, context);
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
                if (this.cutout_context.canvas.width != context.canvas.width || this.cutout_context.canvas.height != context.canvas.height) {
                    this.cutout_context.canvas.width = context.canvas.width;
                    this.cutout_context.canvas.height = context.canvas.height;
                }
                this.cutout_context.clearRect(0, 0, this.cutout_context.canvas.width, this.cutout_context.canvas.height);

                this.cutout_context.globalCompositeOperation = 'source-over';
                this.renderPolygon(polys[g][0], style, this.cutout_context);

                this.cutout_context.globalCompositeOperation = 'destination-out';
                for (h=1; h < polys[g].length; h++) {
                    this.renderPolygon(polys[g][h], style, this.cutout_context);
                }
                context.drawImage(this.cutout_context.canvas, 0, 0);

                // After compositing back to main canvas, draw outlines on holes
                if (style.outline && style.outline.color) {
                    for (h=1; h < polys[g].length; h++) {
                        this.renderLine(polys[g][h], style.outline, context);
                    }
                }
            }
            // Regular closed polygons
            else {
                this.renderPolygon(polys[g][0], style, context);
            }
        }
    }
    else if (geometry.type == 'Point') {
        this.renderPoint(geometry.pixels, style, context);
    }
    else if (geometry.type == 'MultiPoint') {
        for (g=0; g < geometry.pixels.length; g++) {
            this.renderPoint(geometry.pixels[g], style, context);
        }
    }
};

// Render a GeoJSON tile onto canvas
CanvasRenderer.prototype.renderTile = function renderTile (tile, context)
{
    var renderer = this;
    var style;

    // Selection rendering - off-screen canvas to render a collision map for feature selection
    var selection = { colors: {} };
    var selection_canvas = document.createElement('canvas');
    selection_canvas.style.width = Geo.tile_size + 'px';
    selection_canvas.style.width = Geo.tile_size + 'px';
    selection_canvas.width = Math.round(Geo.tile_size * this.device_pixel_ratio);
    selection_canvas.height = Math.round(Geo.tile_size * this.device_pixel_ratio);

    var selection_context = selection_canvas.getContext('2d');
    var selection_color;
    var selection_count = 0;

    // Render layers
    for (var t in renderer.layers) {
        var layer = renderer.layers[t];
        tile.layers[layer.name].features.forEach(function(feature) {
            // Scale local coords to tile pixels
            feature.geometry.pixels = this.scaleGeometryToPixels(feature.geometry, renderer.tile_min, renderer.tile_max);
            style = VectorRenderer.parseStyleForFeature(feature, this.styles[layer.name], tile);

            // Draw visible geometry
            if (layer.visible != false) {
                this.renderFeature(feature, style, context);
            }

            // Draw mask for interactivity
            // TODO: move selection filter logic to stylesheet
            // TODO: only alter styles that are explicitly different, don't manually copy style values by property name
            if (layer.selection == true && feature.properties.name != null && feature.properties.name != '') {
                selection_color = this.generateColor(selection.colors);
                selection_color.properties = feature.properties;
                selection_count++;
                this.renderFeature(feature, { color: selection_color.color, width: style.width, size: style.size }, selection_context);
            }
            else {
                // If this geometry isn't interactive, mask it out so geometry under it doesn't appear to pop through
                this.renderFeature(feature, { color: [0, 0, 0], width: style.width, size: style.size }, selection_context);
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
            var off = (hit.y * renderer.device_pixel_ratio) * (Geo.tile_size * renderer.device_pixel_ratio) + (hit.x * renderer.device_pixel_ratio);
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

/* Color helpers */

// Transform color components in 0-1 range to html RGB string for canvas
CanvasRenderer.prototype.colorToString = function (color)
{
    return 'rgb(' + color.map(function(c) { return ~~(c * 256); }).join(',') + ')';
};

// Generates a random color not yet present in the provided hash of colors
CanvasRenderer.prototype.generateColor = function generateColor (color_map)
{
    var r, g, b, ir, ig, ib, key;
    color_map = color_map || {};
    while (true) {
        r = Math.random();
        g = Math.random();
        b = Math.random();

        ir = ~~(r * 256);
        ig = ~~(g * 256);
        ib = ~~(b * 256);
        key = (ir + (ig << 8) + (ib << 16) + (255 << 24)) >>> 0; // need unsigned right shift to convert to positive #

        if (color_map[key] === undefined) {
            color_map[key] = { color: [r, g, b] };
            break;
        }
    }
    return color_map[key];
};

if (module !== undefined) {
    module.exports = CanvasRenderer;
}

},{"../geo.js":2,"../point.js":10,"../vector_renderer.js":13}],2:[function(_dereq_,module,exports){
// Miscellaneous geo functions
var Point = _dereq_('./point.js');

var Geo = {};

// Projection constants
Geo.tile_size = 256;
Geo.half_circumference_meters = 20037508.342789244;
Geo.map_origin_meters = Point(-Geo.half_circumference_meters, Geo.half_circumference_meters);
Geo.min_zoom_meters_per_pixel = Geo.half_circumference_meters * 2 / Geo.tile_size; // min zoom draws world as 2 tiles wide
Geo.meters_per_pixel = [];
Geo.max_zoom = 20;
for (var z=0; z <= Geo.max_zoom; z++) {
    Geo.meters_per_pixel[z] = Geo.min_zoom_meters_per_pixel / Math.pow(2, z);
}

// Convert tile location to mercator meters - multiply by pixels per tile, then by meters per pixel, adjust for map origin
Geo.metersForTile = function (tile)
{
    return Point(
        (tile.x * Geo.tile_size * Geo.meters_per_pixel[tile.z]) + Geo.map_origin_meters.x,
        ((tile.y * Geo.tile_size * Geo.meters_per_pixel[tile.z]) * -1) + Geo.map_origin_meters.y
    );
};

// Convert mercator meters to lat-lng
Geo.metersToLatLng = function (meters)
{
    var c = Point.copy(meters);

    c.x /= Geo.half_circumference_meters;
    c.y /= Geo.half_circumference_meters;

    c.y = (2 * Math.atan(Math.exp(c.y * Math.PI)) - (Math.PI / 2)) / Math.PI;

    c.x *= 180;
    c.y *= 180;

    return c;
};

// Convert lat-lng to mercator meters
Geo.latLngToMeters = function(latlng)
{
    var c = Point.copy(latlng);

    // Latitude
    c.y = Math.log(Math.tan((c.y + 90) * Math.PI / 360)) / (Math.PI / 180);
    c.y = c.y * Geo.half_circumference_meters / 180;

    // Longitude
    c.x = c.x * Geo.half_circumference_meters / 180;

    return c;
};

// Run a transform function on each cooordinate in a GeoJSON geometry
Geo.transformGeometry = function (geometry, transform)
{
    if (geometry.type == 'Point') {
        return transform(geometry.coordinates);
    }
    else if (geometry.type == 'LineString' || geometry.type == 'MultiPoint') {
        return geometry.coordinates.map(transform);
    }
    else if (geometry.type == 'Polygon' || geometry.type == 'MultiLineString') {
        return geometry.coordinates.map(function (coordinates) {
            return coordinates.map(transform);
        });
    }
    else if (geometry.type == 'MultiPolygon') {
        return geometry.coordinates.map(function (polygon) {
            return polygon.map(function (coordinates) {
                return coordinates.map(transform);
            });
        });
    }
    // TODO: support GeometryCollection
    return {};
};

Geo.boxIntersect = function (b1, b2)
{
    return !(
        b2.sw.x > b1.ne.x ||
        b2.ne.x < b1.sw.x ||
        b2.sw.y > b1.ne.y ||
        b2.ne.y < b1.sw.y
    );
};

// Split the lines of a feature wherever two points are farther apart than a given tolerance
Geo.splitFeatureLines  = function (feature, tolerance) {
    var tolerance = tolerance || 0.001;
    var tolerance_sq = tolerance * tolerance;
    var geom = feature.geometry;
    var lines;

    if (geom.type == 'MultiLineString') {
        lines = geom.coordinates;
    }
    else if (geom.type =='LineString') {
        lines = [geom.coordinates];
    }
    else {
        return feature;
    }

    var split_lines = [];

    for (var s=0; s < lines.length; s++) {
        var seg = lines[s];
        var split_seg = [];
        var last_coord = null;
        var keep;

        for (var c=0; c < seg.length; c++) {
            var coord = seg[c];
            keep = true;

            if (last_coord != null) {
                var dist = (coord[0] - last_coord[0]) * (coord[0] - last_coord[0]) + (coord[1] - last_coord[1]) * (coord[1] - last_coord[1]);
                if (dist > tolerance_sq) {
                    // console.log("split lines at (" + coord[0] + ", " + coord[1] + "), " + Math.sqrt(dist) + " apart");
                    keep = false;
                }
            }

            if (keep == false) {
                split_lines.push(split_seg);
                split_seg = [];
            }
            split_seg.push(coord);

            last_coord = coord;
        }

        split_lines.push(split_seg);
        split_seg = [];
    }

    if (split_lines.length == 1) {
        geom.type = 'LineString';
        geom.coordinates = split_lines[0];
    }
    else {
        geom.type = 'MultiLineString';
        geom.coordinates = split_lines;
    }

    return feature;
};

if (module !== undefined) {
    module.exports = Geo;
}

},{"./point.js":10}],3:[function(_dereq_,module,exports){
// WebGL management and rendering functions
var GL = {};

// Setup a WebGL context
// If no canvas element is provided, one is created and added to the document body
GL.getContext = function getContext (canvas)
{
    var canvas = canvas;
    var fullscreen = false;
    if (canvas == null) {
        canvas = document.createElement('canvas');
        canvas.style.position = 'absolute';
        canvas.style.top = 0;
        canvas.style.left = 0;
        canvas.style.zIndex = -1;
        document.body.appendChild(canvas);
        fullscreen = true;
    }

    gl = canvas.getContext('experimental-webgl', { /*preserveDrawingBuffer: true*/ }); // preserveDrawingBuffer needed for gl.readPixels (could be used for feature selection)
    if (!gl) {
        alert("Couldn't create WebGL context. Your browser probably doesn't support WebGL or it's turned off?");
        throw "Couldn't create WebGL context";
    }

    GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
    if (fullscreen == true) {
        window.addEventListener('resize', function () {
            GL.resizeCanvas(gl, window.innerWidth, window.innerHeight);
        });
    }

    GL.VertexArrayObject.init(gl); // TODO: this pattern doesn't support multiple active GL contexts, should that even be supported?

    return gl;
};

GL.resizeCanvas = function (gl, width, height)
{
    var device_pixel_ratio = window.devicePixelRatio || 1;
    gl.canvas.style.width = width + 'px';
    gl.canvas.style.height = height + 'px';
    gl.canvas.width = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.canvas.height = Math.round(gl.canvas.style.width * device_pixel_ratio);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
};

// Compile & link a WebGL program from provided vertex and shader source elements
GL.createProgramFromElements = function GLcreateProgramFromElements (gl, vertex_shader_id, fragment_shader_id)
{
    var vertex_shader_source = document.getElementById(vertex_shader_id).textContent;
    var fragment_shader_source = document.getElementById(fragment_shader_id).textContent;
    var program = gl.createProgram();
    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and shader source URLs
// NOTE: loads via synchronous XHR for simplicity, could be made async
GL.createProgramFromURLs = function GLcreateProgramFromURLs (gl, vertex_shader_url, fragment_shader_url)
{
    var program = gl.createProgram();
    return GL.updateProgramFromURLs(gl, program, vertex_shader_url, fragment_shader_url);
};

GL.updateProgramFromURLs = function GLUpdateProgramFromURLs (gl, program, vertex_shader_url, fragment_shader_url)
{
    var vertex_shader_source, fragment_shader_source;
    var req = new XMLHttpRequest();

    req.onload = function () { vertex_shader_source = req.response; };
    req.open('GET', vertex_shader_url + '?' + (+new Date()), false /* async flag */);
    req.send();

    req.onload = function () { fragment_shader_source = req.response; };
    req.open('GET', fragment_shader_url + '?' + (+new Date()), false /* async flag */);
    req.send();

    return GL.updateProgram(gl, program, vertex_shader_source, fragment_shader_source);
};

// Compile & link a WebGL program from provided vertex and fragment shader sources
// update a program if one is passed in. Create one if not. Alert and don't update anything if the shaders don't compile.
GL.updateProgram = function GLupdateProgram (gl, program, vertex_shader_source, fragment_shader_source)
{
    try {
        var vertex_shader = GL.createShader(gl, vertex_shader_source, gl.VERTEX_SHADER);
        var fragment_shader = GL.createShader(gl, '#ifdef GL_ES\nprecision highp float;\n#endif\n\n' + fragment_shader_source, gl.FRAGMENT_SHADER);
    }
    catch(err)
    {
        alert(err);
        return program;
    }

    gl.useProgram(null);
    if (program != null) {
        var old_shaders = gl.getAttachedShaders(program);
        for(var i = 0; i < old_shaders.length; i++) {
            gl.detachShader(program, old_shaders[i]);
        }
    } else {
        program = gl.createProgram();
    }

    if (vertex_shader == null || fragment_shader == null) {
        return program;
    }

    gl.attachShader(program, vertex_shader);
    gl.attachShader(program, fragment_shader);

    gl.deleteShader(vertex_shader);
    gl.deleteShader(fragment_shader);

    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        var program_error =
            "WebGL program error:\n" +
            "VALIDATE_STATUS: " + gl.getProgramParameter(program, gl.VALIDATE_STATUS) + "\n" +
            "ERROR: " + gl.getError() + "\n\n" +
            "--- Vertex Shader ---\n" + vertex_shader_source + "\n\n" +
            "--- Fragment Shader ---\n" + fragment_shader_source;
        throw program_error;
    }

    return program;
};

// Compile a vertex or fragment shader from provided source
GL.createShader = function GLcreateShader (gl, source, type)
{
    var shader = gl.createShader(type);

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        var shader_error =
            "WebGL shader error:\n" +
            (type == gl.VERTEX_SHADER ? "VERTEX" : "FRAGMENT") + " SHADER:\n" +
            gl.getShaderInfoLog(shader);
        throw shader_error;
    }

    return shader;
};

// Thin GL program layer to cache uniform locations/values, do compile-time pre-processing (injecting #defines into shaders), etc.
GL.Program = function (gl, vertex_shader_source, fragment_shader_source, options)
{
    options = options || {};

    this.gl = gl;
    this.program = null;
    this.defines = options.defines || {}; // key/values inserted into shaders at compile-time
    this.uniforms = {}; // program locations of uniforms, set/updated at compile-time
    this.attribs = {}; // program locations of vertex attributes
    this.vertex_shader_source = vertex_shader_source;
    this.fragment_shader_source = fragment_shader_source;
    this.compile();
};

// Creates a program that will refresh from source URLs each time it is compiled
GL.Program.createProgramFromURLs = function (gl, vertex_shader_url, fragment_shader_url, options)
{
    var program = Object.create(GL.Program.prototype);

    program.vertex_shader_url = vertex_shader_url;
    program.fragment_shader_url = fragment_shader_url;

    program.updateVertexShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.vertex_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    program.updateFragmentShaderSource = function () {
        var source;
        var req = new XMLHttpRequest();
        req.onload = function () { source = req.response; };
        req.open('GET', this.fragment_shader_url + '?' + (+new Date()), false /* async flag */);
        req.send();
        return source;
    };

    GL.Program.call(program, gl, null, null, options);
    return program;
};

// Global defines applied to all programs (duplicate properties for a specific program will take precedence)
GL.Program.defines = {};

GL.Program.prototype.compile = function ()
{
    // Optionally update sources
    if (typeof this.updateVertexShaderSource == 'function') {
        this.vertex_shader_source = this.updateVertexShaderSource();
    }
    if (typeof this.updateFragmentShaderSource == 'function') {
        this.fragment_shader_source = this.updateFragmentShaderSource();
    }

    // Inject defines (global, then program-specific)
    var defines = {};
    for (var d in GL.Program.defines) {
        defines[d] = GL.Program.defines[d];
    }
    for (var d in this.defines) {
        defines[d] = this.defines[d];
    }

    var define_str = "";
    for (var d in defines) {
        if (defines[d] == false) {
            continue;
        }
        else if (typeof defines[d] == 'boolean' && defines[d] == true) {
            define_str += "#define " + d + "\n";
        }
        else {
            define_str += "#define " + d + " " + defines[d] + "\n";
        }
    }
    this.processed_vertex_shader_source = define_str + this.vertex_shader_source;
    this.processed_fragment_shader_source = define_str + this.fragment_shader_source;

    // Compile & set uniforms to cached values
    this.program = GL.updateProgram(this.gl, this.program, this.processed_vertex_shader_source, this.processed_fragment_shader_source);
    this.gl.useProgram(this.program);
    this.refreshUniforms();
    this.refreshAttributes();
};

// ex: program.uniform('3f', 'position', x, y, z);
GL.Program.prototype.uniform = function (method, name) // method-appropriate arguments follow
{
    var uniform = (this.uniforms[name] = this.uniforms[name] || {});
    uniform.name = name;
    uniform.location = uniform.location || this.gl.getUniformLocation(this.program, name);
    uniform.method = 'uniform' + method;
    uniform.values = Array.prototype.slice.call(arguments, 2);
    this.updateUniform(name);
};

// Set a single uniform
GL.Program.prototype.updateUniform = function (name)
{
    var uniform = this.uniforms[name];
    if (uniform == null || uniform.location == null) {
        return;
    }
    this.gl[uniform.method].apply(this.gl, [uniform.location].concat(uniform.values)); // call appropriate GL uniform method and pass through arguments
};

// Refresh uniform locations and set to last cached values
GL.Program.prototype.refreshUniforms = function ()
{
    for (var u in this.uniforms) {
        this.uniforms[u].location = this.gl.getUniformLocation(this.program, u);
        this.updateUniform(u);
    }
};

GL.Program.prototype.refreshAttributes = function ()
{
    // var len = this.gl.getProgramParameter(this.program, this.gl.ACTIVE_ATTRIBUTES);
    // for (var i=0; i < len; i++) {
    //     var a = this.gl.getActiveAttrib(this.program, i);
    //     console.log(a);
    // }
    this.attribs = {};
};

// Get the location of a vertex attribute
GL.Program.prototype.attribute = function (name)
{
    var attrib = (this.attribs[name] = this.attribs[name] || {});
    if (attrib.location != null) {
        return attrib;
    }

    attrib.name = name;
    attrib.location = this.gl.getAttribLocation(this.program, name);

    // var info = this.gl.getActiveAttrib(this.program, attrib.location);
    // attrib.type = info.type;
    // attrib.size = info.size;

    return attrib;
};

// Triangulation using libtess.js port of gluTesselator
// https://github.com/brendankenny/libtess.js
try {
    GL.tesselator = (function initTesselator() {
        // Called for each vertex of tesselator output
        function vertexCallback(data, polyVertArray) {
            polyVertArray.push([data[0], data[1]]);
        }

        // Called when segments intersect and must be split
        function combineCallback(coords, data, weight) {
            return coords;
        }

        // Called when a vertex starts or stops a boundary edge of a polygon
        function edgeCallback(flag) {
            // No-op callback to force simple triangle primitives (no triangle strips or fans).
            // See: http://www.glprogramming.com/red/chapter11.html
            // "Since edge flags make no sense in a triangle fan or triangle strip, if there is a callback
            // associated with GLU_TESS_EDGE_FLAG that enables edge flags, the GLU_TESS_BEGIN callback is
            // called only with GL_TRIANGLES."
            // console.log('GL.tesselator: edge flag: ' + flag);
        }

        var tesselator = new libtess.GluTesselator();
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_VERTEX_DATA, vertexCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_COMBINE, combineCallback);
        tesselator.gluTessCallback(libtess.gluEnum.GLU_TESS_EDGE_FLAG, edgeCallback);

        // Brendan Kenny:
        // libtess will take 3d verts and flatten to a plane for tesselation
        // since only doing 2d tesselation here, provide z=1 normal to skip
        // iterating over verts only to get the same answer.
        // comment out to test normal-generation code
        tesselator.gluTessNormal(0, 0, 1);

        return tesselator;
    })();

    GL.triangulatePolygon = function GLTriangulate (contours)
    {
        var triangleVerts = [];
        GL.tesselator.gluTessBeginPolygon(triangleVerts);

        for (var i = 0; i < contours.length; i++) {
            GL.tesselator.gluTessBeginContour();
            var contour = contours[i];
            for (var j = 0; j < contour.length; j ++) {
                var coords = [contour[j][0], contour[j][1], 0];
                GL.tesselator.gluTessVertex(coords, coords);
            }
            GL.tesselator.gluTessEndContour();
        }

        GL.tesselator.gluTessEndPolygon();
        return triangleVerts;
    };
}
catch (e) {
    // console.log("libtess not defined!");
    // skip if libtess not defined
}

// Add one or more vertices to an array (destined to be used as a GL buffer), 'striping' each vertex with constant data
// Used for adding values that are often constant per geometry or polygon, like colors, normals (for polys sitting flat on map), layer and material info, etc.
GL.addVertices = function (vertices, vertex_data, vertex_constants)
{
    if (vertices != null && vertices.length > 0) {
        // Array of vertices
        if (typeof vertices[0] == 'object') {
            for (var v=0; v < vertices.length; v++) {
                vertex_data.push.apply(vertex_data, vertices[v]);
                if (vertex_constants) {
                    vertex_data.push.apply(vertex_data, vertex_constants);
                }
            }
        }
        // Single vertex
        else {
            vertex_data.push.apply(vertex_data, vertices);
            if (vertex_constants) {
                vertex_data.push.apply(vertex_data, vertex_constants);
            }
        }
    }
    return vertex_data;
};

// Creates a Vertex Array Object if the extension is available, or falls back on standard attribute calls
GL.VertexArrayObject = {};
GL.VertexArrayObject.disabled = false; // set to true to disable VAOs even if extension is available
GL.VertexArrayObject.bound_vao = null; // currently bound VAO

GL.VertexArrayObject.init = function (gl)
{
    if (GL.VertexArrayObject.ext == null) {
        if (GL.VertexArrayObject.disabled != true) {
            GL.VertexArrayObject.ext = gl.getExtension("OES_vertex_array_object");
        }

        if (GL.VertexArrayObject.ext != null) {
            console.log("Vertex Array Object extension available");
        }
        else if (GL.VertexArrayObject.disabled != true) {
            console.log("Vertex Array Object extension NOT available");
        }
        else {
            console.log("Vertex Array Object extension force disabled");
        }
    }
};

GL.VertexArrayObject.create = function (setup, teardown)
{
    var vao = {};
    vao.setup = setup;
    vao.teardown = teardown;

    var ext = GL.VertexArrayObject.ext;
    if (ext != null) {
        vao._vao = ext.createVertexArrayOES();
        ext.bindVertexArrayOES(vao._vao);
        vao.setup();
        ext.bindVertexArrayOES(null);
        if (typeof vao.teardown == 'function') {
            vao.teardown();
        }
    }
    else {
        vao.setup();
    }

    return vao;
};

GL.VertexArrayObject.bind = function (vao)
{
    var ext = GL.VertexArrayObject.ext;
    if (vao != null) {
        if (ext != null && vao._vao != null) {
            ext.bindVertexArrayOES(vao._vao);
            GL.VertexArrayObject.bound_vao = vao;
        }
        else {
            vao.setup();
        }
    }
    else {
        if (ext != null) {
            ext.bindVertexArrayOES(null);
        }
        else if (GL.VertexArrayObject.bound_vao != null && typeof GL.VertexArrayObject.bound_vao.teardown == 'function') {
            GL.VertexArrayObject.bound_vao.teardown();
        }
        GL.VertexArrayObject.bound_vao = null;
    }
};

if (module !== undefined) {
    module.exports = GL;
}

},{}],4:[function(_dereq_,module,exports){
var Vector = _dereq_('../vector.js');
var Point = _dereq_('../point.js');
var GL = _dereq_('./gl.js');

var GLBuilders = {};

GLBuilders.debug = false;

// Tesselate a flat 2D polygon with fixed height and add to GL vertex buffer
GLBuilders.buildPolygons = function GLBuildersBuildPolygons (polygons, z, vertex_data, options)
{
    options = options || {};

    var vertex_constants = [z, 0, 0, 1]; // provided z, and upwards-facing normal
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var vertices = GL.triangulatePolygon(polygons[p]);
        GL.addVertices(vertices, vertex_data, vertex_constants);
    }

    return vertex_data;
};

// Tesselate and extrude a flat 2D polygon into a simple 3D model with fixed height and add to GL vertex buffer
GLBuilders.buildExtrudedPolygons = function GLBuildersBuildExtrudedPolygon (polygons, z, height, min_height, vertex_data, options)
{
    options = options || {};
    var min_z = z + (min_height || 0);
    var max_z = z + height;

    // Top
    GLBuilders.buildPolygons(polygons, max_z, vertex_data, { vertex_constants: options.vertex_constants });

    // Walls
    var wall_vertex_constants = [null, null, null]; // normals will be calculated below
    if (options.vertex_constants) {
        wall_vertex_constants.push.apply(wall_vertex_constants, options.vertex_constants);
    }

    var num_polygons = polygons.length;
    for (var p=0; p < num_polygons; p++) {
        var polygon = polygons[p];

        for (var q=0; q < polygon.length; q++) {
            var contour = polygon[q];

            for (var w=0; w < contour.length - 1; w++) {
                var wall_vertices = [];

                // Two triangles for the quad formed by each vertex pair, going from bottom to top height
                wall_vertices.push(
                    // Triangle
                    [contour[w+1][0], contour[w+1][1], max_z],
                    [contour[w+1][0], contour[w+1][1], min_z],
                    [contour[w][0], contour[w][1], min_z],
                    // Triangle
                    [contour[w][0], contour[w][1], min_z],
                    [contour[w][0], contour[w][1], max_z],
                    [contour[w+1][0], contour[w+1][1], max_z]
                );

                // Calc the normal of the wall from up vector and one segment of the wall triangles
                var normal = Vector.cross(
                    [0, 0, 1],
                    Vector.normalize([contour[w+1][0] - contour[w][0], contour[w+1][1] - contour[w][1], 0])
                );

                wall_vertex_constants[0] = normal[0];
                wall_vertex_constants[1] = normal[1];
                wall_vertex_constants[2] = normal[2];

                GL.addVertices(wall_vertices, vertex_data, wall_vertex_constants);
            }
        }
    }

    return vertex_data;
};

// Build tessellated triangles for a polyline
// Basically following the method described here for miter joints:
// http://artgrammer.blogspot.co.uk/2011/07/drawing-polylines-by-tessellation.html
GLBuilders.buildPolylines = function GLBuildersBuildPolylines (lines, z, width, vertex_data, options)
{
    options = options || {};
    options.closed_polygon = options.closed_polygon || false;
    options.remove_tile_edges = options.remove_tile_edges || false;

    var vertex_constants = [z, 0, 0, 1]; // provided z, and upwards-facing normal
    if (options.vertex_constants) {
        vertex_constants.push.apply(vertex_constants, options.vertex_constants);
    }

    // Line center - debugging
    if (GLBuilders.debug && options.vertex_lines) {
        var num_lines = lines.length;
        for (var ln=0; ln < num_lines; ln++) {
            var line = lines[ln];

            for (var p=0; p < line.length - 1; p++) {
                // Point A to B
                var pa = line[p];
                var pb = line[p+1];

                options.vertex_lines.push(
                    pa[0], pa[1], z + 0.001, 0, 0, 1, 1.0, 0, 0,
                    pb[0], pb[1], z + 0.001, 0, 0, 1, 1.0, 0, 0
                );
            }
        };
    }

    // Build triangles
    var vertices = [];
    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];
        // Multiple line segments
        if (line.length > 2) {
            // Build anchors for line segments:
            // anchors are 3 points, each connecting 2 line segments that share a joint (start point, joint point, end point)

            var anchors = [];

            if (line.length > 3) {
                // Find midpoints of each line segment
                // For closed polygons, calculate all midpoints since segments will wrap around to first midpoint
                var mid = [];
                var p, pmax;
                if (options.closed_polygon == true) {
                    p = 0; // start on first point
                    pmax = line.length - 1;
                }
                // For open polygons, skip first midpoint and use line start instead
                else {
                    p = 1; // start on second point
                    pmax = line.length - 2;
                    mid.push(line[0]); // use line start instead of first midpoint
                }

                // Calc midpoints
                for (; p < pmax; p++) {
                    var pa = line[p];
                    var pb = line[p+1];
                    mid.push([(pa[0] + pb[0]) / 2, (pa[1] + pb[1]) / 2]);
                }

                // Same closed/open polygon logic as above: keep last midpoint for closed, skip for open
                var mmax;
                if (options.closed_polygon == true) {
                    mmax = mid.length;
                }
                else {
                    mid.push(line[line.length-1]); // use line end instead of last midpoint
                    mmax = mid.length - 1;
                }

                // Make anchors by connecting midpoints to line joints
                for (p=0; p < mmax; p++)  {
                    anchors.push([mid[p], line[(p+1) % line.length], mid[(p+1) % mid.length]]);
                }
            }
            else {
                // Degenerate case, a 3-point line is just a single anchor
                anchors = [[line[0], line[1], line[2]]];
            }

            for (var p=0; p < anchors.length; p++) {
                if (!options.remove_tile_edges) {
                    buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    // buildSegment(anchors[p][0], anchors[p][1]); // use these to draw extruded segments w/o join, for debugging
                    // buildSegment(anchors[p][1], anchors[p][2]);
                }
                else {
                    var edge1 = GLBuilders.isOnTileEdge(anchors[p][0], anchors[p][1]);
                    var edge2 = GLBuilders.isOnTileEdge(anchors[p][1], anchors[p][2]);
                    if (!edge1 && !edge2) {
                        buildAnchor(anchors[p][0], anchors[p][1], anchors[p][2]);
                    }
                    else if (!edge1) {
                        buildSegment(anchors[p][0], anchors[p][1]);
                    }
                    else if (!edge2) {
                        buildSegment(anchors[p][1], anchors[p][2]);
                    }
                }
            }
        }
        // Single 2-point segment
        else if (line.length == 2) {
            buildSegment(line[0], line[1]); // TODO: replace buildSegment with a degenerate form of buildAnchor? buildSegment is still useful for debugging
        }
    };

    GL.addVertices(vertices, vertex_data, vertex_constants);

    // Build triangles for a single line segment, extruded by the provided width
    function buildSegment (pa, pb) {
        var slope = Vector.normalize([(pb[1] - pa[1]) * -1, pb[0] - pa[0]]);

        var pa_outer = [pa[0] + slope[0] * width/2, pa[1] + slope[1] * width/2];
        var pa_inner = [pa[0] - slope[0] * width/2, pa[1] - slope[1] * width/2];

        var pb_outer = [pb[0] + slope[0] * width/2, pb[1] + slope[1] * width/2];
        var pb_inner = [pb[0] - slope[0] * width/2, pb[1] - slope[1] * width/2];

        vertices.push(
            pb_inner, pb_outer, pa_inner,
            pa_inner, pb_outer, pa_outer
        );
    }

    // Build triangles for a 3-point 'anchor' shape, consisting of two line segments with a joint
    // TODO: move these functions out of closures?
    function buildAnchor (pa, joint, pb) {
        // Inner and outer line segments for [pa, joint] and [joint, pb]
        var pa_slope = Vector.normalize([(joint[1] - pa[1]) * -1, joint[0] - pa[0]]);
        var pa_outer = [
            [pa[0] + pa_slope[0] * width/2, pa[1] + pa_slope[1] * width/2],
            [joint[0] + pa_slope[0] * width/2, joint[1] + pa_slope[1] * width/2]
        ];
        var pa_inner = [
            [pa[0] - pa_slope[0] * width/2, pa[1] - pa_slope[1] * width/2],
            [joint[0] - pa_slope[0] * width/2, joint[1] - pa_slope[1] * width/2]
        ];

        var pb_slope = Vector.normalize([(pb[1] - joint[1]) * -1, pb[0] - joint[0]]);
        var pb_outer = [
            [joint[0] + pb_slope[0] * width/2, joint[1] + pb_slope[1] * width/2],
            [pb[0] + pb_slope[0] * width/2, pb[1] + pb_slope[1] * width/2]
        ];
        var pb_inner = [
            [joint[0] - pb_slope[0] * width/2, joint[1] - pb_slope[1] * width/2],
            [pb[0] - pb_slope[0] * width/2, pb[1] - pb_slope[1] * width/2]
        ];

        // Miter join - solve for the intersection between the two outer line segments
        var intersection = Vector.lineIntersection(pa_outer[0], pa_outer[1], pb_outer[0], pb_outer[1]);
        var line_debug = null;
        if (intersection != null) {
            var intersect_outer = intersection;

            // Cap the intersection point to a reasonable distance (as join angle becomes sharper, miter joint distance would approach infinity)
            var len_sq = Vector.lengthSq([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
            var miter_len_max = 3; // multiplier on line width for max distance miter join can be from joint
            if (len_sq > (width * width * miter_len_max * miter_len_max)) {
                line_debug = 'distance';
                intersect_outer = Vector.normalize([intersect_outer[0] - joint[0], intersect_outer[1] - joint[1]]);
                intersect_outer = [
                    joint[0] + intersect_outer[0] * miter_len_max,
                    joint[1] + intersect_outer[1] * miter_len_max
                ]
            }

            var intersect_inner = [
                (joint[0] - intersect_outer[0]) + joint[0],
                (joint[1] - intersect_outer[1]) + joint[1]
            ];

            vertices.push(
                intersect_inner, intersect_outer, pa_inner[0],
                pa_inner[0], intersect_outer, pa_outer[0],

                pb_inner[1], pb_outer[1], intersect_inner,
                intersect_inner, pb_outer[1], intersect_outer
            );
        }
        else {
            // Line segments are parallel, use the first outer line segment as join instead
            line_debug = 'parallel';
            pa_inner[1] = pb_inner[0];
            pa_outer[1] = pb_outer[0];

            vertices.push(
                pa_inner[1], pa_outer[1], pa_inner[0],
                pa_inner[0], pa_outer[1], pa_outer[0],

                pb_inner[1], pb_outer[1], pb_inner[0],
                pb_inner[0], pb_outer[1], pb_outer[0]
            );
        }

        // Extruded inner/outer edges - debugging
        if (GLBuilders.debug && options.vertex_lines) {
            options.vertex_lines.push(
                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[0][0], pa_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[0][0], pa_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pa_inner[1][0], pa_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pa_outer[1][0], pa_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[0][0], pb_inner[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[0][0], pb_outer[0][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,

                pb_inner[1][0], pb_inner[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0,
                pb_outer[1][0], pb_outer[1][1], z + 0.001, 0, 0, 1, 0, 1.0, 0
            );
        }

        if (GLBuilders.debug && line_debug && options.vertex_lines) {
            var dcolor;
            if (line_debug == 'parallel') {
                // console.log("!!! lines are parallel !!!");
                dcolor = [0, 1, 0];
            }
            else if (line_debug == 'distance') {
                // console.log("!!! miter intersection point exceeded allowed distance from joint !!!");
                dcolor = [1, 0, 0];
            }
            // console.log('OSM id: ' + feature.id); // TODO: if this function is moved out of a closure, this feature debug info won't be available
            // console.log([pa, joint, pb]);
            // console.log(feature);
            options.vertex_lines.push(
                pa[0], pa[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                joint[0], joint[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2],
                pb[0], pb[1], z + 0.002,
                0, 0, 1, dcolor[0], dcolor[1], dcolor[2]
            );

            var num_lines = lines.length;
            for (var ln=0; ln < num_lines; ln++) {
                var line2 = lines[ln];

                for (var p=0; p < line2.length - 1; p++) {
                    // Point A to B
                    var pa = line2[p];
                    var pb = line2[p+1];

                    options.vertex_lines.push(
                        pa[0], pa[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0,
                        pb[0], pb[1], z + 0.0005,
                        0, 0, 1, 0, 0, 1.0
                    );
                }
            };
        }
    }

    return vertex_data;
};

// Build a quad centered on a point
GLBuilders.buildQuads = function GLBuildersBuildQuads (points, width, height, addGeometry, options)
{
    var options = options || {};

    var num_points = points.length;
    for (var p=0; p < num_points; p++) {
        var point = points[p];

        var positions = [
            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],

            [point[0] - width/2, point[1] - height/2],
            [point[0] + width/2, point[1] + height/2],
            [point[0] - width/2, point[1] + height/2],
        ];

        if (options.texcoords == true) {
            var texcoords = [
                [-1, -1],
                [1, -1],
                [1, 1],

                [-1, -1],
                [1, 1],
                [-1, 1]
            ];
        }

        var vertices = {
            positions: positions,
            texcoords: (options.texcoords && texcoords)
        };
        addGeometry(vertices);
    }
};

// Build native GL lines for a polyline
GLBuilders.buildLines = function GLBuildersBuildLines (lines, feature, layer, style, tile, z, vertex_data, options)
{
    options = options || {};

    var color = style.color;
    var width = style.width;

    var num_lines = lines.length;
    for (var ln=0; ln < num_lines; ln++) {
        var line = lines[ln];

        for (var p=0; p < line.length - 1; p++) {
            // Point A to B
            var pa = line[p];
            var pb = line[p+1];

            vertex_data.push(
                // Point A
                pa[0], pa[1], z,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2],
                // Point B
                pb[0], pb[1], z,
                0, 0, 1, // flat surfaces point straight up
                color[0], color[1], color[2]
            );
        }
    };

    return vertex_data;
};

/* Utility functions */

// Tests if a line segment (from point A to B) is nearly coincident with the edge of a tile
GLBuilders.isOnTileEdge = function (pa, pb, options)
{
    options = options || {};

    var tolerance_function = options.tolerance_function || GLBuilders.valuesWithinTolerance;
    var tolerance = options.tolerance || 1; // tweak this adjust if catching too few/many line segments near tile edges
    var tile_min = GLBuilders.tile_bounds[0];
    var tile_max = GLBuilders.tile_bounds[1];
    var edge = null;

    if (tolerance_function(pa[0], tile_min.x, tolerance) && tolerance_function(pb[0], tile_min.x, tolerance)) {
        edge = 'left';
    }
    else if (tolerance_function(pa[0], tile_max.x, tolerance) && tolerance_function(pb[0], tile_max.x, tolerance)) {
        edge = 'right';
    }
    else if (tolerance_function(pa[1], tile_min.y, tolerance) && tolerance_function(pb[1], tile_min.y, tolerance)) {
        edge = 'top';
    }
    else if (tolerance_function(pa[1], tile_max.y, tolerance) && tolerance_function(pb[1], tile_max.y, tolerance)) {
        edge = 'bottom';
    }
    return edge;
};

GLBuilders.setTileScale = function (scale)
{
    GLBuilders.tile_bounds = [
        Point(0, 0),
        Point(scale, -scale) // TODO: correct for flipped y-axis?
    ];
};

GLBuilders.valuesWithinTolerance = function (a, b, tolerance)
{
    tolerance = tolerance || 1;
    return (Math.abs(a - b) < tolerance);
};

// Build a zigzag line pattern for testing joins and caps
GLBuilders.buildZigzagLineTestPattern = function ()
{
    var min = Point(0, 0); // tile.min;
    var max = Point(4096, 4096); // tile.max;
    var g = {
        id: 123,
        geometry: {
            type: 'LineString',
            coordinates: [
                [min.x * 0.75 + max.x * 0.25, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.75 + max.y * 0.25],
                [min.x * 0.25 + max.x * 0.75, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.4 + max.x * 0.6, min.y * 0.5 + max.y * 0.5],
                [min.x * 0.5 + max.x * 0.5, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.25 + max.y * 0.75],
                [min.x * 0.75 + max.x * 0.25, min.y * 0.4 + max.y * 0.6]
            ]
        },
        properties: {
            kind: 'debug'
        }
    };
    // console.log(g.geometry.coordinates);
    return g;
};

if (module !== undefined) {
    module.exports = GLBuilders;
}

},{"../point.js":10,"../vector.js":12,"./gl.js":3}],5:[function(_dereq_,module,exports){
/*** Manage rendering for primitives ***/
var GL = _dereq_('./gl.js');

// Attribs are an array, in layout order, of: name, size, type, normalized
// ex: { name: 'position', size: 3, type: gl.FLOAT, normalized: false }
function GLGeometry (gl, gl_program, vertex_data, attribs, options)
{
    options = options || {};

    this.gl = gl;
    this.gl_program = gl_program;
    this.attribs = attribs;
    this.vertex_data = vertex_data; // Float32Array
    this.buffer = this.gl.createBuffer();
    this.draw_mode = options.draw_mode || this.gl.TRIANGLES;
    this.data_usage = options.data_usage || this.gl.STATIC_DRAW;

    // Calc vertex stride
    this.vertex_stride = 0;
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];

        attrib.location = this.gl_program.attribute(attrib.name).location;
        attrib.byte_size = attrib.size;

        switch (attrib.type) {
            case this.gl.FLOAT:
            case this.gl.INT:
            case this.gl.UNSIGNED_INT:
                attrib.byte_size *= 4;
                break;
            case this.gl.SHORT:
            case this.gl.UNSIGNED_SHORT:
                attrib.byte_size *= 2;
                break;
        }

        attrib.offset = this.vertex_stride;
        this.vertex_stride += attrib.byte_size;
    }

    this.vertex_count = this.vertex_data.byteLength / this.vertex_stride;

    this.vao = GL.VertexArrayObject.create(function() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.setup();
    }.bind(this));

    this.gl.bufferData(this.gl.ARRAY_BUFFER, this.vertex_data, this.data_usage);
}

GLGeometry.prototype.setup = function ()
{
    for (var a=0; a < this.attribs.length; a++) {
        var attrib = this.attribs[a];
        this.gl.enableVertexAttribArray(attrib.location);
        this.gl.vertexAttribPointer(attrib.location, attrib.size, attrib.type, attrib.normalized, this.vertex_stride, attrib.offset);
    }
};

GLGeometry.prototype.render = function ()
{
    this.gl.useProgram(this.gl_program.program);
    GL.VertexArrayObject.bind(this.vao);

    if (typeof this._render == 'function') {
        this._render();
    }

    // TODO: support element array mode
    this.gl.drawArrays(this.draw_mode, 0, this.vertex_count);
    GL.VertexArrayObject.bind(null);
};

GLGeometry.prototype.destroy = function ()
{
    console.log("GLGeometry.destroy: delete buffer of size " + this.vertex_data.byteLength);
    this.gl.deleteBuffer(this.buffer);
    delete this.vertex_data;
};

// Draws a set of triangles
GLTriangles.prototype = Object.create(GLGeometry.prototype);

function GLTriangles (gl, gl_program, vertex_data)
{
    GLGeometry.call(this, gl, gl_program, vertex_data, [
        { name: 'position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'normal', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'color', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'layer', size: 1, type: gl.FLOAT, normalized: false }
    ]);
    this.geometry_count = this.vertex_count / 3;
}

// Draws a set of points as quads, intended to be rendered as distance fields
GLPolyPoints.prototype = Object.create(GLGeometry.prototype);

function GLPolyPoints (gl, gl_program, vertex_data)
{
    GLGeometry.call(this, gl, gl_program, vertex_data, [
        { name: 'position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'texcoord', size: 2, type: gl.FLOAT, normalized: false },
        { name: 'color', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'layer', size: 1, type: gl.FLOAT, normalized: false }
    ]);
    this.geometry_count = this.vertex_count / 3;
}

// Draws a set of lines
// Shares all characteristics with triangles except for draw mode
GLLines.prototype = Object.create(GLTriangles.prototype);

function GLLines (gl, gl_program, vertex_data, options)
{
    options = options || {};
    GLTriangles.call(this, gl, program, vertex_data);
    this.draw_mode = this.gl.LINES;
    this.line_width = options.line_width || 2;
    this.geometry_count = this.vertex_count / 2;
}

GLLines.prototype._render = function ()
{
    this.gl.lineWidth(this.line_width);
    if (typeof GLTriangles.prototype._render == 'function') {
        GLTriangles.prototype._render.call(this);
    }
};

if (module !== undefined) {
    module.exports = {
        GLGeometry: GLGeometry,
        GLTriangles: GLTriangles,
        GLPolyPoints: GLPolyPoints,
        GLLines: GLLines
    };
}

},{"./gl.js":3}],6:[function(_dereq_,module,exports){
var Point = _dereq_('../point.js');
var Geo = _dereq_('../geo.js');
var VectorRenderer = _dereq_('../vector_renderer.js');

var GL = _dereq_('./gl.js');
var GLBuilders = _dereq_('./gl_builders.js');
var GLGeometry = _dereq_('./gl_geom.js').GLGeometry;
var GLTriangles = _dereq_('./gl_geom.js').GLTriangles;
var GLPolyPoints = _dereq_('./gl_geom.js').GLPolyPoints;
var GLLines = _dereq_('./gl_geom.js').GLLines;

VectorRenderer.GLRenderer = GLRenderer;
GLRenderer.prototype = Object.create(VectorRenderer.prototype);
GLRenderer.debug = false;

GLRenderer.shader_sources = _dereq_('./gl_shaders.js');

function GLRenderer (tile_source, layers, styles, options)
{
    var options = options || {};

    VectorRenderer.call(this, 'GLRenderer', tile_source, layers, styles, options);

    GLBuilders.setTileScale(VectorRenderer.tile_scale);
    GL.Program.defines.TILE_SCALE = VectorRenderer.tile_scale + '.0';

    this.container = options.container;
    this.continuous_animation = false; // request redraw every frame
}

GLRenderer.prototype._init = function GLRendererInit ()
{
    this.container = this.container || document.body;
    this.canvas = document.createElement('canvas');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = 0;
    this.canvas.style.left = 0;
    this.canvas.style.zIndex = -1;
    this.container.appendChild(this.canvas);

    this.gl = GL.getContext(this.canvas);

    var renderer = this;

    this.render_modes = {
        'polygons': {
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['polygon_vertex'], GLRenderer.shader_sources['polygon_fragment']),
            makeGLGeometry: function (vertex_data) {
                return new GLTriangles(renderer.gl, this.gl_program, vertex_data);
            }
        },
        'polygons_noise': {
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['polygon_vertex'], GLRenderer.shader_sources['polygon_fragment'], { defines: { 'EFFECT_NOISE_TEXTURE': true, 'EFFECT_NOISE_ANIMATABLE': true } }),
            makeGLGeometry: function (vertex_data) {
                return new GLTriangles(renderer.gl, this.gl_program, vertex_data);
            }
        },
        'points': {
            // TODO: replace relative shader paths with a better auto-pathing system
            // gl_program: new GL.Program.createProgramFromURLs(this.gl, VectorRenderer.library_base_url + '../shaders/point_vertex.glsl', VectorRenderer.library_base_url + '../shaders/point_fragment.glsl', { defines: { 'EFFECT_SCREEN_COLOR': true } }),
            gl_program: new GL.Program(this.gl, GLRenderer.shader_sources['point_vertex'], GLRenderer.shader_sources['point_fragment'], { defines: { 'EFFECT_SCREEN_COLOR': true } }),
            makeGLGeometry: function (vertex_data) {
                return new GLPolyPoints(renderer.gl, this.gl_program, vertex_data);
            }
        }
    };

    this.resizeMap(this.container.clientWidth, this.container.clientHeight);

    // this.zoom_step = 0.02; // for fractional zoom user adjustment
    this.start_time = +new Date();
    this.last_render_count = null;
    this.initInputHandlers();
};

// Determine a Z value that will stack features in a "painter's algorithm" style, first by layer, then by draw order within layer
// Features are assumed to be already sorted in desired draw order by the layer pre-processor
GLRenderer.calculateZ = function (layer, tile, layer_offset, feature_offset)
{
    // var layer_offset = layer_offset || 0;
    // var feature_offset = feature_offset || 0;
    var z = 0; // TODO: made this a no-op until revisiting where it should live - one-time calc here, in vertex layout/shader, etc.
    return z;
};

// Process geometry for tile - called by web worker
GLRenderer.addTile = function (tile, layers, styles)
{
    var layer, style, feature, z, mode;
    var vertex_data = {};

    // Join line test pattern
    // if (GLRenderer.debug) {
    //     tile.layers['roads'].features.push(GLRenderer.buildZigzagLineTestPattern());
    // }

    // Build raw geometry arrays
    tile.debug.features = 0;
    for (var ln=0; ln < layers.length; ln++) {
        layer = layers[ln];

        // Skip layers with no styles defined
        if (styles[layer.name] == null) {
            continue;
        }

        if (tile.layers[layer.name] != null) {
            var num_features = tile.layers[layer.name].features.length;

            // Rendering reverse order aka top to bottom
            for (var f = num_features-1; f >= 0; f--) {
                feature = tile.layers[layer.name].features[f];
                z = GLRenderer.calculateZ(layer, tile);
                style = VectorRenderer.parseStyleForFeature(feature, styles[layer.name], tile);

                // Skip feature?
                if (style == null) {
                    continue;
                }

                // First feature in this render mode?
                mode = style.render_mode;
                if (vertex_data[mode] == null) {
                    vertex_data[mode] = [];
                }

                // DEBUGGING line/tile intersections returned as points
                // #mapzen,40.74733011589617,-73.97535145282747,17
                // if (feature.id == 157964813 && feature.geometry.type == 'Point') {
                //     style.color = [1, 1, 0];
                //     style.size = Style.width.pixels(10, tile);
                // }

                var vertex_constants = [
                    style.color[0], style.color[1], style.color[2],
                    ln
                    // TODO: add material info, etc.
                ];

                if (style.outline.color) {
                    var outline_vertex_constants = [
                        style.outline.color[0], style.outline.color[1], style.outline.color[2],
                        ln - 0.5 // outlines sit between layers, underneath current layer but above the one below
                    ];
                }

                var points = null,
                    lines = null,
                    polygons = null;

                if (feature.geometry.type == 'Polygon') {
                    polygons = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPolygon') {
                    polygons = feature.geometry.coordinates;
                }
                else if (feature.geometry.type == 'LineString') {
                    lines = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiLineString') {
                    lines = feature.geometry.coordinates;
                }
                else if (feature.geometry.type == 'Point') {
                    points = [feature.geometry.coordinates];
                }
                else if (feature.geometry.type == 'MultiPoint') {
                    points = feature.geometry.coordinates;
                }

                if (polygons != null) {
                    // Extruded polygons (e.g. 3D buildings)
                    if (style.extrude && style.height) {
                        GLBuilders.buildExtrudedPolygons(polygons, z, style.height, style.min_height, vertex_data[mode], { vertex_constants: vertex_constants });
                    }
                    // Regular polygons
                    else {
                        GLBuilders.buildPolygons(polygons, z, vertex_data[mode], { vertex_constants: vertex_constants });

                        // var polygon_vertex_constants = [z, 0, 0, 1].concat(vertex_constants); // upwards-facing normal
                        // GLBuilders.buildPolygons2(
                        //     polygons,
                        //     function (vertices) {
                        //         GL.addVertices(vertices.positions, vertex_data[mode], polygon_vertex_constants);
                        //     }
                        // );
                    }

                    // Polygon outlines
                    if (style.outline.color && style.outline.width) {
                        for (var mpc=0; mpc < polygons.length; mpc++) {
                            GLBuilders.buildPolylines(polygons[mpc], GLRenderer.calculateZ(layer, tile, -0.5), style.outline.width, vertex_data[mode], { closed_polygon: true, remove_tile_edges: true, vertex_constants: outline_vertex_constants });
                        }
                    }
                }

                if (lines != null) {
                    GLBuilders.buildPolylines(lines, z, style.width, vertex_data[mode], { vertex_constants: vertex_constants });

                    // Line outlines
                    if (style.outline.color && style.outline.width) {
                        GLBuilders.buildPolylines(lines, GLRenderer.calculateZ(layer, tile, -0.5), style.width + 2 * style.outline.width, vertex_data[mode], { vertex_constants: outline_vertex_constants });
                    }
                }

                if (points != null) {
                    // console.log(JSON.stringify(feature));
                    // NOTE: adding to z to experiment with "floating" POIs
                    var point_vertex_constants = [z + 1, 0, 0, 1].concat(vertex_constants); // upwards-facing normal
                    GLBuilders.buildQuads(
                        points, style.size * 2, style.size * 2,
                        function (vertices) {
                            var vs = vertices.positions;

                            // Alternate vertex layout for 'points' shader
                            if (mode == 'points') {
                                point_vertex_constants = vertex_constants;

                                for (var v in vertices.positions) {
                                    vs[v] = vertices.positions[v].concat(z+ 1, vertices.texcoords[v]);
                                }
                            }

                            // GL.addVertices(vertices.positions, vertex_data[mode], point_vertex_constants);
                            GL.addVertices(vs, vertex_data[mode], point_vertex_constants);
                        },
                        { texcoords: (mode == 'points') }
                    );
                }

                tile.debug.features++;
            }
        }
    }

    tile.vertex_data = {};
    for (var s in vertex_data) {
        tile.vertex_data[s] = new Float32Array(vertex_data[s]);
    }

    return tile;
};

// Called on main thread when a web worker completes processing for a single tile
GLRenderer.prototype._tileWorkerCompleted = function (tile)
{
    var vertex_data = tile.vertex_data;

    // Create GL geometry objects
    tile.gl_geometry = {};

    for (var s in vertex_data) {
        tile.gl_geometry[s] = this.render_modes[s].makeGLGeometry(vertex_data[s]);
    }

    tile.debug.geometries = 0;
    tile.debug.buffer_size = 0;
    for (var p in tile.gl_geometry) {
        tile.debug.geometries += tile.gl_geometry[p].geometry_count;
        tile.debug.buffer_size += tile.gl_geometry[p].vertex_data.byteLength;
    }

    tile.debug.geom_ratio = (tile.debug.geometries / tile.debug.features).toFixed(1);

    // Selection - experimental/future
    // var gl_renderer = this;
    // var pixel = new Uint8Array(4);
    // tileDiv.onmousemove = function (event) {
    //     // console.log(event.offsetX + ', ' + event.offsetY + ' | ' + parseInt(tileDiv.style.left) + ', ' + parseInt
    //     var p = Point(
    //         event.offsetX + parseInt(tileDiv.style.left),
    //         event.offsetY + parseInt(tileDiv.style.top)
    //     );
    //     gl_renderer.gl.readPixels(p.x, p.y, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixel);
    //     console.log(p.x + ', ' + p.y + ': (' + pixel[0] + ', ' + pixel[1] + ', ' + pixel[2] + ', ' + pixel[3] + ')')
    // };

    delete tile.vertex_data; // TODO: might want to preserve this for rebuilding geometries when styles/etc. change?
};

GLRenderer.prototype.removeTile = function GLRendererRemoveTile (key)
{
    if (this.map_zooming == true) {
        return; // short circuit tile removal, GL renderer will sweep out tiles by zoom level when zoom ends
    }

    var tile = this.tiles[key];

    if (tile != null && tile.gl_geometry != null) {
        for (var p in tile.gl_geometry) {
            tile.gl_geometry[p].destroy();
        }
        tile.gl_geometry = null;
    }
    VectorRenderer.prototype.removeTile.apply(this, arguments);
};

GLRenderer.prototype.preserve_tiles_within_zoom = 2;
GLRenderer.prototype.setZoom = function (zoom)
{
    // Schedule GL tiles for removal on zoom
    console.log("renderer.map_last_zoom: " + this.map_last_zoom);

    this.map_zooming = false;
    this.zoom = zoom;
    var below = this.zoom;
    var above = this.zoom;
    if (Math.abs(this.zoom - this.map_last_zoom) <= this.preserve_tiles_within_zoom) {
        if (this.zoom > this.map_last_zoom) {
            below = this.zoom - this.preserve_tiles_within_zoom;
        }
        else {
            above = this.zoom + this.preserve_tiles_within_zoom;
        }
    }
    this.removeTilesOutsideZoomRange(below, above);
    this.map_last_zoom = this.zoom;
    this.dirty = true; // calling because this is a full override of the parent class
};

GLRenderer.prototype.removeTilesOutsideZoomRange = function (below, above)
{
    below = Math.min(below, this.tile_source.max_zoom || below);
    above = Math.min(above, this.tile_source.max_zoom || above);

    console.log("removeTilesOutsideZoomRange [" + below + ", " + above + "])");
    var remove_tiles = [];
    for (var t in this.tiles) {
        var tile = this.tiles[t];
        if (tile.coords.z < below || tile.coords.z > above) {
            remove_tiles.push(t);
        }
    }
    for (var r=0; r < remove_tiles.length; r++) {
        var key = remove_tiles[r];
        console.log("removed " + key + " (outside range [" + below + ", " + above + "])");
        this.removeTile(key);
    }
};

// Overrides base class method (a no op)
GLRenderer.prototype.resizeMap = function (width, height)
{
    VectorRenderer.prototype.resizeMap.apply(this, arguments);

    this.css_size = { width: width, height: height };
    this.device_size = { width: Math.round(this.css_size.width * this.device_pixel_ratio), height: Math.round(this.css_size.height * this.device_pixel_ratio) };

    this.canvas.style.width = this.css_size.width + 'px';
    this.canvas.style.height = this.css_size.height + 'px';
    this.canvas.width = this.device_size.width;
    this.canvas.height = this.device_size.height;
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
};

GLRenderer.prototype._render = function GLRendererRender ()
{
    var gl = this.gl;

    this.input();

    // Reset frame state
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.depthFunc(gl.LESS);
    gl.enable(gl.CULL_FACE);
    gl.cullFace(gl.BACK);

    // Render tiles grouped by renderg mode (GL program)
    var render_count = 0;
    for (var mode in this.render_modes) {
        var gl_program = this.render_modes[mode].gl_program;

        gl.useProgram(gl_program.program);

        // TODO: set these once per program, don't set when they haven't changed
        gl_program.uniform('2f', 'resolution', this.css_size.width, this.css_size.height);
        gl_program.uniform('1f', 'time', ((+new Date()) - this.start_time) / 1000);

        var center = Geo.latLngToMeters(Point(this.center.lng, this.center.lat));
        gl_program.uniform('2f', 'map_center', center.x, center.y);
        gl_program.uniform('1f', 'map_zoom', this.zoom); // Math.floor(this.zoom) + (Math.log((this.zoom % 1) + 1) / Math.LN2 // scale fractional zoom by log
        gl_program.uniform('1f', 'num_layers', this.layers.length);

        var meters_per_pixel = Geo.min_zoom_meters_per_pixel / Math.pow(2, this.zoom);
        var meter_zoom = Point(this.css_size.width / 2 * meters_per_pixel, this.css_size.height / 2 * meters_per_pixel);
        gl_program.uniform('2f', 'meter_zoom', meter_zoom.x, meter_zoom.y);

        // TODO: make a list of renderable tiles once per frame, outside this loop
        // Render tile GL geometries
        var capped_zoom = Math.min(~~this.zoom, this.tile_source.max_zoom || ~~this.zoom);
        for (var t in this.tiles) {
            var tile = this.tiles[t];
            if (tile.loaded == true &&
                tile.visible == true &&
                Math.min(tile.coords.z, this.tile_source.max_zoom || tile.coords.z) == capped_zoom) {

                if (tile.gl_geometry[mode] != null) {
                    gl_program.uniform('2f', 'tile_min', tile.min.x, tile.min.y);
                    gl_program.uniform('2f', 'tile_max', tile.max.x, tile.max.y);

                    tile.gl_geometry[mode].render();
                    render_count += tile.gl_geometry[mode].geometry_count;
                }
            }
        }
    }

    if (render_count != this.last_render_count) {
        console.log("rendered " + render_count + " primitives");
    }
    this.last_render_count = render_count;

    if (this.continuous_animation == true) {
        this.dirty = true;
    }

    return true;
};

// Sum of a debug property across tiles
GLRenderer.prototype.getDebugSum = function (prop, filter)
{
    var sum = 0;
    for (var t in this.tiles) {
        if (this.tiles[t].debug[prop] != null && (typeof filter != 'function' || filter(this.tiles[t]) == true)) {
            sum += this.tiles[t].debug[prop];
        }
    }
    return sum;
};

// Average of a debug property across tiles
GLRenderer.prototype.getDebugAverage = function (prop, filter)
{
    return this.getDebugSum(prop, filter) / Object.keys(this.tiles).length;
};

// User input
// TODO: restore fractional zoom support once leaflet animation refactor pull request is merged

GLRenderer.prototype.initInputHandlers = function GLRendererInitInputHandlers ()
{
    var gl_renderer = this;
    gl_renderer.key = null;

    document.addEventListener('keydown', function (event) {
        if (event.keyCode == 37) {
            gl_renderer.key = 'left';
        }
        else if (event.keyCode == 39) {
            gl_renderer.key = 'right';
        }
        else if (event.keyCode == 38) {
            gl_renderer.key = 'up';
        }
        else if (event.keyCode == 40) {
            gl_renderer.key = 'down';
        }
        else if (event.keyCode == 83) { // s
            console.log("reloading shaders");
            for (var mode in this.render_modes) {
                this.render_modes[mode].gl_program.compile();
            }
            gl_renderer.dirty = true;
        }
    });

    document.addEventListener('keyup', function (event) {
        gl_renderer.key = null;
    });
};

GLRenderer.prototype.input = function GLRendererInput ()
{
    // // Fractional zoom scaling
    // if (this.key == 'up') {
    //     this.setZoom(this.zoom + this.zoom_step);
    // }
    // else if (this.key == 'down') {
    //     this.setZoom(this.zoom - this.zoom_step);
    // }
};

if (module !== undefined) {
    module.exports = GLRenderer;
}

},{"../geo.js":2,"../point.js":10,"../vector_renderer.js":13,"./gl.js":3,"./gl_builders.js":4,"./gl_geom.js":5,"./gl_shaders.js":7}],7:[function(_dereq_,module,exports){
// Generated from GLSL files, don't edit!
var shader_sources = {};

shader_sources['point_fragment'] =
"uniform vec2 resolution;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"\n" +
"void main (void) {\n" +
"    vec4 color = vec4(fcolor, 1.);\n" +
"\n" +
"    // if (length(ftexcoord.xy) > 10.) {\n" +
"    //     // color = vec4(0., 0., 0., 0.);\n" +
"    //     discard;\n" +
"    // }\n" +
"\n" +
"    float len = length(ftexcoord);\n" +
"    if (len > 1.) {\n" +
"        discard;\n" +
"    }\n" +
"    color.rgb *= (1. - smoothstep(.25, 1., len)) + 0.5;\n" +
"    // color.a = (1. - smoothstep(2.5, 10., len)) + 0.25;\n" +
"\n" +
"    #if defined(EFFECT_SCREEN_COLOR)\n" +
"        // Mutate colors by screen position\n" +
"        color.rgb += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"    #endif\n" +
"\n" +
"    gl_FragColor = color;\n" +
"}\n" +
"";

shader_sources['point_vertex'] =
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float num_layers;\n" +
"// uniform float time;\n" +
"\n" +
"attribute vec3 position;\n" +
"// attribute vec3 normal;\n" +
"attribute vec2 texcoord;\n" +
"attribute vec3 color;\n" +
"attribute float layer;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"varying vec2 ftexcoord;\n" +
"\n" +
"// vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)\n" +
"// const float ambient = 0.45;\n" +
"\n" +
"void main() {\n" +
"    vec3 vposition = position;\n" +
"    // vec3 vnormal = normal;\n" +
"    // vec2 vtexcoord = texcoord;\n" +
"\n" +
"    // Calc position of vertex in meters, relative to center of screen\n" +
"    vposition.y *= -1.0; // adjust for flipped y-coords\n" +
"    vposition.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)\n" +
"    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords\n" +
"\n" +
"    // Shading & texture\n" +
"    fcolor = color;\n" +
"    ftexcoord = texcoord;\n" +
"\n" +
"    // #if defined(PROJECTION_PERSPECTIVE)\n" +
"    //     // Perspective-style projection\n" +
"    //     vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"    //     vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"    //     vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"    // #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"    //     // Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"    //     #if defined(PROJECTION_POPUP)\n" +
"    //         if (vposition.z > 1.0) {\n" +
"    //             float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));\n" +
"    //             const float popup_fade_inner = 0.5;\n" +
"    //             const float popup_fade_outer = 0.75;\n" +
"    //             if (cd > popup_fade_inner) {\n" +
"    //                 vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"    //             }\n" +
"    //             const float zoom_boost_start = 15.0;\n" +
"    //             const float zoom_boost_end = 17.0;\n" +
"    //             const float zoom_boost_magnitude = 0.75;\n" +
"    //             vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"    //         }\n" +
"    //     #endif\n" +
"\n" +
"    //     // Isometric-style projection\n" +
"    //     vposition.y += vposition.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"    //     // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric\n" +
"    //     // vposition.x -= vposition.z * 0.5;\n" +
"    // #endif\n" +
"\n" +
"    // Reverse and scale to 0-1 for GL depth buffer\n" +
"    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth\n" +
"    float z_layer_scale = 4096.;\n" +
"    float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"    float z_layer = (layer + 1.) * z_layer_scale;\n" +
"    // float z_layer = (layer + 1.);\n" +
"\n" +
"    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);\n" +
"    vposition.z = (z_layer_range - vposition.z) / z_layer_range;\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_fragment'] =
"uniform vec2 resolution;\n" +
"uniform float time;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"    varying vec3 fposition;\n" +
"\n" +
"    // http://stackoverflow.com/questions/4200224/random-noise-functions-for-glsl\n" +
"    // float rand (vec2 co) {\n" +
"    //    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);\n" +
"    // }\n" +
"\n" +
"    // Noise functions from: https://github.com/ashima/webgl-noise\n" +
"    vec3 mod289(vec3 x) {\n" +
"        return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"    }\n" +
"\n" +
"    vec4 mod289(vec4 x) {\n" +
"        return x - floor(x * (1.0 / 289.0)) * 289.0;\n" +
"    }\n" +
"\n" +
"    vec4 permute(vec4 x) {\n" +
"        return mod289(((x*34.0)+1.0)*x);\n" +
"    }\n" +
"\n" +
"    vec4 taylorInvSqrt(vec4 r) {\n" +
"        return 1.79284291400159 - 0.85373472095314 * r;\n" +
"    }\n" +
"\n" +
"    vec3 fade(vec3 t) {\n" +
"        return t*t*t*(t*(t*6.0-15.0)+10.0);\n" +
"    }\n" +
"\n" +
"    float snoise(vec3 v) {\n" +
"        const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;\n" +
"        const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);\n" +
"\n" +
"        // First corner\n" +
"        vec3 i  = floor(v + dot(v, C.yyy) );\n" +
"        vec3 x0 =   v - i + dot(i, C.xxx) ;\n" +
"\n" +
"        // Other corners\n" +
"        vec3 g = step(x0.yzx, x0.xyz);\n" +
"        vec3 l = 1.0 - g;\n" +
"        vec3 i1 = min( g.xyz, l.zxy );\n" +
"        vec3 i2 = max( g.xyz, l.zxy );\n" +
"\n" +
"        //   x0 = x0 - 0.0 + 0.0 * C.xxx;\n" +
"        //   x1 = x0 - i1  + 1.0 * C.xxx;\n" +
"        //   x2 = x0 - i2  + 2.0 * C.xxx;\n" +
"        //   x3 = x0 - 1.0 + 3.0 * C.xxx;\n" +
"        vec3 x1 = x0 - i1 + C.xxx;\n" +
"        vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y\n" +
"        vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y\n" +
"\n" +
"        // Permutations\n" +
"        i = mod289(i);\n" +
"        vec4 p = permute( permute( permute(\n" +
"        i.z + vec4(0.0, i1.z, i2.z, 1.0 ))\n" +
"        + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))\n" +
"        + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));\n" +
"\n" +
"        // Gradients: 7x7 points over a square, mapped onto an octahedron.\n" +
"        // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)\n" +
"        float n_ = 0.142857142857; // 1.0/7.0\n" +
"        vec3  ns = n_ * D.wyz - D.xzx;\n" +
"\n" +
"        vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)\n" +
"\n" +
"        vec4 x_ = floor(j * ns.z);\n" +
"        vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)\n" +
"\n" +
"        vec4 x = x_ *ns.x + ns.yyyy;\n" +
"        vec4 y = y_ *ns.x + ns.yyyy;\n" +
"        vec4 h = 1.0 - abs(x) - abs(y);\n" +
"\n" +
"        vec4 b0 = vec4( x.xy, y.xy );\n" +
"        vec4 b1 = vec4( x.zw, y.zw );\n" +
"\n" +
"        //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;\n" +
"        //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;\n" +
"        vec4 s0 = floor(b0)*2.0 + 1.0;\n" +
"        vec4 s1 = floor(b1)*2.0 + 1.0;\n" +
"        vec4 sh = -step(h, vec4(0.0));\n" +
"\n" +
"        vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;\n" +
"        vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;\n" +
"\n" +
"        vec3 p0 = vec3(a0.xy,h.x);\n" +
"        vec3 p1 = vec3(a0.zw,h.y);\n" +
"        vec3 p2 = vec3(a1.xy,h.z);\n" +
"        vec3 p3 = vec3(a1.zw,h.w);\n" +
"\n" +
"        //Normalise gradients\n" +
"        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));\n" +
"        p0 *= norm.x;\n" +
"        p1 *= norm.y;\n" +
"        p2 *= norm.z;\n" +
"        p3 *= norm.w;\n" +
"\n" +
"        // Mix final noise value\n" +
"        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);\n" +
"        m = m * m;\n" +
"        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );\n" +
"    }\n" +
"\n" +
"    // Classic Perlin noise\n" +
"    float cnoise(vec3 P) {\n" +
"        vec3 Pi0 = floor(P); // Integer part for indexing\n" +
"        vec3 Pi1 = Pi0 + vec3(1.0); // Integer part + 1\n" +
"        Pi0 = mod289(Pi0);\n" +
"        Pi1 = mod289(Pi1);\n" +
"        vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"        vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"        vec4 iz0 = Pi0.zzzz;\n" +
"        vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"        vec4 ixy = permute(permute(ix) + iy);\n" +
"        vec4 ixy0 = permute(ixy + iz0);\n" +
"        vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"        vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"        gx0 = fract(gx0);\n" +
"        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"        vec4 sz0 = step(gz0, vec4(0.0));\n" +
"        gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"        gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"        vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"        gx1 = fract(gx1);\n" +
"        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"        vec4 sz1 = step(gz1, vec4(0.0));\n" +
"        gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"        gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"        g000 *= norm0.x;\n" +
"        g010 *= norm0.y;\n" +
"        g100 *= norm0.z;\n" +
"        g110 *= norm0.w;\n" +
"        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"        g001 *= norm1.x;\n" +
"        g011 *= norm1.y;\n" +
"        g101 *= norm1.z;\n" +
"        g111 *= norm1.w;\n" +
"\n" +
"        float n000 = dot(g000, Pf0);\n" +
"        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"        float n111 = dot(g111, Pf1);\n" +
"\n" +
"        vec3 fade_xyz = fade(Pf0);\n" +
"        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"        return 2.2 * n_xyz;\n" +
"    }\n" +
"\n" +
"    // Classic Perlin noise, periodic variant\n" +
"    float pnoise(vec3 P, vec3 rep) {\n" +
"        vec3 Pi0 = mod(floor(P), rep); // Integer part, modulo period\n" +
"        vec3 Pi1 = mod(Pi0 + vec3(1.0), rep); // Integer part + 1, mod period\n" +
"        Pi0 = mod289(Pi0);\n" +
"        Pi1 = mod289(Pi1);\n" +
"        vec3 Pf0 = fract(P); // Fractional part for interpolation\n" +
"        vec3 Pf1 = Pf0 - vec3(1.0); // Fractional part - 1.0\n" +
"        vec4 ix = vec4(Pi0.x, Pi1.x, Pi0.x, Pi1.x);\n" +
"        vec4 iy = vec4(Pi0.yy, Pi1.yy);\n" +
"        vec4 iz0 = Pi0.zzzz;\n" +
"        vec4 iz1 = Pi1.zzzz;\n" +
"\n" +
"        vec4 ixy = permute(permute(ix) + iy);\n" +
"        vec4 ixy0 = permute(ixy + iz0);\n" +
"        vec4 ixy1 = permute(ixy + iz1);\n" +
"\n" +
"        vec4 gx0 = ixy0 * (1.0 / 7.0);\n" +
"        vec4 gy0 = fract(floor(gx0) * (1.0 / 7.0)) - 0.5;\n" +
"        gx0 = fract(gx0);\n" +
"        vec4 gz0 = vec4(0.5) - abs(gx0) - abs(gy0);\n" +
"        vec4 sz0 = step(gz0, vec4(0.0));\n" +
"        gx0 -= sz0 * (step(0.0, gx0) - 0.5);\n" +
"        gy0 -= sz0 * (step(0.0, gy0) - 0.5);\n" +
"\n" +
"        vec4 gx1 = ixy1 * (1.0 / 7.0);\n" +
"        vec4 gy1 = fract(floor(gx1) * (1.0 / 7.0)) - 0.5;\n" +
"        gx1 = fract(gx1);\n" +
"        vec4 gz1 = vec4(0.5) - abs(gx1) - abs(gy1);\n" +
"        vec4 sz1 = step(gz1, vec4(0.0));\n" +
"        gx1 -= sz1 * (step(0.0, gx1) - 0.5);\n" +
"        gy1 -= sz1 * (step(0.0, gy1) - 0.5);\n" +
"\n" +
"        vec3 g000 = vec3(gx0.x,gy0.x,gz0.x);\n" +
"        vec3 g100 = vec3(gx0.y,gy0.y,gz0.y);\n" +
"        vec3 g010 = vec3(gx0.z,gy0.z,gz0.z);\n" +
"        vec3 g110 = vec3(gx0.w,gy0.w,gz0.w);\n" +
"        vec3 g001 = vec3(gx1.x,gy1.x,gz1.x);\n" +
"        vec3 g101 = vec3(gx1.y,gy1.y,gz1.y);\n" +
"        vec3 g011 = vec3(gx1.z,gy1.z,gz1.z);\n" +
"        vec3 g111 = vec3(gx1.w,gy1.w,gz1.w);\n" +
"\n" +
"        vec4 norm0 = taylorInvSqrt(vec4(dot(g000, g000), dot(g010, g010), dot(g100, g100), dot(g110, g110)));\n" +
"        g000 *= norm0.x;\n" +
"        g010 *= norm0.y;\n" +
"        g100 *= norm0.z;\n" +
"        g110 *= norm0.w;\n" +
"        vec4 norm1 = taylorInvSqrt(vec4(dot(g001, g001), dot(g011, g011), dot(g101, g101), dot(g111, g111)));\n" +
"        g001 *= norm1.x;\n" +
"        g011 *= norm1.y;\n" +
"        g101 *= norm1.z;\n" +
"        g111 *= norm1.w;\n" +
"\n" +
"        float n000 = dot(g000, Pf0);\n" +
"        float n100 = dot(g100, vec3(Pf1.x, Pf0.yz));\n" +
"        float n010 = dot(g010, vec3(Pf0.x, Pf1.y, Pf0.z));\n" +
"        float n110 = dot(g110, vec3(Pf1.xy, Pf0.z));\n" +
"        float n001 = dot(g001, vec3(Pf0.xy, Pf1.z));\n" +
"        float n101 = dot(g101, vec3(Pf1.x, Pf0.y, Pf1.z));\n" +
"        float n011 = dot(g011, vec3(Pf0.x, Pf1.yz));\n" +
"        float n111 = dot(g111, Pf1);\n" +
"\n" +
"        vec3 fade_xyz = fade(Pf0);\n" +
"        vec4 n_z = mix(vec4(n000, n100, n010, n110), vec4(n001, n101, n011, n111), fade_xyz.z);\n" +
"        vec2 n_yz = mix(n_z.xy, n_z.zw, fade_xyz.y);\n" +
"        float n_xyz = mix(n_yz.x, n_yz.y, fade_xyz.x);\n" +
"        return 2.2 * n_xyz;\n" +
"    }\n" +
"#endif\n" +
"\n" +
"void main (void) {\n" +
"\n" +
"    #if defined(EFFECT_SPOTLIGHT)\n" +
"    // Spotlight effect\n" +
"        vec2 position = gl_FragCoord.xy / resolution.xy;    // scale coords to [0.0, 1.0]\n" +
"        position = position * 2.0 - 1.0;                    // scale coords to [-1.0, 1.0]\n" +
"        position.y *= resolution.y / resolution.x;          // correct aspect ratio\n" +
"\n" +
"        vec3 color = fcolor * max(1.0 - distance(position, vec2(0.0, 0.0)), 0.2);\n" +
"        // vec3 color = fcolor * (1.0 - dot(normalize(vec3(rand(gl_FragCoord.xy * 0.01) * 10.0, 0.0, -1.0)), vec3(0, 0, 1.0)));\n" +
"    #else\n" +
"        vec3 color = fcolor;\n" +
"    #endif\n" +
"\n" +
"    #if defined(EFFECT_COLOR_BLEED)\n" +
"        // Mutate colors by screen position or time\n" +
"        color += vec3(gl_FragCoord.x / resolution.x, 0.0, gl_FragCoord.y / resolution.y);\n" +
"        color.r += sin(time / 3.0);\n" +
"    #endif\n" +
"\n" +
"    // Mutate color by 3d noise\n" +
"    #if defined (EFFECT_NOISE_TEXTURE)\n" +
"        #if defined(EFFECT_NOISE_ANIMATABLE) && defined(EFFECT_NOISE_ANIMATED)\n" +
"            color *= (abs(cnoise((fposition + vec3(time * 5., time * 7.5, time * 10.)) / 10.0)) / 4.0) + 0.75;\n" +
"        #endif\n" +
"        #ifndef EFFECT_NOISE_ANIMATABLE\n" +
"            color *= (abs(cnoise(fposition / 10.0)) / 4.0) + 0.75;\n" +
"        #endif\n" +
"    #endif\n" +
"\n" +
"    gl_FragColor = vec4(color, 1.0);\n" +
"    // gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n" +
"}\n" +
"";

shader_sources['polygon_vertex'] =
"// #define PROJECTION_PERSPECTIVE\n" +
"// #define PROJECTION_ISOMETRIC\n" +
"// #define PROJECTION_POPUP\n" +
"\n" +
"// #define LIGHTING_POINT\n" +
"// #define LIGHTING_DIRECTION\n" +
"\n" +
"// #define ANIMATION_ELEVATOR\n" +
"// #define ANIMATION_WAVE\n" +
"\n" +
"uniform vec2 resolution;\n" +
"uniform vec2 map_center;\n" +
"uniform float map_zoom;\n" +
"uniform vec2 meter_zoom;\n" +
"uniform vec2 tile_min;\n" +
"uniform vec2 tile_max;\n" +
"uniform float num_layers;\n" +
"uniform float time;\n" +
"\n" +
"attribute vec3 position;\n" +
"attribute vec3 normal;\n" +
"attribute vec3 color;\n" +
"attribute float layer;\n" +
"\n" +
"varying vec3 fcolor;\n" +
"\n" +
"#if defined(EFFECT_NOISE_TEXTURE)\n" +
"    varying vec3 fposition;\n" +
"#endif\n" +
"\n" +
"vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)\n" +
"const float ambient = 0.45;\n" +
"\n" +
"// Project lat-lng to mercator\n" +
"// vec2 latLngToMeters (vec2 coordinate) {\n" +
"//     const float pi = 3.1415926;\n" +
"//     const float half_circumference_meters = 20037508.342789244;\n" +
"//     vec2 projected;\n" +
"\n" +
"//     // Latitude\n" +
"//     projected.y = log(tan((coordinate.y + 90.0) * pi / 360.0)) / (pi / 180.0);\n" +
"//     projected.y = projected.y * half_circumference_meters / 180.0;\n" +
"\n" +
"//     // Longitude\n" +
"//     projected.x = coordinate.x * half_circumference_meters / 180.0;\n" +
"\n" +
"//     return projected;\n" +
"// }\n" +
"\n" +
"void main() {\n" +
"    vec3 vposition = position;\n" +
"    vec3 vnormal = normal;\n" +
"\n" +
"    // Calc position of vertex in meters, relative to center of screen\n" +
"    vposition.y *= -1.0; // adjust for flipped y-coords\n" +
"    // vposition.y += TILE_SCALE; // alternate, to also adjust for force-positive y coords in tile\n" +
"    vposition.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)\n" +
"\n" +
"    // Vertex displacement + procedural effects\n" +
"    #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)\n" +
"        vec3 vposition_world = vposition + vec3(tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)\n" +
"\n" +
"        #if defined(EFFECT_NOISE_TEXTURE)\n" +
"            fposition = vposition_world;\n" +
"        #endif\n" +
"\n" +
"        if (vposition_world.z > 1.0) {\n" +
"            // vposition.x += sin(vposition_world.z + time) * 10.0 * sin(position.x); // swaying buildings\n" +
"            // vposition.y += cos(vposition_world.z + time) * 10.0;\n" +
"\n" +
"            #if defined(ANIMATION_ELEVATOR)\n" +
"                // vposition.z *= (sin(vposition_world.z / 25.0 * time) + 1.0) / 2.0 + 0.1; // evelator buildings\n" +
"                vposition.z *= max((sin(vposition_world.z + time) + 1.0) / 2.0, 0.05); // evelator buildings\n" +
"            #elif defined(ANIMATION_WAVE)\n" +
"                vposition.z *= max((sin(vposition_world.x / 100.0 + time) + 1.0) / 2.0, 0.05); // wave\n" +
"            #endif\n" +
"        }\n" +
"    #endif\n" +
"\n" +
"    // NOTE: due to unresolved floating point precision issues, tile and map center adjustment need to happen in ONE operation, or artifcats are introduced\n" +
"    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center\n" +
"    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords\n" +
"\n" +
"    // Shading\n" +
"    fcolor = color;\n" +
"    // fcolor += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time\n" +
"\n" +
"    #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)\n" +
"        // Gouraud shading\n" +
"        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location\n" +
"\n" +
"        #if defined(LIGHTING_NIGHT)\n" +
"            // \"Night\" effect by flipping vertex z\n" +
"            light = normalize(vec3(vposition.x, vposition.y, vposition.z) - light); // light angle from light point to vertex\n" +
"            fcolor *= dot(vnormal, light * -1.0); // + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"        #else\n" +
"            // Point light-based gradient\n" +
"            light = normalize(vec3(vposition.x, vposition.y, -vposition.z) - light); // light angle from light point to vertex\n" +
"            fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);\n" +
"        #endif\n" +
"\n" +
"    #elif defined(LIGHTING_DIRECTION)\n" +
"        // Flat shading\n" +
"        light = normalize(vec3(0.2, 0.7, -0.5));\n" +
"        // light = normalize(vec3(-1., 0.7, -.0));\n" +
"        // light = normalize(vec3(-1., 0.7, -.75));\n" +
"        // fcolor *= max(dot(vnormal, light * -1.0), 0.1) + ambient;\n" +
"        fcolor *= dot(vnormal, light * -1.0) + ambient;\n" +
"    #endif\n" +
"\n" +
"    #if defined(PROJECTION_PERSPECTIVE)\n" +
"        // Perspective-style projection\n" +
"        vec2 perspective_offset = vec2(-0.25, -0.25);\n" +
"        vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);\n" +
"        vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen\n" +
"    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)\n" +
"        // Pop-up effect - 3d in center of viewport, fading to 2d at edges\n" +
"        #if defined(PROJECTION_POPUP)\n" +
"            if (vposition.z > 1.0) {\n" +
"                float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));\n" +
"                const float popup_fade_inner = 0.5;\n" +
"                const float popup_fade_outer = 0.75;\n" +
"                if (cd > popup_fade_inner) {\n" +
"                    vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);\n" +
"                }\n" +
"                const float zoom_boost_start = 15.0;\n" +
"                const float zoom_boost_end = 17.0;\n" +
"                const float zoom_boost_magnitude = 0.75;\n" +
"                vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;\n" +
"            }\n" +
"        #endif\n" +
"\n" +
"        // Isometric-style projection\n" +
"        vposition.y += vposition.z / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric\n" +
"        // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric\n" +
"        // vposition.x -= vposition.z * 0.5;\n" +
"    #endif\n" +
"\n" +
"    // Rotation test\n" +
"    // float theta = 0;\n" +
"    // const float pi = 3.1415926;\n" +
"    // vec2 pr;\n" +
"    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);\n" +
"    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);\n" +
"    // vposition.xy = pr;\n" +
"\n" +
"    // vposition.y *= max(abs(sin(vposition.x)), 0.1); // hourglass effect\n" +
"    // vposition.y *= abs(max(sin(vposition.x), 0.1)); // funnel effect\n" +
"\n" +
"    // Reverse and scale to 0-1 for GL depth buffer\n" +
"    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth\n" +
"    float z_layer_scale = 4096.;\n" +
"    float z_layer_range = (num_layers + 1.) * z_layer_scale;\n" +
"    float z_layer = (layer + 1.) * z_layer_scale;\n" +
"\n" +
"    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);\n" +
"    vposition.z = (z_layer_range - vposition.z) / z_layer_range;\n" +
"\n" +
"    gl_Position = vec4(vposition, 1.0);\n" +
"}\n" +
"";

if (module.exports !== undefined) { module.exports = shader_sources; }


},{}],8:[function(_dereq_,module,exports){
var VectorRenderer = _dereq_('./vector_renderer.js');

var LeafletLayer = L.GridLayer.extend({

    options: {
        vectorRenderer: 'canvas'
    },

    initialize: function (options) {
        L.setOptions(this, options);
        this.options.vectorRenderer = this.options.vectorRenderer || 'GLRenderer';
        this._renderer = VectorRenderer.create(this.options.vectorRenderer, this.options.vectorTileSource, this.options.vectorLayers, this.options.vectorStyles, { num_workers: this.options.numWorkers });
        this._renderer.debug = this.options.debug;
        this._renderer.continuous_animation = false; // set to true for animatinos, etc. (eventually will be automated)
    },

    // Finish initializing renderer and setup events when layer is added to map
    onAdd: function (map) {
        var layer = this;

        layer.on('tileunload', function (event) {
            var tile = event.tile;
            var key = tile.getAttribute('data-tile-key');
            layer._renderer.removeTile(key);
        });

        layer._map.on('resize', function () {
            var size = layer._map.getSize();
            layer._renderer.resizeMap(size.x, size.y);
            layer.updateBounds();
        });

        layer._map.on('move', function () {
            var center = layer._map.getCenter();
            layer._renderer.setCenter(center.lng, center.lat);
            layer.updateBounds();
        });

        layer._map.on('zoomstart', function () {
            console.log("map.zoomstart " + layer._map.getZoom());
            layer._renderer.startZoom();
        });

        layer._map.on('zoomend', function () {
            console.log("map.zoomend " + layer._map.getZoom());
            layer._renderer.setZoom(layer._map.getZoom());
        });

        // Canvas element will be inserted after map container (leaflet transforms shouldn't be applied to the GL canvas)
        // TODO: find a better way to deal with this? right now GL map only renders correctly as the bottom layer
        layer._renderer.container = layer._map.getContainer();

        var center = layer._map.getCenter();
        layer._renderer.setCenter(center.lng, center.lat);
        layer._renderer.setZoom(layer._map.getZoom());
        layer.updateBounds();

        L.GridLayer.prototype.onAdd.apply(this, arguments);
        layer._renderer.init();
    },

    onRemove: function (map) {
        L.GridLayer.prototype.onRemove.apply(this, arguments);
        // TODO: remove event handlers, destroy map
    },

    createTile: function (coords, done) {
        var div = document.createElement('div');
        this._renderer.loadTile(coords, div, done);
        return div;
    },

    updateBounds: function () {
        var layer = this;
        var bounds = layer._map.getBounds();
        layer._renderer.setBounds(bounds.getSouthWest(), bounds.getNorthEast());
    },

    render: function () {
        this._renderer.render();
    }

});

var leafletLayer = function (options) {
    return new LeafletLayer(options);
};

if (module !== undefined) {
    module.exports = {
        LeafletLayer: LeafletLayer,
        leafletLayer: leafletLayer
    };
}

},{"./vector_renderer.js":13}],9:[function(_dereq_,module,exports){
// Modules and dependencies to expose in the public Tangram module

// The leaflet layer plugin is currently the primary means of using the library
var Leaflet = _dereq_('./leaflet_layer.js');

// Renderer modules need to be explicitly included since they are not otherwise referenced
_dereq_('./gl/gl_renderer.js');
_dereq_('./canvas/canvas_renderer.js');

// GL functions included for easier debugging / direct access to setting global defines, reloading programs, etc.
var GL = _dereq_('./gl/gl.js');

if (module !== undefined) {
    module.exports = {
        LeafletLayer: Leaflet.LeafletLayer,
        leafletLayer: Leaflet.leafletLayer,
        GL: GL
    };
}

},{"./canvas/canvas_renderer.js":1,"./gl/gl.js":3,"./gl/gl_renderer.js":6,"./leaflet_layer.js":8}],10:[function(_dereq_,module,exports){
// Point
function Point (x, y)
{
    return { x: x, y: y };
}

Point.copy = function (p)
{
    if (p == null) {
        return null;
    }
    return { x: p.x, y: p.y };
};

if (module !== undefined) {
    module.exports = Point;
}

},{}],11:[function(_dereq_,module,exports){
/*** Style helpers ***/

var Style = {};

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // random color
};

Style.width = {
    pixels: function (p) { return function (f, t) { return (typeof p == 'function' ? p(f, t) : p) * t.units_per_pixel; }; }, // local tile units for a given pixel width
    meters: function (p) { return function (f, t) { return (typeof p == 'function' ? p(f, t) : p) * t.units_per_meter; }; }  // local tile units for a given meter width
};

if (module !== undefined) {
    module.exports = Style;
}

},{}],12:[function(_dereq_,module,exports){
/*** Vector functions - vectors provided as [x, y, z] arrays ***/

var Vector = {};

// Vector length squared
Vector.lengthSq = function (v)
{
    if (v.length == 2) {
        return (v[0]*v[0] + v[1]*v[1]);
    }
    else {
        return (v[0]*v[0] + v[1]*v[1] + v[2]*v[2]);
    }
};

// Vector length
Vector.length = function (v)
{
    return Math.sqrt(Vector.lengthSq(v));
};

// Normalize a vector
Vector.normalize = function (v)
{
    var d;
    if (v.length == 2) {
        d = v[0]*v[0] + v[1]*v[1];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d];
        }
        return [0, 0];
    }
    else {
        var d = v[0]*v[0] + v[1]*v[1] + v[2]*v[2];
        d = Math.sqrt(d);

        if (d != 0) {
            return [v[0] / d, v[1] / d, v[2] / d];
        }
        return [0, 0, 0];
    }
};

// Cross product of two vectors
Vector.cross  = function (v1, v2)
{
    return [
        (v1[1] * v2[2]) - (v1[2] * v2[1]),
        (v1[2] * v2[0]) - (v1[0] * v2[2]),
        (v1[0] * v2[1]) - (v1[1] * v2[0])
    ];
};

// Find the intersection of two lines specified as segments from points (p1, p2) and (p3, p4)
// http://en.wikipedia.org/wiki/Line-line_intersection
// http://en.wikipedia.org/wiki/Cramer's_rule
Vector.lineIntersection = function (p1, p2, p3, p4, parallel_tolerance)
{
    var parallel_tolerance = parallel_tolerance || 0.01;

    // a1*x + b1*y = c1 for line (x1, y1) to (x2, y2)
    // a2*x + b2*y = c2 for line (x3, y3) to (x4, y4)
    var a1 = p1[1] - p2[1]; // y1 - y2
    var b1 = p1[0] - p2[0]; // x1 - x2
    var a2 = p3[1] - p4[1]; // y3 - y4
    var b2 = p3[0] - p4[0]; // x3 - x4
    var c1 = (p1[0] * p2[1]) - (p1[1] * p2[0]); // x1*y2 - y1*x2
    var c2 = (p3[0] * p4[1]) - (p3[1] * p4[0]); // x3*y4 - y3*x4
    var denom = (b1 * a2) - (a1 * b2);

    if (Math.abs(denom) > parallel_tolerance) {
        return [
            ((c1 * b2) - (b1 * c2)) / denom,
            ((c1 * a2) - (a1 * c2)) / denom
        ];
    }
    return null; // return null if lines are (close to) parallel
};

if (module !== undefined) {
    module.exports = Vector;
}

},{}],13:[function(_dereq_,module,exports){
var Point = _dereq_('./point.js');
var Geo = _dereq_('./geo.js');
var Style = _dereq_('./style.js');

// Get base URL from which the library was loaded
// Used to load additional resources like shaders, textures, etc. in cases where library was loaded from a relative path
(function() {
    try {
        VectorRenderer.library_base_url = '';
        var scripts = document.getElementsByTagName('script'); // document.querySelectorAll('script[src*=".js"]');
        for (var s=0; s < scripts.length; s++) {
            // var base_match = scripts[s].src.match(/(.*)vector-map.(debug|min).js/); // should match debug or minified versions
            // if (base_match != null && base_match.length > 1) {
            //     VectorRenderer.library_base_url = base_match[1];
            //     break;
            // }
            var match = scripts[s].src.indexOf('vector-map.debug.js');
            if (match == -1) {
                match = scripts[s].src.indexOf('vector-map.min.js');
            }
            if (match >= 0) {
                VectorRenderer.library_base_url = scripts[s].src.substr(0, match);
                break;
            }
        }
    }
    catch (e) {
        // skip in web worker
    }
}());

VectorRenderer.tile_scale = 4096; // coordinates are locally scaled to the range [0, tile_scale]
VectorRenderer.units_per_meter = [];
VectorRenderer.units_per_pixel = [];
(function() {
    for (var z=0; z <= Geo.max_zoom; z++) {
        VectorRenderer.units_per_meter[z] = VectorRenderer.tile_scale / (Geo.tile_size * Geo.meters_per_pixel[z]);
        VectorRenderer.units_per_pixel[z] = VectorRenderer.tile_scale / Geo.tile_size;
    }
}());

// Layers & styles: pass an object directly, or a URL as string to load remotely
function VectorRenderer (type, tile_source, layers, styles, options)
{
    var options = options || {};
    this.type = type;
    this.tile_source = tile_source;
    this.tiles = {};
    this.num_workers = options.num_workers || 1;

    this.layer_source = VectorRenderer.urlForPath(layers); // TODO: fix this for layers provided as objects, this assumes a URL is passed
    if (typeof(layers) == 'string') {
        this.layers = VectorRenderer.loadLayers(layers);
    }
    else {
        this.layers = layers;
    }

    this.style_source = VectorRenderer.urlForPath(styles); // TODO: fix this for styles provided as objects, this assumes a URL is passed
    if (typeof(styles) == 'string') {
        this.styles = VectorRenderer.loadStyles(styles);
    }
    else {
        this.styles = styles;
    }

    this.createWorkers();

    this.zoom = null;
    this.center = null;
    this.device_pixel_ratio = window.devicePixelRatio || 1;
    this.dirty = true; // request a redraw
    this.initialized = false;
}

VectorRenderer.create = function (type, tile_source, layers, styles, options)
{
    return new VectorRenderer[type](tile_source, layers, styles, options);
};

VectorRenderer.prototype.init = function ()
{
    // Child class-specific initialization (e.g. GL context creation)
    if (typeof(this._init) == 'function') {
        this._init.apply(this, arguments);
    }

    var renderer = this;
    this.workers.forEach(function(worker) {
        worker.addEventListener('message', renderer.tileWorkerCompleted.bind(renderer));
    });

    this.initialized = true;
};

// Web workers handle heavy duty geometry processing
VectorRenderer.prototype.createWorkers = function ()
{
    var renderer = this;
    var url = VectorRenderer.library_base_url + 'vector-map-worker.min.js';

    // To allow workers to be loaded cross-domain, first load worker source via XHR, then create a local URL via a blob
    var req = new XMLHttpRequest();
    req.onload = function () {
        var worker_local_url = window.URL.createObjectURL(new Blob([req.response], { type: 'application/javascript' }));

        renderer.workers = [];
        for (var w=0; w < renderer.num_workers; w++) {
            renderer.workers.push(new Worker(worker_local_url));
        }
    };
    req.open('GET', url, false /* async flag */);
    req.send();

    // Alternate for debugging - tradtional method of loading from remote URL instead of XHR-to-local-blob
    // renderer.workers = [];
    // for (var w=0; w < renderer.num_workers; w++) {
    //     renderer.workers.push(new Worker(url));
    // }

    this.next_worker = 0;
};

VectorRenderer.prototype.setCenter = function (lng, lat)
{
    this.center = { lng: lng, lat: lat };
    this.dirty = true;
};

VectorRenderer.prototype.setZoom = function (zoom)
{
    this.map_last_zoom = this.zoom;
    this.zoom = zoom;
    this.map_zooming = false;
    this.dirty = true;
};

VectorRenderer.prototype.startZoom = function ()
{
    this.map_last_zoom = this.zoom;
    this.map_zooming = true;
};

VectorRenderer.prototype.setBounds = function (sw, ne)
{
    this.bounds = {
        sw: { lng: sw.lng, lat: sw.lat },
        ne: { lng: ne.lng, lat: ne.lat }
    };

    var buffer = 200 * Geo.meters_per_pixel[~~this.zoom]; // pixels -> meters
    this.buffered_meter_bounds = {
        sw: Geo.latLngToMeters(Point(this.bounds.sw.lng, this.bounds.sw.lat)),
        ne: Geo.latLngToMeters(Point(this.bounds.ne.lng, this.bounds.ne.lat))
    };
    this.buffered_meter_bounds.sw.x -= buffer;
    this.buffered_meter_bounds.sw.y -= buffer;
    this.buffered_meter_bounds.ne.x += buffer;
    this.buffered_meter_bounds.ne.y += buffer;

    // console.log("set renderer bounds to " + JSON.stringify(this.bounds));

    // Mark tiles as visible/invisible
    for (var t in this.tiles) {
        this.updateVisibilityForTile(this.tiles[t]);
    }

    this.dirty = true;
};

VectorRenderer.prototype.updateVisibilityForTile = function (tile)
{
    tile.visible = Geo.boxIntersect(tile.bounds, this.buffered_meter_bounds);
    return tile.visible;
};

VectorRenderer.prototype.resizeMap = function (width, height)
{
    this.dirty = true;
};

VectorRenderer.prototype.requestRedraw = function ()
{
    this.dirty = true;
};

VectorRenderer.prototype.render = function ()
{
    if (this.dirty == false || this.initialized == false) {
        return false;
    }
    this.dirty = false; // subclasses can set this back to true when animation is needed

    // Child class-specific rendering (e.g. GL draw calls)
    if (typeof(this._render) == 'function') {
        this._render.apply(this, arguments);
    }

    // console.log("render map");
    return true;
};

VectorRenderer.prototype.loadTile = function (coords, div, callback)
{
    // Overzoom?
    if (coords.z > this.tile_source.max_zoom) {
        var zgap = coords.z - this.tile_source.max_zoom;
        // var original_tile = [coords.x, coords.y, coords.z].join('/');
        coords.x = ~~(coords.x / Math.pow(2, zgap));
        coords.y = ~~(coords.y / Math.pow(2, zgap));
        coords.display_z = coords.z; // z without overzoom
        coords.z -= zgap;
        // console.log("adjusted for overzoom, tile " + original_tile + " -> " + [coords.x, coords.y, coords.z].join('/'));
    }

    // Start tracking new tile set if no other tiles already loading
    if (this.tile_set_loading == null) {
        this.tile_set_loading = +new Date();
        console.log("tile set load START");
    }

    var key = [coords.x, coords.y, coords.z].join('/');

    // Already loading/loaded?
    if (this.tiles[key]) {
        // if (this.tiles[key].loaded == true) {
        //     console.log("use loaded tile " + key + " from cache");
        // }
        // if (this.tiles[key].loading == true) {
        //     console.log("already loading tile " + key + ", skip");
        // }

        if (callback) {
            callback(null, div);
        }
        return;
    }

    var tile = this.tiles[key] = {};
    tile.key = key;
    tile.coords = coords;
    tile.min = Geo.metersForTile(tile.coords);
    tile.max = Geo.metersForTile({ x: tile.coords.x + 1, y: tile.coords.y + 1, z: tile.coords.z });
    tile.bounds = { sw: { x: tile.min.x, y: tile.max.y }, ne: { x: tile.max.x, y: tile.min.y } };
    tile.units_per_meter = VectorRenderer.units_per_meter[tile.coords.z];
    tile.units_per_pixel = VectorRenderer.units_per_pixel[tile.coords.z];
    tile.debug = {};
    tile.loading = true;
    tile.loaded = false;
    this.updateVisibilityForTile(tile);

    this.workers[this.next_worker].postMessage({
        type: 'loadTile',
        tile: tile,
        renderer_type: this.type,
        tile_source: this.tile_source,
        layer_source: this.layer_source,
        style_source: this.style_source
    });
    tile.worker = this.workers[this.next_worker];
    this.next_worker = (this.next_worker + 1) % this.workers.length;

    // Debug info
    div.setAttribute('data-tile-key', tile.key);
    div.style.width = '256px';
    div.style.height = '256px';

    if (this.debug) {
        var debug_overlay = document.createElement('div');
        debug_overlay.textContent = tile.key;
        debug_overlay.style.position = 'absolute';
        debug_overlay.style.left = 0;
        debug_overlay.style.top = 0;
        debug_overlay.style.color = 'white';
        debug_overlay.style.fontSize = '16px';
        // debug_overlay.style.textOutline = '1px #000000';
        div.appendChild(debug_overlay);

        div.style.borderStyle = 'solid';
        div.style.borderColor = 'white';
        div.style.borderWidth = '1px';
    }

    if (callback) {
        callback(null, div);
    }
};

// Called on main thread when a web worker completes processing for a single tile
VectorRenderer.prototype.tileWorkerCompleted = function (event)
{
    if (event.data.type != 'loadTileCompleted') {
        return;
    }

    var tile = event.data.tile;

    // Removed this tile during load?
    if (this.tiles[tile.key] == null) {
        console.log("discarded tile " + tile.key + " in VectorRenderer.tileWorkerCompleted because previously removed");
        return;
    }

    this.tiles[tile.key] = tile; // TODO: OK to just wipe out the tile here? or could pass back a list of properties to replace? feeling the lack of underscore here...

    // Child class-specific tile processing
    if (typeof(this._tileWorkerCompleted) == 'function') {
        this._tileWorkerCompleted(tile);
    }

    delete tile.layers; // delete the source data in the tile to save memory

    // No more tiles actively loading?
    if (this.tile_set_loading != null) {
        var end_tile_set = true;
        for (var t in this.tiles) {
            if (this.tiles[t].loading == true) {
                end_tile_set = false;
                break;
            }
        }

        if (end_tile_set == true) {
            this.last_tile_set_load = (+new Date()) - this.tile_set_loading;
            this.tile_set_loading = null;
            console.log("tile set load FINISHED in: " + this.last_tile_set_load);
        }
    }

    this.dirty = true;
    this.printDebugForTile(tile);
};

VectorRenderer.prototype.removeTile = function (key)
{
    console.log("tile unload for " + key);
    var tile = this.tiles[key];
    if (tile != null && tile.loading == true) {
        console.log("cancel tile load for " + key);

        // Web worker will cancel XHR requests
        if (tile.worker != null) {
            tile.worker.postMessage({
                type: 'removeTile',
                key: tile.key
            });
        }
    }

    delete this.tiles[key];
    this.dirty = true;
};

VectorRenderer.prototype.printDebugForTile = function (tile)
{
    console.log(
        "debug for " + tile.key + ': [ ' +
        Object.keys(tile.debug).map(function (t) { return t + ': ' + tile.debug[t]; }).join(', ') + ' ]'
    );
};


/*** Class methods (stateless) ***/

// Simplistic detection of relative paths, append base if necessary
VectorRenderer.urlForPath = function (path) {
    var protocol = path.toLowerCase().substr(0, 4);
    if (!(protocol == 'http' || protocol == 'file')) {
        path = window.location.origin + window.location.pathname + path;
    }
    return path;
};

VectorRenderer.loadLayers = function (url)
{
    var layers;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('layers = ' + req.response); }; // TODO: security!
    req.open('GET', url, false /* async flag */);
    req.send();
    return layers;
};

VectorRenderer.loadStyles = function (url)
{
    var styles;
    var req = new XMLHttpRequest();
    req.onload = function () { eval('styles = ' + req.response); }; // TODO: security!
    req.open('GET', url, false /* async flag */);
    req.send();
    return styles;
};

// Processes the tile response to create layers as defined by this renderer
// Can include post-processing to partially filter or re-arrange data, e.g. only including POIs that have names
VectorRenderer.processLayersForTile = function (layers, tile)
{
    var tile_layers = {};
    for (var t=0; t < layers.length; t++) {
        layers[t].number = t;

        if (layers[t] != null) {
            // Just pass through data untouched if no data transform function defined
            if (layers[t].data == null) {
                tile_layers[layers[t].name] = tile.layers[layers[t].name];
            }
            // Pass through data but with different layer name in tile source data
            else if (typeof layers[t].data == 'string') {
                tile_layers[layers[t].name] = tile.layers[layers[t].data];
            }
            // Apply the transform function for post-processing
            else if (typeof layers[t].data == 'function') {
                tile_layers[layers[t].name] = layers[t].data(tile.layers);
            }
        }

        // Handle cases where no data was found in tile or returned by post-processor
        tile_layers[layers[t].name] = tile_layers[layers[t].name] || { type: 'FeatureCollection', features: [] };
    }
    tile.layers = tile_layers;
    return tile_layers;
};


/*** Style parsing & defaults ***/

// Determine final style properties (color, width, etc.)
VectorRenderer.style_defaults = {
    color: [1.0, 0, 0],
    width: Style.width.pixels(5),
    size: Style.width.pixels(5),
    extrude: false,
    height: 20,
    min_height: 0,
    outline: {
        // color: [1.0, 0, 0],
        // width: 1,
        // dash: null
    },
    // render_mode: {
    //     name: 'polygons'
    // }
    render_mode: 'polygons'
};

VectorRenderer.parseStyleForFeature = function (feature, layer_style, tile)
{
    var layer_style = layer_style || {};
    var style = {};

    // Test whether features should be rendered at all
    if (typeof layer_style.filter == 'function') {
        if (layer_style.filter(feature, tile) == false) {
            return null;
        }
    }

    // Parse styles
    style.color = (layer_style.color && (layer_style.color[feature.properties.kind] || layer_style.color.default)) || VectorRenderer.style_defaults.color;
    if (typeof style.color == 'function') {
        style.color = style.color(feature, tile);
    }

    style.width = (layer_style.width && (layer_style.width[feature.properties.kind] || layer_style.width.default)) || VectorRenderer.style_defaults.width;
    if (typeof style.width == 'function') {
        style.width = style.width(feature, tile);
    }

    style.size = (layer_style.size && (layer_style.size[feature.properties.kind] || layer_style.size.default)) || VectorRenderer.style_defaults.size;
    if (typeof style.size == 'function') {
        style.size = style.size(feature, tile);
    }

    style.extrude = (layer_style.extrude && (layer_style.extrude[feature.properties.kind] || layer_style.extrude.default)) || VectorRenderer.style_defaults.extrude;
    if (typeof style.extrude == 'function') {
        style.extrude = style.extrude(feature, tile); // returning a boolean will extrude with the feature's height, a number will override the feature height (see below)
    }

    style.height = (feature.properties && feature.properties.height) || VectorRenderer.style_defaults.height;
    style.min_height = (feature.properties && feature.properties.min_height) || VectorRenderer.style_defaults.min_height;

    // height defaults to feature height, but extrude style can dynamically adjust height by returning a number or array (instead of a boolean)
    if (style.extrude) {
        if (typeof style.extrude == 'number') {
            style.height = style.extrude;
        }
        else if (typeof style.extrude == 'object' && style.extrude.length >= 2) {
            style.min_height = style.extrude[0];
            style.height = style.extrude[1];
        }
    }

    style.outline = {};
    layer_style.outline = layer_style.outline || {};
    style.outline.color = (layer_style.outline.color && (layer_style.outline.color[feature.properties.kind] || layer_style.outline.color.default)) || VectorRenderer.style_defaults.outline.color;
    if (typeof style.outline.color == 'function') {
        style.outline.color = style.outline.color(feature, tile);
    }

    style.outline.width = (layer_style.outline.width && (layer_style.outline.width[feature.properties.kind] || layer_style.outline.width.default)) || VectorRenderer.style_defaults.outline.width;
    if (typeof style.outline.width == 'function') {
        style.outline.width = style.outline.width(feature, tile);
    }

    style.outline.dash = (layer_style.outline.dash && (layer_style.outline.dash[feature.properties.kind] || layer_style.outline.dash.default)) || VectorRenderer.style_defaults.outline.dash;
    if (typeof style.outline.dash == 'function') {
        style.outline.dash = style.outline.dash(feature, tile);
    }

    style.render_mode = layer_style.render_mode || VectorRenderer.style_defaults.render_mode;
    // style.render_mode = {};
    // style.render_mode.name = (layer_style.render_mode && layer_style.render_mode.name) || VectorRenderer.style_defaults.render_mode.name;

    return style;
};

if (module !== undefined) {
    module.exports = VectorRenderer;
}

},{"./geo.js":2,"./point.js":10,"./style.js":11}]},{},[9])
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlcyI6WyIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvbm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL2Jyb3dzZXItcGFjay9fcHJlbHVkZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvY2FudmFzL2NhbnZhc19yZW5kZXJlci5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2VvLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbC5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvZ2wvZ2xfYnVpbGRlcnMuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX2dlb20uanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL2dsL2dsX3JlbmRlcmVyLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9nbC9nbF9zaGFkZXJzLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9sZWFmbGV0X2xheWVyLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9tb2R1bGUuanMiLCIvVXNlcnMvYmNhbXBlci9Eb2N1bWVudHMvZGV2L3ZlY3Rvci1tYXAvc3JjL3BvaW50LmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy9zdHlsZS5qcyIsIi9Vc2Vycy9iY2FtcGVyL0RvY3VtZW50cy9kZXYvdmVjdG9yLW1hcC9zcmMvdmVjdG9yLmpzIiwiL1VzZXJzL2JjYW1wZXIvRG9jdW1lbnRzL2Rldi92ZWN0b3ItbWFwL3NyYy92ZWN0b3JfcmVuZGVyZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdWQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1SkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeGNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNmQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2ZUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOWlCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDakJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3Rocm93IG5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIil9dmFyIGY9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGYuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sZixmLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsInZhciBQb2ludCA9IHJlcXVpcmUoJy4uL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi4vZ2VvLmpzJyk7XG52YXIgVmVjdG9yUmVuZGVyZXIgPSByZXF1aXJlKCcuLi92ZWN0b3JfcmVuZGVyZXIuanMnKTtcblxuVmVjdG9yUmVuZGVyZXIuQ2FudmFzUmVuZGVyZXIgPSBDYW52YXNSZW5kZXJlcjtcbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlKTtcblxuZnVuY3Rpb24gQ2FudmFzUmVuZGVyZXIgKHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucylcbntcbiAgICBWZWN0b3JSZW5kZXJlci5jYWxsKHRoaXMsICdDYW52YXNSZW5kZXJlcicsIHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucyk7XG5cbiAgICAvLyBTZWxlY3Rpb24gaW5mbyBzaG93biBvbiBob3ZlclxuICAgIHRoaXMuc2VsZWN0aW9uX2luZm8gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9pbmZvLnNldEF0dHJpYnV0ZSgnY2xhc3MnLCAnbGFiZWwnKTtcbiAgICB0aGlzLnNlbGVjdGlvbl9pbmZvLnN0eWxlLmRpc3BsYXkgPSAnbm9uZSc7XG5cbiAgICAvLyBGb3IgZHJhd2luZyBtdWx0aXBvbHlnb25zIHcvY2FudmFzIGNvbXBvc2l0ZSBvcGVyYXRpb25zXG4gICAgdGhpcy5jdXRvdXRfY29udGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyk7XG59XG5cbi8vIENhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5hZGRUaWxlID0gZnVuY3Rpb24gQ2FudmFzUmVuZGVyZXJBZGRUaWxlICh0aWxlLCB0aWxlRGl2KVxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLl90aWxlV29ya2VyQ29tcGxldGVkID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICBjYW52YXMud2lkdGggPSBNYXRoLnJvdW5kKEdlby50aWxlX3NpemUgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbyk7XG4gICAgY2FudmFzLmhlaWdodCA9IE1hdGgucm91bmQoR2VvLnRpbGVfc2l6ZSAqIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBjYW52YXMuc3R5bGUuYmFja2dyb3VuZCA9IHRoaXMuY29sb3JUb1N0cmluZyh0aGlzLnN0eWxlcy5kZWZhdWx0KTtcblxuICAgIHRoaXMucmVuZGVyVGlsZSh0aWxlLCBjb250ZXh0KTtcblxuICAgIHZhciB0aWxlRGl2ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcihcImRpdltkYXRhLXRpbGUta2V5PSdcIiArIHRpbGUua2V5ICsgXCInXVwiKTtcbiAgICB0aWxlRGl2LmFwcGVuZENoaWxkKGNhbnZhcyk7XG59O1xuXG4vLyBTY2FsZSBhIEdlb0pTT04gY29vcmRpbmF0ZSAoMi1lbGVtZW50IGFycmF5KSBmcm9tIFttaW4sIG1heF0gdG8gdGlsZSBwaXhlbHNcbi8vIHJldHVybnMgYSBjb3B5IG9mIGdlb21ldHJ5LmNvb3JkaW5hdGVzIHRyYW5zZm9ybWVkIGludG8gUG9pbnRzXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUuc2NhbGVHZW9tZXRyeVRvUGl4ZWxzID0gZnVuY3Rpb24gc2NhbGVHZW9tZXRyeVRvUGl4ZWxzIChnZW9tZXRyeSlcbntcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzO1xuICAgIHJldHVybiBHZW8udHJhbnNmb3JtR2VvbWV0cnkoZ2VvbWV0cnksIGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICByZXR1cm4gUG9pbnQoXG4gICAgICAgICAgICAvLyBNYXRoLnJvdW5kKChjb29yZGluYXRlc1swXSAtIG1pbi54KSAqIEdlby50aWxlX3NpemUgLyAobWF4LnggLSBtaW4ueCkpLCAvLyByb3VuZGluZyByZW1vdmVzIHNlYW1zIGJ1dCBjYXVzZXMgYWxpYXNpbmdcbiAgICAgICAgICAgIC8vIE1hdGgucm91bmQoKGNvb3JkaW5hdGVzWzFdIC0gbWluLnkpICogR2VvLnRpbGVfc2l6ZSAvIChtYXgueSAtIG1pbi55KSlcbiAgICAgICAgICAgIGNvb3JkaW5hdGVzWzBdICogR2VvLnRpbGVfc2l6ZSAqIHJlbmRlcmVyLmRldmljZV9waXhlbF9yYXRpbyAvIFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUsXG4gICAgICAgICAgICBjb29yZGluYXRlc1sxXSAqIEdlby50aWxlX3NpemUgKiByZW5kZXJlci5kZXZpY2VfcGl4ZWxfcmF0aW8gLyBWZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlICogLTEgLy8gYWRqdXN0IGZvciBmbGlwcGVkIHktY29vcmRcbiAgICAgICAgKTtcbiAgICB9KTtcbn07XG5cbi8vIFJlbmRlcnMgYSBsaW5lIGdpdmVuIGFzIGFuIGFycmF5IG9mIFBvaW50c1xuLy8gbGluZSA9IFtQb2ludCwgUG9pbnQsIC4uLl1cbkNhbnZhc1JlbmRlcmVyLnByb3RvdHlwZS5yZW5kZXJMaW5lID0gZnVuY3Rpb24gcmVuZGVyTGluZSAobGluZSwgc3R5bGUsIGNvbnRleHQpXG57XG4gICAgdmFyIHNlZ21lbnRzID0gbGluZTtcbiAgICB2YXIgY29sb3IgPSBzdHlsZS5jb2xvcjtcbiAgICB2YXIgd2lkdGggPSBzdHlsZS53aWR0aDtcbiAgICB2YXIgZGFzaCA9IHN0eWxlLmRhc2g7XG5cbiAgICB2YXIgYyA9IGNvbnRleHQ7XG4gICAgYy5iZWdpblBhdGgoKTtcbiAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvclRvU3RyaW5nKGNvbG9yKTtcbiAgICBjLmxpbmVDYXAgPSAncm91bmQnO1xuICAgIGMubGluZVdpZHRoID0gd2lkdGg7XG4gICAgaWYgKGMuc2V0TGluZURhc2gpIHtcbiAgICAgICAgaWYgKGRhc2gpIHtcbiAgICAgICAgICAgIGMuc2V0TGluZURhc2goZGFzaC5tYXAoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQgKiB3aWR0aDsgfSkpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYy5zZXRMaW5lRGFzaChbXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBmb3IgKHZhciByPTA7IHIgPCBzZWdtZW50cy5sZW5ndGggLSAxOyByICsrKSB7XG4gICAgICAgIHZhciBzZWdtZW50ID0gW1xuICAgICAgICAgICAgc2VnbWVudHNbcl0ueCwgc2VnbWVudHNbcl0ueSxcbiAgICAgICAgICAgIHNlZ21lbnRzW3IgKyAxXS54LCBzZWdtZW50c1tyICsgMV0ueVxuICAgICAgICBdO1xuXG4gICAgICAgIGMubW92ZVRvKHNlZ21lbnRbMF0sIHNlZ21lbnRbMV0pO1xuICAgICAgICBjLmxpbmVUbyhzZWdtZW50WzJdLCBzZWdtZW50WzNdKTtcbiAgICB9O1xuXG4gICAgYy5jbG9zZVBhdGgoKTtcbiAgICBjLnN0cm9rZSgpO1xufTtcblxuLy8gUmVuZGVycyBhIHBvbHlnb24gZ2l2ZW4gYXMgYW4gYXJyYXkgb2YgUG9pbnRzXG4vLyBwb2x5Z29uID0gW1BvaW50LCBQb2ludCwgLi4uXVxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclBvbHlnb24gPSBmdW5jdGlvbiByZW5kZXJQb2x5Z29uIChwb2x5Z29uLCBzdHlsZSwgY29udGV4dClcbntcbiAgICB2YXIgc2VnbWVudHMgPSBwb2x5Z29uO1xuICAgIHZhciBjb2xvciA9IHN0eWxlLmNvbG9yO1xuICAgIHZhciB3aWR0aCA9IHN0eWxlLndpZHRoO1xuICAgIHZhciBvdXRsaW5lX2NvbG9yID0gc3R5bGUub3V0bGluZSAmJiBzdHlsZS5vdXRsaW5lLmNvbG9yO1xuICAgIHZhciBvdXRsaW5lX3dpZHRoID0gc3R5bGUub3V0bGluZSAmJiBzdHlsZS5vdXRsaW5lLndpZHRoO1xuICAgIHZhciBvdXRsaW5lX2Rhc2ggPSBzdHlsZS5vdXRsaW5lICYmIHN0eWxlLm91dGxpbmUuZGFzaDtcblxuICAgIHZhciBjID0gY29udGV4dDtcbiAgICBjLmJlZ2luUGF0aCgpO1xuICAgIGMuZmlsbFN0eWxlID0gdGhpcy5jb2xvclRvU3RyaW5nKGNvbG9yKTtcbiAgICBjLm1vdmVUbyhzZWdtZW50c1swXS54LCBzZWdtZW50c1swXS55KTtcblxuICAgIGZvciAodmFyIHI9MTsgciA8IHNlZ21lbnRzLmxlbmd0aDsgciArKykge1xuICAgICAgICBjLmxpbmVUbyhzZWdtZW50c1tyXS54LCBzZWdtZW50c1tyXS55KTtcbiAgICB9O1xuXG4gICAgYy5jbG9zZVBhdGgoKTtcbiAgICBjLmZpbGwoKTtcblxuICAgIC8vIE91dGxpbmVcbiAgICBpZiAob3V0bGluZV9jb2xvciAmJiBvdXRsaW5lX3dpZHRoKSB7XG4gICAgICAgIGMuc3Ryb2tlU3R5bGUgPSB0aGlzLmNvbG9yVG9TdHJpbmcob3V0bGluZV9jb2xvcik7XG4gICAgICAgIGMubGluZUNhcCA9ICdyb3VuZCc7XG4gICAgICAgIGMubGluZVdpZHRoID0gb3V0bGluZV93aWR0aDtcbiAgICAgICAgaWYgKGMuc2V0TGluZURhc2gpIHtcbiAgICAgICAgICAgIGlmIChvdXRsaW5lX2Rhc2gpIHtcbiAgICAgICAgICAgICAgICBjLnNldExpbmVEYXNoKG91dGxpbmVfZGFzaC5tYXAoZnVuY3Rpb24gKGQpIHsgcmV0dXJuIGQgKiBvdXRsaW5lX3dpZHRoOyB9KSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBjLnNldExpbmVEYXNoKFtdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjLnN0cm9rZSgpO1xuICAgIH1cbn07XG5cbi8vIFJlbmRlcnMgYSBwb2ludCBnaXZlbiBhcyBhIFBvaW50IG9iamVjdFxuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclBvaW50ID0gZnVuY3Rpb24gcmVuZGVyUG9pbnQgKHBvaW50LCBzdHlsZSwgY29udGV4dClcbntcbiAgICB2YXIgY29sb3IgPSBzdHlsZS5jb2xvcjtcbiAgICB2YXIgc2l6ZSA9IHN0eWxlLnNpemU7XG4gICAgdmFyIG91dGxpbmVfY29sb3IgPSBzdHlsZS5vdXRsaW5lICYmIHN0eWxlLm91dGxpbmUuY29sb3I7XG4gICAgdmFyIG91dGxpbmVfd2lkdGggPSBzdHlsZS5vdXRsaW5lICYmIHN0eWxlLm91dGxpbmUud2lkdGg7XG4gICAgdmFyIG91dGxpbmVfZGFzaCA9IHN0eWxlLm91dGxpbmUgJiYgc3R5bGUub3V0bGluZS5kYXNoO1xuXG4gICAgdmFyIGMgPSBjb250ZXh0O1xuICAgIGMuZmlsbFN0eWxlID0gdGhpcy5jb2xvclRvU3RyaW5nKGNvbG9yKTtcblxuICAgIGMuYmVnaW5QYXRoKCk7XG4gICAgYy5hcmMocG9pbnQueCwgcG9pbnQueSwgc2l6ZSwgMCwgMiAqIE1hdGguUEkpO1xuICAgIGMuY2xvc2VQYXRoKCk7XG4gICAgYy5maWxsKCk7XG5cbiAgICAvLyBPdXRsaW5lXG4gICAgaWYgKG91dGxpbmVfY29sb3IgJiYgb3V0bGluZV93aWR0aCkge1xuICAgICAgICBjLnN0cm9rZVN0eWxlID0gdGhpcy5jb2xvclRvU3RyaW5nKG91dGxpbmVfY29sb3IpO1xuICAgICAgICBjLmxpbmVXaWR0aCA9IG91dGxpbmVfd2lkdGg7XG4gICAgICAgIGlmIChjLnNldExpbmVEYXNoKSB7XG4gICAgICAgICAgICBpZiAob3V0bGluZV9kYXNoKSB7XG4gICAgICAgICAgICAgICAgYy5zZXRMaW5lRGFzaChvdXRsaW5lX2Rhc2gubWFwKGZ1bmN0aW9uIChkKSB7IHJldHVybiBkICogb3V0bGluZV93aWR0aDsgfSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgYy5zZXRMaW5lRGFzaChbXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYy5zdHJva2UoKTtcbiAgICB9XG59O1xuXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyRmVhdHVyZSA9IGZ1bmN0aW9uIHJlbmRlckZlYXR1cmUgKGZlYXR1cmUsIHN0eWxlLCBjb250ZXh0KVxue1xuICAgIHZhciBnLCBoLCBwb2x5cztcbiAgICB2YXIgZ2VvbWV0cnkgPSBmZWF0dXJlLmdlb21ldHJ5O1xuXG4gICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIHRoaXMucmVuZGVyTGluZShnZW9tZXRyeS5waXhlbHMsIHN0eWxlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnTXVsdGlMaW5lU3RyaW5nJykge1xuICAgICAgICBmb3IgKGc9MDsgZyA8IGdlb21ldHJ5LnBpeGVscy5sZW5ndGg7IGcrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJMaW5lKGdlb21ldHJ5LnBpeGVsc1tnXSwgc3R5bGUsIGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nKSB7XG4gICAgICAgICAgICBwb2x5cyA9IFtnZW9tZXRyeS5waXhlbHNdOyAvLyB0cmVhdCBQb2x5Z29uIGFzIGEgZGVnZW5lcmF0ZSBNdWx0aVBvbHlnb24gdG8gYXZvaWQgZHVwbGljYXRpbmcgY29kZVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcG9seXMgPSBnZW9tZXRyeS5waXhlbHM7XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGc9MDsgZyA8IHBvbHlzLmxlbmd0aDsgZysrKSB7XG4gICAgICAgICAgICAvLyBQb2x5Z29ucyB3aXRoIGhvbGVzOlxuICAgICAgICAgICAgLy8gUmVuZGVyIHRvIGEgc2VwYXJhdGUgY2FudmFzLCB1c2luZyBjb21wb3NpdGUgb3BlcmF0aW9ucyB0byBjdXQgaG9sZXMgb3V0IG9mIHBvbHlnb24sIHRoZW4gY29weSBiYWNrIHRvIHRoZSBtYWluIGNhbnZhc1xuICAgICAgICAgICAgaWYgKHBvbHlzW2ddLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMud2lkdGggIT0gY29udGV4dC5jYW52YXMud2lkdGggfHwgdGhpcy5jdXRvdXRfY29udGV4dC5jYW52YXMuaGVpZ2h0ICE9IGNvbnRleHQuY2FudmFzLmhlaWdodCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1dG91dF9jb250ZXh0LmNhbnZhcy53aWR0aCA9IGNvbnRleHQuY2FudmFzLndpZHRoO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmN1dG91dF9jb250ZXh0LmNhbnZhcy5oZWlnaHQgPSBjb250ZXh0LmNhbnZhcy5oZWlnaHQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMuY3V0b3V0X2NvbnRleHQuY2xlYXJSZWN0KDAsIDAsIHRoaXMuY3V0b3V0X2NvbnRleHQuY2FudmFzLndpZHRoLCB0aGlzLmN1dG91dF9jb250ZXh0LmNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXRvdXRfY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnc291cmNlLW92ZXInO1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUG9seWdvbihwb2x5c1tnXVswXSwgc3R5bGUsIHRoaXMuY3V0b3V0X2NvbnRleHQpO1xuXG4gICAgICAgICAgICAgICAgdGhpcy5jdXRvdXRfY29udGV4dC5nbG9iYWxDb21wb3NpdGVPcGVyYXRpb24gPSAnZGVzdGluYXRpb24tb3V0JztcbiAgICAgICAgICAgICAgICBmb3IgKGg9MTsgaCA8IHBvbHlzW2ddLmxlbmd0aDsgaCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUG9seWdvbihwb2x5c1tnXVtoXSwgc3R5bGUsIHRoaXMuY3V0b3V0X2NvbnRleHQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb250ZXh0LmRyYXdJbWFnZSh0aGlzLmN1dG91dF9jb250ZXh0LmNhbnZhcywgMCwgMCk7XG5cbiAgICAgICAgICAgICAgICAvLyBBZnRlciBjb21wb3NpdGluZyBiYWNrIHRvIG1haW4gY2FudmFzLCBkcmF3IG91dGxpbmVzIG9uIGhvbGVzXG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlLm91dGxpbmUgJiYgc3R5bGUub3V0bGluZS5jb2xvcikge1xuICAgICAgICAgICAgICAgICAgICBmb3IgKGg9MTsgaCA8IHBvbHlzW2ddLmxlbmd0aDsgaCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckxpbmUocG9seXNbZ11baF0sIHN0eWxlLm91dGxpbmUsIGNvbnRleHQpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUmVndWxhciBjbG9zZWQgcG9seWdvbnNcbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyUG9seWdvbihwb2x5c1tnXVswXSwgc3R5bGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgICB0aGlzLnJlbmRlclBvaW50KGdlb21ldHJ5LnBpeGVscywgc3R5bGUsIGNvbnRleHQpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICBmb3IgKGc9MDsgZyA8IGdlb21ldHJ5LnBpeGVscy5sZW5ndGg7IGcrKykge1xuICAgICAgICAgICAgdGhpcy5yZW5kZXJQb2ludChnZW9tZXRyeS5waXhlbHNbZ10sIHN0eWxlLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbi8vIFJlbmRlciBhIEdlb0pTT04gdGlsZSBvbnRvIGNhbnZhc1xuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLnJlbmRlclRpbGUgPSBmdW5jdGlvbiByZW5kZXJUaWxlICh0aWxlLCBjb250ZXh0KVxue1xuICAgIHZhciByZW5kZXJlciA9IHRoaXM7XG4gICAgdmFyIHN0eWxlO1xuXG4gICAgLy8gU2VsZWN0aW9uIHJlbmRlcmluZyAtIG9mZi1zY3JlZW4gY2FudmFzIHRvIHJlbmRlciBhIGNvbGxpc2lvbiBtYXAgZm9yIGZlYXR1cmUgc2VsZWN0aW9uXG4gICAgdmFyIHNlbGVjdGlvbiA9IHsgY29sb3JzOiB7fSB9O1xuICAgIHZhciBzZWxlY3Rpb25fY2FudmFzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgc2VsZWN0aW9uX2NhbnZhcy5zdHlsZS53aWR0aCA9IEdlby50aWxlX3NpemUgKyAncHgnO1xuICAgIHNlbGVjdGlvbl9jYW52YXMuc3R5bGUud2lkdGggPSBHZW8udGlsZV9zaXplICsgJ3B4JztcbiAgICBzZWxlY3Rpb25fY2FudmFzLndpZHRoID0gTWF0aC5yb3VuZChHZW8udGlsZV9zaXplICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIHNlbGVjdGlvbl9jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChHZW8udGlsZV9zaXplICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pO1xuXG4gICAgdmFyIHNlbGVjdGlvbl9jb250ZXh0ID0gc2VsZWN0aW9uX2NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgIHZhciBzZWxlY3Rpb25fY29sb3I7XG4gICAgdmFyIHNlbGVjdGlvbl9jb3VudCA9IDA7XG5cbiAgICAvLyBSZW5kZXIgbGF5ZXJzXG4gICAgZm9yICh2YXIgdCBpbiByZW5kZXJlci5sYXllcnMpIHtcbiAgICAgICAgdmFyIGxheWVyID0gcmVuZGVyZXIubGF5ZXJzW3RdO1xuICAgICAgICB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlcy5mb3JFYWNoKGZ1bmN0aW9uKGZlYXR1cmUpIHtcbiAgICAgICAgICAgIC8vIFNjYWxlIGxvY2FsIGNvb3JkcyB0byB0aWxlIHBpeGVsc1xuICAgICAgICAgICAgZmVhdHVyZS5nZW9tZXRyeS5waXhlbHMgPSB0aGlzLnNjYWxlR2VvbWV0cnlUb1BpeGVscyhmZWF0dXJlLmdlb21ldHJ5LCByZW5kZXJlci50aWxlX21pbiwgcmVuZGVyZXIudGlsZV9tYXgpO1xuICAgICAgICAgICAgc3R5bGUgPSBWZWN0b3JSZW5kZXJlci5wYXJzZVN0eWxlRm9yRmVhdHVyZShmZWF0dXJlLCB0aGlzLnN0eWxlc1tsYXllci5uYW1lXSwgdGlsZSk7XG5cbiAgICAgICAgICAgIC8vIERyYXcgdmlzaWJsZSBnZW9tZXRyeVxuICAgICAgICAgICAgaWYgKGxheWVyLnZpc2libGUgIT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlbmRlckZlYXR1cmUoZmVhdHVyZSwgc3R5bGUsIGNvbnRleHQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBEcmF3IG1hc2sgZm9yIGludGVyYWN0aXZpdHlcbiAgICAgICAgICAgIC8vIFRPRE86IG1vdmUgc2VsZWN0aW9uIGZpbHRlciBsb2dpYyB0byBzdHlsZXNoZWV0XG4gICAgICAgICAgICAvLyBUT0RPOiBvbmx5IGFsdGVyIHN0eWxlcyB0aGF0IGFyZSBleHBsaWNpdGx5IGRpZmZlcmVudCwgZG9uJ3QgbWFudWFsbHkgY29weSBzdHlsZSB2YWx1ZXMgYnkgcHJvcGVydHkgbmFtZVxuICAgICAgICAgICAgaWYgKGxheWVyLnNlbGVjdGlvbiA9PSB0cnVlICYmIGZlYXR1cmUucHJvcGVydGllcy5uYW1lICE9IG51bGwgJiYgZmVhdHVyZS5wcm9wZXJ0aWVzLm5hbWUgIT0gJycpIHtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25fY29sb3IgPSB0aGlzLmdlbmVyYXRlQ29sb3Ioc2VsZWN0aW9uLmNvbG9ycyk7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX2NvbG9yLnByb3BlcnRpZXMgPSBmZWF0dXJlLnByb3BlcnRpZXM7XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uX2NvdW50Kys7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJGZWF0dXJlKGZlYXR1cmUsIHsgY29sb3I6IHNlbGVjdGlvbl9jb2xvci5jb2xvciwgd2lkdGg6IHN0eWxlLndpZHRoLCBzaXplOiBzdHlsZS5zaXplIH0sIHNlbGVjdGlvbl9jb250ZXh0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIElmIHRoaXMgZ2VvbWV0cnkgaXNuJ3QgaW50ZXJhY3RpdmUsIG1hc2sgaXQgb3V0IHNvIGdlb21ldHJ5IHVuZGVyIGl0IGRvZXNuJ3QgYXBwZWFyIHRvIHBvcCB0aHJvdWdoXG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJGZWF0dXJlKGZlYXR1cmUsIHsgY29sb3I6IFswLCAwLCAwXSwgd2lkdGg6IHN0eWxlLndpZHRoLCBzaXplOiBzdHlsZS5zaXplIH0sIHNlbGVjdGlvbl9jb250ZXh0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICB9LCB0aGlzKTtcbiAgICB9XG5cbiAgICAvLyBTZWxlY3Rpb24gZXZlbnRzXG4gICAgdmFyIHNlbGVjdGlvbl9pbmZvID0gdGhpcy5zZWxlY3Rpb25faW5mbztcbiAgICBpZiAoc2VsZWN0aW9uX2NvdW50ID4gMCkge1xuICAgICAgICB0aGlzLnRpbGVzW3RpbGUua2V5XS5zZWxlY3Rpb24gPSBzZWxlY3Rpb247XG5cbiAgICAgICAgc2VsZWN0aW9uLnBpeGVscyA9IG5ldyBVaW50MzJBcnJheShzZWxlY3Rpb25fY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgc2VsZWN0aW9uX2NhbnZhcy53aWR0aCwgc2VsZWN0aW9uX2NhbnZhcy5oZWlnaHQpLmRhdGEuYnVmZmVyKTtcblxuICAgICAgICAvLyBUT0RPOiBmaXJlIGV2ZW50cyBvbiBzZWxlY3Rpb24gdG8gZW5hYmxlIGN1c3RvbSBiZWhhdmlvclxuICAgICAgICBjb250ZXh0LmNhbnZhcy5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIGhpdCA9IHsgeDogZXZlbnQub2Zmc2V0WCwgeTogZXZlbnQub2Zmc2V0WSB9OyAvLyBsYXllclgvWVxuICAgICAgICAgICAgdmFyIG9mZiA9IChoaXQueSAqIHJlbmRlcmVyLmRldmljZV9waXhlbF9yYXRpbykgKiAoR2VvLnRpbGVfc2l6ZSAqIHJlbmRlcmVyLmRldmljZV9waXhlbF9yYXRpbykgKyAoaGl0LnggKiByZW5kZXJlci5kZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgICAgICAgICAgdmFyIGNvbG9yID0gc2VsZWN0aW9uLnBpeGVsc1tvZmZdO1xuICAgICAgICAgICAgdmFyIGZlYXR1cmUgPSBzZWxlY3Rpb24uY29sb3JzW2NvbG9yXTtcbiAgICAgICAgICAgIGlmIChmZWF0dXJlICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICBjb250ZXh0LmNhbnZhcy5zdHlsZS5jdXJzb3IgPSAnY3Jvc3NoYWlyJztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25faW5mby5zdHlsZS5sZWZ0ID0gKGhpdC54ICsgNSkgKyAncHgnO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLnN0eWxlLnRvcCA9IChoaXQueSArIDUpICsgJ3B4JztcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25faW5mby5pbm5lckhUTUwgPSAnPHNwYW4gY2xhc3M9XCJsYWJlbElubmVyXCI+JyArIGZlYXR1cmUucHJvcGVydGllcy5uYW1lICsgLyonIFsnICsgZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmQgKyAnXSovJzwvc3Bhbj4nO1xuICAgICAgICAgICAgICAgIHNlbGVjdGlvbl9pbmZvLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2FudmFzLnBhcmVudE5vZGUuYXBwZW5kQ2hpbGQoc2VsZWN0aW9uX2luZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgY29udGV4dC5jYW52YXMuc3R5bGUuY3Vyc29yID0gbnVsbDtcbiAgICAgICAgICAgICAgICBzZWxlY3Rpb25faW5mby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIGlmIChzZWxlY3Rpb25faW5mby5wYXJlbnROb2RlID09IGNvbnRleHQuY2FudmFzLnBhcmVudE5vZGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGV4dC5jYW52YXMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzZWxlY3Rpb25faW5mbyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgY29udGV4dC5jYW52YXMub25tb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgICAgIGNvbnRleHQuY2FudmFzLnN0eWxlLmN1cnNvciA9IG51bGw7XG4gICAgICAgICAgICBzZWxlY3Rpb25faW5mby5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuICAgICAgICAgICAgaWYgKHNlbGVjdGlvbl9pbmZvLnBhcmVudE5vZGUgPT0gY29udGV4dC5jYW52YXMucGFyZW50Tm9kZSkge1xuICAgICAgICAgICAgICAgIGNvbnRleHQuY2FudmFzLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoc2VsZWN0aW9uX2luZm8pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH1cbn07XG5cbi8qIENvbG9yIGhlbHBlcnMgKi9cblxuLy8gVHJhbnNmb3JtIGNvbG9yIGNvbXBvbmVudHMgaW4gMC0xIHJhbmdlIHRvIGh0bWwgUkdCIHN0cmluZyBmb3IgY2FudmFzXG5DYW52YXNSZW5kZXJlci5wcm90b3R5cGUuY29sb3JUb1N0cmluZyA9IGZ1bmN0aW9uIChjb2xvcilcbntcbiAgICByZXR1cm4gJ3JnYignICsgY29sb3IubWFwKGZ1bmN0aW9uKGMpIHsgcmV0dXJuIH5+KGMgKiAyNTYpOyB9KS5qb2luKCcsJykgKyAnKSc7XG59O1xuXG4vLyBHZW5lcmF0ZXMgYSByYW5kb20gY29sb3Igbm90IHlldCBwcmVzZW50IGluIHRoZSBwcm92aWRlZCBoYXNoIG9mIGNvbG9yc1xuQ2FudmFzUmVuZGVyZXIucHJvdG90eXBlLmdlbmVyYXRlQ29sb3IgPSBmdW5jdGlvbiBnZW5lcmF0ZUNvbG9yIChjb2xvcl9tYXApXG57XG4gICAgdmFyIHIsIGcsIGIsIGlyLCBpZywgaWIsIGtleTtcbiAgICBjb2xvcl9tYXAgPSBjb2xvcl9tYXAgfHwge307XG4gICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgciA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgIGcgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICBiID0gTWF0aC5yYW5kb20oKTtcblxuICAgICAgICBpciA9IH5+KHIgKiAyNTYpO1xuICAgICAgICBpZyA9IH5+KGcgKiAyNTYpO1xuICAgICAgICBpYiA9IH5+KGIgKiAyNTYpO1xuICAgICAgICBrZXkgPSAoaXIgKyAoaWcgPDwgOCkgKyAoaWIgPDwgMTYpICsgKDI1NSA8PCAyNCkpID4+PiAwOyAvLyBuZWVkIHVuc2lnbmVkIHJpZ2h0IHNoaWZ0IHRvIGNvbnZlcnQgdG8gcG9zaXRpdmUgI1xuXG4gICAgICAgIGlmIChjb2xvcl9tYXBba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICBjb2xvcl9tYXBba2V5XSA9IHsgY29sb3I6IFtyLCBnLCBiXSB9O1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGNvbG9yX21hcFtrZXldO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBDYW52YXNSZW5kZXJlcjtcbn1cbiIsIi8vIE1pc2NlbGxhbmVvdXMgZ2VvIGZ1bmN0aW9uc1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9wb2ludC5qcycpO1xuXG52YXIgR2VvID0ge307XG5cbi8vIFByb2plY3Rpb24gY29uc3RhbnRzXG5HZW8udGlsZV9zaXplID0gMjU2O1xuR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgPSAyMDAzNzUwOC4zNDI3ODkyNDQ7XG5HZW8ubWFwX29yaWdpbl9tZXRlcnMgPSBQb2ludCgtR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMsIEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzKTtcbkdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsID0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgKiAyIC8gR2VvLnRpbGVfc2l6ZTsgLy8gbWluIHpvb20gZHJhd3Mgd29ybGQgYXMgMiB0aWxlcyB3aWRlXG5HZW8ubWV0ZXJzX3Blcl9waXhlbCA9IFtdO1xuR2VvLm1heF96b29tID0gMjA7XG5mb3IgKHZhciB6PTA7IHogPD0gR2VvLm1heF96b29tOyB6KyspIHtcbiAgICBHZW8ubWV0ZXJzX3Blcl9waXhlbFt6XSA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgeik7XG59XG5cbi8vIENvbnZlcnQgdGlsZSBsb2NhdGlvbiB0byBtZXJjYXRvciBtZXRlcnMgLSBtdWx0aXBseSBieSBwaXhlbHMgcGVyIHRpbGUsIHRoZW4gYnkgbWV0ZXJzIHBlciBwaXhlbCwgYWRqdXN0IGZvciBtYXAgb3JpZ2luXG5HZW8ubWV0ZXJzRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIHJldHVybiBQb2ludChcbiAgICAgICAgKHRpbGUueCAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy54LFxuICAgICAgICAoKHRpbGUueSAqIEdlby50aWxlX3NpemUgKiBHZW8ubWV0ZXJzX3Blcl9waXhlbFt0aWxlLnpdKSAqIC0xKSArIEdlby5tYXBfb3JpZ2luX21ldGVycy55XG4gICAgKTtcbn07XG5cbi8vIENvbnZlcnQgbWVyY2F0b3IgbWV0ZXJzIHRvIGxhdC1sbmdcbkdlby5tZXRlcnNUb0xhdExuZyA9IGZ1bmN0aW9uIChtZXRlcnMpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KG1ldGVycyk7XG5cbiAgICBjLnggLz0gR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnM7XG4gICAgYy55IC89IEdlby5oYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzO1xuXG4gICAgYy55ID0gKDIgKiBNYXRoLmF0YW4oTWF0aC5leHAoYy55ICogTWF0aC5QSSkpIC0gKE1hdGguUEkgLyAyKSkgLyBNYXRoLlBJO1xuXG4gICAgYy54ICo9IDE4MDtcbiAgICBjLnkgKj0gMTgwO1xuXG4gICAgcmV0dXJuIGM7XG59O1xuXG4vLyBDb252ZXJ0IGxhdC1sbmcgdG8gbWVyY2F0b3IgbWV0ZXJzXG5HZW8ubGF0TG5nVG9NZXRlcnMgPSBmdW5jdGlvbihsYXRsbmcpXG57XG4gICAgdmFyIGMgPSBQb2ludC5jb3B5KGxhdGxuZyk7XG5cbiAgICAvLyBMYXRpdHVkZVxuICAgIGMueSA9IE1hdGgubG9nKE1hdGgudGFuKChjLnkgKyA5MCkgKiBNYXRoLlBJIC8gMzYwKSkgLyAoTWF0aC5QSSAvIDE4MCk7XG4gICAgYy55ID0gYy55ICogR2VvLmhhbGZfY2lyY3VtZmVyZW5jZV9tZXRlcnMgLyAxODA7XG5cbiAgICAvLyBMb25naXR1ZGVcbiAgICBjLnggPSBjLnggKiBHZW8uaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MDtcblxuICAgIHJldHVybiBjO1xufTtcblxuLy8gUnVuIGEgdHJhbnNmb3JtIGZ1bmN0aW9uIG9uIGVhY2ggY29vb3JkaW5hdGUgaW4gYSBHZW9KU09OIGdlb21ldHJ5XG5HZW8udHJhbnNmb3JtR2VvbWV0cnkgPSBmdW5jdGlvbiAoZ2VvbWV0cnksIHRyYW5zZm9ybSlcbntcbiAgICBpZiAoZ2VvbWV0cnkudHlwZSA9PSAnUG9pbnQnKSB7XG4gICAgICAgIHJldHVybiB0cmFuc2Zvcm0oZ2VvbWV0cnkuY29vcmRpbmF0ZXMpO1xuICAgIH1cbiAgICBlbHNlIGlmIChnZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJyB8fCBnZW9tZXRyeS50eXBlID09ICdNdWx0aVBvaW50Jykge1xuICAgICAgICByZXR1cm4gZ2VvbWV0cnkuY29vcmRpbmF0ZXMubWFwKHRyYW5zZm9ybSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ1BvbHlnb24nIHx8IGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpTGluZVN0cmluZycpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAoY29vcmRpbmF0ZXMpIHtcbiAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKGdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9seWdvbicpIHtcbiAgICAgICAgcmV0dXJuIGdlb21ldHJ5LmNvb3JkaW5hdGVzLm1hcChmdW5jdGlvbiAocG9seWdvbikge1xuICAgICAgICAgICAgcmV0dXJuIHBvbHlnb24ubWFwKGZ1bmN0aW9uIChjb29yZGluYXRlcykge1xuICAgICAgICAgICAgICAgIHJldHVybiBjb29yZGluYXRlcy5tYXAodHJhbnNmb3JtKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLy8gVE9ETzogc3VwcG9ydCBHZW9tZXRyeUNvbGxlY3Rpb25cbiAgICByZXR1cm4ge307XG59O1xuXG5HZW8uYm94SW50ZXJzZWN0ID0gZnVuY3Rpb24gKGIxLCBiMilcbntcbiAgICByZXR1cm4gIShcbiAgICAgICAgYjIuc3cueCA+IGIxLm5lLnggfHxcbiAgICAgICAgYjIubmUueCA8IGIxLnN3LnggfHxcbiAgICAgICAgYjIuc3cueSA+IGIxLm5lLnkgfHxcbiAgICAgICAgYjIubmUueSA8IGIxLnN3LnlcbiAgICApO1xufTtcblxuLy8gU3BsaXQgdGhlIGxpbmVzIG9mIGEgZmVhdHVyZSB3aGVyZXZlciB0d28gcG9pbnRzIGFyZSBmYXJ0aGVyIGFwYXJ0IHRoYW4gYSBnaXZlbiB0b2xlcmFuY2Vcbkdlby5zcGxpdEZlYXR1cmVMaW5lcyAgPSBmdW5jdGlvbiAoZmVhdHVyZSwgdG9sZXJhbmNlKSB7XG4gICAgdmFyIHRvbGVyYW5jZSA9IHRvbGVyYW5jZSB8fCAwLjAwMTtcbiAgICB2YXIgdG9sZXJhbmNlX3NxID0gdG9sZXJhbmNlICogdG9sZXJhbmNlO1xuICAgIHZhciBnZW9tID0gZmVhdHVyZS5nZW9tZXRyeTtcbiAgICB2YXIgbGluZXM7XG5cbiAgICBpZiAoZ2VvbS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gZ2VvbS5jb29yZGluYXRlcztcbiAgICB9XG4gICAgZWxzZSBpZiAoZ2VvbS50eXBlID09J0xpbmVTdHJpbmcnKSB7XG4gICAgICAgIGxpbmVzID0gW2dlb20uY29vcmRpbmF0ZXNdO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGZlYXR1cmU7XG4gICAgfVxuXG4gICAgdmFyIHNwbGl0X2xpbmVzID0gW107XG5cbiAgICBmb3IgKHZhciBzPTA7IHMgPCBsaW5lcy5sZW5ndGg7IHMrKykge1xuICAgICAgICB2YXIgc2VnID0gbGluZXNbc107XG4gICAgICAgIHZhciBzcGxpdF9zZWcgPSBbXTtcbiAgICAgICAgdmFyIGxhc3RfY29vcmQgPSBudWxsO1xuICAgICAgICB2YXIga2VlcDtcblxuICAgICAgICBmb3IgKHZhciBjPTA7IGMgPCBzZWcubGVuZ3RoOyBjKyspIHtcbiAgICAgICAgICAgIHZhciBjb29yZCA9IHNlZ1tjXTtcbiAgICAgICAgICAgIGtlZXAgPSB0cnVlO1xuXG4gICAgICAgICAgICBpZiAobGFzdF9jb29yZCAhPSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRpc3QgPSAoY29vcmRbMF0gLSBsYXN0X2Nvb3JkWzBdKSAqIChjb29yZFswXSAtIGxhc3RfY29vcmRbMF0pICsgKGNvb3JkWzFdIC0gbGFzdF9jb29yZFsxXSkgKiAoY29vcmRbMV0gLSBsYXN0X2Nvb3JkWzFdKTtcbiAgICAgICAgICAgICAgICBpZiAoZGlzdCA+IHRvbGVyYW5jZV9zcSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhcInNwbGl0IGxpbmVzIGF0IChcIiArIGNvb3JkWzBdICsgXCIsIFwiICsgY29vcmRbMV0gKyBcIiksIFwiICsgTWF0aC5zcXJ0KGRpc3QpICsgXCIgYXBhcnRcIik7XG4gICAgICAgICAgICAgICAgICAgIGtlZXAgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChrZWVwID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgc3BsaXRfbGluZXMucHVzaChzcGxpdF9zZWcpO1xuICAgICAgICAgICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgc3BsaXRfc2VnLnB1c2goY29vcmQpO1xuXG4gICAgICAgICAgICBsYXN0X2Nvb3JkID0gY29vcmQ7XG4gICAgICAgIH1cblxuICAgICAgICBzcGxpdF9saW5lcy5wdXNoKHNwbGl0X3NlZyk7XG4gICAgICAgIHNwbGl0X3NlZyA9IFtdO1xuICAgIH1cblxuICAgIGlmIChzcGxpdF9saW5lcy5sZW5ndGggPT0gMSkge1xuICAgICAgICBnZW9tLnR5cGUgPSAnTGluZVN0cmluZyc7XG4gICAgICAgIGdlb20uY29vcmRpbmF0ZXMgPSBzcGxpdF9saW5lc1swXTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGdlb20udHlwZSA9ICdNdWx0aUxpbmVTdHJpbmcnO1xuICAgICAgICBnZW9tLmNvb3JkaW5hdGVzID0gc3BsaXRfbGluZXM7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZlYXR1cmU7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdlbztcbn1cbiIsIi8vIFdlYkdMIG1hbmFnZW1lbnQgYW5kIHJlbmRlcmluZyBmdW5jdGlvbnNcbnZhciBHTCA9IHt9O1xuXG4vLyBTZXR1cCBhIFdlYkdMIGNvbnRleHRcbi8vIElmIG5vIGNhbnZhcyBlbGVtZW50IGlzIHByb3ZpZGVkLCBvbmUgaXMgY3JlYXRlZCBhbmQgYWRkZWQgdG8gdGhlIGRvY3VtZW50IGJvZHlcbkdMLmdldENvbnRleHQgPSBmdW5jdGlvbiBnZXRDb250ZXh0IChjYW52YXMpXG57XG4gICAgdmFyIGNhbnZhcyA9IGNhbnZhcztcbiAgICB2YXIgZnVsbHNjcmVlbiA9IGZhbHNlO1xuICAgIGlmIChjYW52YXMgPT0gbnVsbCkge1xuICAgICAgICBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICAgICAgY2FudmFzLnN0eWxlLnBvc2l0aW9uID0gJ2Fic29sdXRlJztcbiAgICAgICAgY2FudmFzLnN0eWxlLnRvcCA9IDA7XG4gICAgICAgIGNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICAgICAgY2FudmFzLnN0eWxlLnpJbmRleCA9IC0xO1xuICAgICAgICBkb2N1bWVudC5ib2R5LmFwcGVuZENoaWxkKGNhbnZhcyk7XG4gICAgICAgIGZ1bGxzY3JlZW4gPSB0cnVlO1xuICAgIH1cblxuICAgIGdsID0gY2FudmFzLmdldENvbnRleHQoJ2V4cGVyaW1lbnRhbC13ZWJnbCcsIHsgLypwcmVzZXJ2ZURyYXdpbmdCdWZmZXI6IHRydWUqLyB9KTsgLy8gcHJlc2VydmVEcmF3aW5nQnVmZmVyIG5lZWRlZCBmb3IgZ2wucmVhZFBpeGVscyAoY291bGQgYmUgdXNlZCBmb3IgZmVhdHVyZSBzZWxlY3Rpb24pXG4gICAgaWYgKCFnbCkge1xuICAgICAgICBhbGVydChcIkNvdWxkbid0IGNyZWF0ZSBXZWJHTCBjb250ZXh0LiBZb3VyIGJyb3dzZXIgcHJvYmFibHkgZG9lc24ndCBzdXBwb3J0IFdlYkdMIG9yIGl0J3MgdHVybmVkIG9mZj9cIik7XG4gICAgICAgIHRocm93IFwiQ291bGRuJ3QgY3JlYXRlIFdlYkdMIGNvbnRleHRcIjtcbiAgICB9XG5cbiAgICBHTC5yZXNpemVDYW52YXMoZ2wsIHdpbmRvdy5pbm5lcldpZHRoLCB3aW5kb3cuaW5uZXJIZWlnaHQpO1xuICAgIGlmIChmdWxsc2NyZWVuID09IHRydWUpIHtcbiAgICAgICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIEdMLnJlc2l6ZUNhbnZhcyhnbCwgd2luZG93LmlubmVyV2lkdGgsIHdpbmRvdy5pbm5lckhlaWdodCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmluaXQoZ2wpOyAvLyBUT0RPOiB0aGlzIHBhdHRlcm4gZG9lc24ndCBzdXBwb3J0IG11bHRpcGxlIGFjdGl2ZSBHTCBjb250ZXh0cywgc2hvdWxkIHRoYXQgZXZlbiBiZSBzdXBwb3J0ZWQ/XG5cbiAgICByZXR1cm4gZ2w7XG59O1xuXG5HTC5yZXNpemVDYW52YXMgPSBmdW5jdGlvbiAoZ2wsIHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdmFyIGRldmljZV9waXhlbF9yYXRpbyA9IHdpbmRvdy5kZXZpY2VQaXhlbFJhdGlvIHx8IDE7XG4gICAgZ2wuY2FudmFzLnN0eWxlLndpZHRoID0gd2lkdGggKyAncHgnO1xuICAgIGdsLmNhbnZhcy5zdHlsZS5oZWlnaHQgPSBoZWlnaHQgKyAncHgnO1xuICAgIGdsLmNhbnZhcy53aWR0aCA9IE1hdGgucm91bmQoZ2wuY2FudmFzLnN0eWxlLndpZHRoICogZGV2aWNlX3BpeGVsX3JhdGlvKTtcbiAgICBnbC5jYW52YXMuaGVpZ2h0ID0gTWF0aC5yb3VuZChnbC5jYW52YXMuc3R5bGUud2lkdGggKiBkZXZpY2VfcGl4ZWxfcmF0aW8pO1xuICAgIGdsLnZpZXdwb3J0KDAsIDAsIGdsLmNhbnZhcy53aWR0aCwgZ2wuY2FudmFzLmhlaWdodCk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgZWxlbWVudHNcbkdMLmNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgPSBmdW5jdGlvbiBHTGNyZWF0ZVByb2dyYW1Gcm9tRWxlbWVudHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX2lkLCBmcmFnbWVudF9zaGFkZXJfaWQpXG57XG4gICAgdmFyIHZlcnRleF9zaGFkZXJfc291cmNlID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQodmVydGV4X3NoYWRlcl9pZCkudGV4dENvbnRlbnQ7XG4gICAgdmFyIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChmcmFnbWVudF9zaGFkZXJfaWQpLnRleHRDb250ZW50O1xuICAgIHZhciBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpO1xuICAgIHJldHVybiBHTC51cGRhdGVQcm9ncmFtKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG59O1xuXG4vLyBDb21waWxlICYgbGluayBhIFdlYkdMIHByb2dyYW0gZnJvbSBwcm92aWRlZCB2ZXJ0ZXggYW5kIHNoYWRlciBzb3VyY2UgVVJMc1xuLy8gTk9URTogbG9hZHMgdmlhIHN5bmNocm9ub3VzIFhIUiBmb3Igc2ltcGxpY2l0eSwgY291bGQgYmUgbWFkZSBhc3luY1xuR0wuY3JlYXRlUHJvZ3JhbUZyb21VUkxzID0gZnVuY3Rpb24gR0xjcmVhdGVQcm9ncmFtRnJvbVVSTHMgKGdsLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybClcbntcbiAgICB2YXIgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbUZyb21VUkxzKGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfc2hhZGVyX3VybCwgZnJhZ21lbnRfc2hhZGVyX3VybCk7XG59O1xuXG5HTC51cGRhdGVQcm9ncmFtRnJvbVVSTHMgPSBmdW5jdGlvbiBHTFVwZGF0ZVByb2dyYW1Gcm9tVVJMcyAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfdXJsLCBmcmFnbWVudF9zaGFkZXJfdXJsKVxue1xuICAgIHZhciB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG5cbiAgICByZXEub25sb2FkID0gZnVuY3Rpb24gKCkgeyB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgdmVydGV4X3NoYWRlcl91cmwgKyAnPycgKyAoK25ldyBEYXRlKCkpLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuXG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICByZXEub3BlbignR0VUJywgZnJhZ21lbnRfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5zZW5kKCk7XG5cbiAgICByZXR1cm4gR0wudXBkYXRlUHJvZ3JhbShnbCwgcHJvZ3JhbSwgdmVydGV4X3NoYWRlcl9zb3VyY2UsIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UpO1xufTtcblxuLy8gQ29tcGlsZSAmIGxpbmsgYSBXZWJHTCBwcm9ncmFtIGZyb20gcHJvdmlkZWQgdmVydGV4IGFuZCBmcmFnbWVudCBzaGFkZXIgc291cmNlc1xuLy8gdXBkYXRlIGEgcHJvZ3JhbSBpZiBvbmUgaXMgcGFzc2VkIGluLiBDcmVhdGUgb25lIGlmIG5vdC4gQWxlcnQgYW5kIGRvbid0IHVwZGF0ZSBhbnl0aGluZyBpZiB0aGUgc2hhZGVycyBkb24ndCBjb21waWxlLlxuR0wudXBkYXRlUHJvZ3JhbSA9IGZ1bmN0aW9uIEdMdXBkYXRlUHJvZ3JhbSAoZ2wsIHByb2dyYW0sIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlKVxue1xuICAgIHRyeSB7XG4gICAgICAgIHZhciB2ZXJ0ZXhfc2hhZGVyID0gR0wuY3JlYXRlU2hhZGVyKGdsLCB2ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgZ2wuVkVSVEVYX1NIQURFUik7XG4gICAgICAgIHZhciBmcmFnbWVudF9zaGFkZXIgPSBHTC5jcmVhdGVTaGFkZXIoZ2wsICcjaWZkZWYgR0xfRVNcXG5wcmVjaXNpb24gaGlnaHAgZmxvYXQ7XFxuI2VuZGlmXFxuXFxuJyArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2UsIGdsLkZSQUdNRU5UX1NIQURFUik7XG4gICAgfVxuICAgIGNhdGNoKGVycilcbiAgICB7XG4gICAgICAgIGFsZXJ0KGVycik7XG4gICAgICAgIHJldHVybiBwcm9ncmFtO1xuICAgIH1cblxuICAgIGdsLnVzZVByb2dyYW0obnVsbCk7XG4gICAgaWYgKHByb2dyYW0gIT0gbnVsbCkge1xuICAgICAgICB2YXIgb2xkX3NoYWRlcnMgPSBnbC5nZXRBdHRhY2hlZFNoYWRlcnMocHJvZ3JhbSk7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBvbGRfc2hhZGVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZ2wuZGV0YWNoU2hhZGVyKHByb2dyYW0sIG9sZF9zaGFkZXJzW2ldKTtcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIHByb2dyYW0gPSBnbC5jcmVhdGVQcm9ncmFtKCk7XG4gICAgfVxuXG4gICAgaWYgKHZlcnRleF9zaGFkZXIgPT0gbnVsbCB8fCBmcmFnbWVudF9zaGFkZXIgPT0gbnVsbCkge1xuICAgICAgICByZXR1cm4gcHJvZ3JhbTtcbiAgICB9XG5cbiAgICBnbC5hdHRhY2hTaGFkZXIocHJvZ3JhbSwgdmVydGV4X3NoYWRlcik7XG4gICAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5kZWxldGVTaGFkZXIodmVydGV4X3NoYWRlcik7XG4gICAgZ2wuZGVsZXRlU2hhZGVyKGZyYWdtZW50X3NoYWRlcik7XG5cbiAgICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKTtcblxuICAgIGlmICghZ2wuZ2V0UHJvZ3JhbVBhcmFtZXRlcihwcm9ncmFtLCBnbC5MSU5LX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHByb2dyYW1fZXJyb3IgPVxuICAgICAgICAgICAgXCJXZWJHTCBwcm9ncmFtIGVycm9yOlxcblwiICtcbiAgICAgICAgICAgIFwiVkFMSURBVEVfU1RBVFVTOiBcIiArIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuVkFMSURBVEVfU1RBVFVTKSArIFwiXFxuXCIgK1xuICAgICAgICAgICAgXCJFUlJPUjogXCIgKyBnbC5nZXRFcnJvcigpICsgXCJcXG5cXG5cIiArXG4gICAgICAgICAgICBcIi0tLSBWZXJ0ZXggU2hhZGVyIC0tLVxcblwiICsgdmVydGV4X3NoYWRlcl9zb3VyY2UgKyBcIlxcblxcblwiICtcbiAgICAgICAgICAgIFwiLS0tIEZyYWdtZW50IFNoYWRlciAtLS1cXG5cIiArIGZyYWdtZW50X3NoYWRlcl9zb3VyY2U7XG4gICAgICAgIHRocm93IHByb2dyYW1fZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHByb2dyYW07XG59O1xuXG4vLyBDb21waWxlIGEgdmVydGV4IG9yIGZyYWdtZW50IHNoYWRlciBmcm9tIHByb3ZpZGVkIHNvdXJjZVxuR0wuY3JlYXRlU2hhZGVyID0gZnVuY3Rpb24gR0xjcmVhdGVTaGFkZXIgKGdsLCBzb3VyY2UsIHR5cGUpXG57XG4gICAgdmFyIHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcih0eXBlKTtcblxuICAgIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNvdXJjZSk7XG4gICAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpO1xuXG4gICAgaWYgKCFnbC5nZXRTaGFkZXJQYXJhbWV0ZXIoc2hhZGVyLCBnbC5DT01QSUxFX1NUQVRVUykpIHtcbiAgICAgICAgdmFyIHNoYWRlcl9lcnJvciA9XG4gICAgICAgICAgICBcIldlYkdMIHNoYWRlciBlcnJvcjpcXG5cIiArXG4gICAgICAgICAgICAodHlwZSA9PSBnbC5WRVJURVhfU0hBREVSID8gXCJWRVJURVhcIiA6IFwiRlJBR01FTlRcIikgKyBcIiBTSEFERVI6XFxuXCIgK1xuICAgICAgICAgICAgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpO1xuICAgICAgICB0aHJvdyBzaGFkZXJfZXJyb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNoYWRlcjtcbn07XG5cbi8vIFRoaW4gR0wgcHJvZ3JhbSBsYXllciB0byBjYWNoZSB1bmlmb3JtIGxvY2F0aW9ucy92YWx1ZXMsIGRvIGNvbXBpbGUtdGltZSBwcmUtcHJvY2Vzc2luZyAoaW5qZWN0aW5nICNkZWZpbmVzIGludG8gc2hhZGVycyksIGV0Yy5cbkdMLlByb2dyYW0gPSBmdW5jdGlvbiAoZ2wsIHZlcnRleF9zaGFkZXJfc291cmNlLCBmcmFnbWVudF9zaGFkZXJfc291cmNlLCBvcHRpb25zKVxue1xuICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgdGhpcy5nbCA9IGdsO1xuICAgIHRoaXMucHJvZ3JhbSA9IG51bGw7XG4gICAgdGhpcy5kZWZpbmVzID0gb3B0aW9ucy5kZWZpbmVzIHx8IHt9OyAvLyBrZXkvdmFsdWVzIGluc2VydGVkIGludG8gc2hhZGVycyBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLnVuaWZvcm1zID0ge307IC8vIHByb2dyYW0gbG9jYXRpb25zIG9mIHVuaWZvcm1zLCBzZXQvdXBkYXRlZCBhdCBjb21waWxlLXRpbWVcbiAgICB0aGlzLmF0dHJpYnMgPSB7fTsgLy8gcHJvZ3JhbSBsb2NhdGlvbnMgb2YgdmVydGV4IGF0dHJpYnV0ZXNcbiAgICB0aGlzLnZlcnRleF9zaGFkZXJfc291cmNlID0gdmVydGV4X3NoYWRlcl9zb3VyY2U7XG4gICAgdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlID0gZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLmNvbXBpbGUoKTtcbn07XG5cbi8vIENyZWF0ZXMgYSBwcm9ncmFtIHRoYXQgd2lsbCByZWZyZXNoIGZyb20gc291cmNlIFVSTHMgZWFjaCB0aW1lIGl0IGlzIGNvbXBpbGVkXG5HTC5Qcm9ncmFtLmNyZWF0ZVByb2dyYW1Gcm9tVVJMcyA9IGZ1bmN0aW9uIChnbCwgdmVydGV4X3NoYWRlcl91cmwsIGZyYWdtZW50X3NoYWRlcl91cmwsIG9wdGlvbnMpXG57XG4gICAgdmFyIHByb2dyYW0gPSBPYmplY3QuY3JlYXRlKEdMLlByb2dyYW0ucHJvdG90eXBlKTtcblxuICAgIHByb2dyYW0udmVydGV4X3NoYWRlcl91cmwgPSB2ZXJ0ZXhfc2hhZGVyX3VybDtcbiAgICBwcm9ncmFtLmZyYWdtZW50X3NoYWRlcl91cmwgPSBmcmFnbWVudF9zaGFkZXJfdXJsO1xuXG4gICAgcHJvZ3JhbS51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBzb3VyY2U7XG4gICAgICAgIHZhciByZXEgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICAgICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgc291cmNlID0gcmVxLnJlc3BvbnNlOyB9O1xuICAgICAgICByZXEub3BlbignR0VUJywgdGhpcy52ZXJ0ZXhfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBwcm9ncmFtLnVwZGF0ZUZyYWdtZW50U2hhZGVyU291cmNlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc291cmNlO1xuICAgICAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IHNvdXJjZSA9IHJlcS5yZXNwb25zZTsgfTtcbiAgICAgICAgcmVxLm9wZW4oJ0dFVCcsIHRoaXMuZnJhZ21lbnRfc2hhZGVyX3VybCArICc/JyArICgrbmV3IERhdGUoKSksIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgICAgICByZXEuc2VuZCgpO1xuICAgICAgICByZXR1cm4gc291cmNlO1xuICAgIH07XG5cbiAgICBHTC5Qcm9ncmFtLmNhbGwocHJvZ3JhbSwgZ2wsIG51bGwsIG51bGwsIG9wdGlvbnMpO1xuICAgIHJldHVybiBwcm9ncmFtO1xufTtcblxuLy8gR2xvYmFsIGRlZmluZXMgYXBwbGllZCB0byBhbGwgcHJvZ3JhbXMgKGR1cGxpY2F0ZSBwcm9wZXJ0aWVzIGZvciBhIHNwZWNpZmljIHByb2dyYW0gd2lsbCB0YWtlIHByZWNlZGVuY2UpXG5HTC5Qcm9ncmFtLmRlZmluZXMgPSB7fTtcblxuR0wuUHJvZ3JhbS5wcm90b3R5cGUuY29tcGlsZSA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gT3B0aW9uYWxseSB1cGRhdGUgc291cmNlc1xuICAgIGlmICh0eXBlb2YgdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLnZlcnRleF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVWZXJ0ZXhTaGFkZXJTb3VyY2UoKTtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB0aGlzLnVwZGF0ZUZyYWdtZW50U2hhZGVyU291cmNlID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5mcmFnbWVudF9zaGFkZXJfc291cmNlID0gdGhpcy51cGRhdGVGcmFnbWVudFNoYWRlclNvdXJjZSgpO1xuICAgIH1cblxuICAgIC8vIEluamVjdCBkZWZpbmVzIChnbG9iYWwsIHRoZW4gcHJvZ3JhbS1zcGVjaWZpYylcbiAgICB2YXIgZGVmaW5lcyA9IHt9O1xuICAgIGZvciAodmFyIGQgaW4gR0wuUHJvZ3JhbS5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSBHTC5Qcm9ncmFtLmRlZmluZXNbZF07XG4gICAgfVxuICAgIGZvciAodmFyIGQgaW4gdGhpcy5kZWZpbmVzKSB7XG4gICAgICAgIGRlZmluZXNbZF0gPSB0aGlzLmRlZmluZXNbZF07XG4gICAgfVxuXG4gICAgdmFyIGRlZmluZV9zdHIgPSBcIlwiO1xuICAgIGZvciAodmFyIGQgaW4gZGVmaW5lcykge1xuICAgICAgICBpZiAoZGVmaW5lc1tkXSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIGRlZmluZXNbZF0gPT0gJ2Jvb2xlYW4nICYmIGRlZmluZXNbZF0gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgZGVmaW5lX3N0ciArPSBcIiNkZWZpbmUgXCIgKyBkICsgXCJcXG5cIjtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGRlZmluZV9zdHIgKz0gXCIjZGVmaW5lIFwiICsgZCArIFwiIFwiICsgZGVmaW5lc1tkXSArIFwiXFxuXCI7XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5wcm9jZXNzZWRfdmVydGV4X3NoYWRlcl9zb3VyY2UgPSBkZWZpbmVfc3RyICsgdGhpcy52ZXJ0ZXhfc2hhZGVyX3NvdXJjZTtcbiAgICB0aGlzLnByb2Nlc3NlZF9mcmFnbWVudF9zaGFkZXJfc291cmNlID0gZGVmaW5lX3N0ciArIHRoaXMuZnJhZ21lbnRfc2hhZGVyX3NvdXJjZTtcblxuICAgIC8vIENvbXBpbGUgJiBzZXQgdW5pZm9ybXMgdG8gY2FjaGVkIHZhbHVlc1xuICAgIHRoaXMucHJvZ3JhbSA9IEdMLnVwZGF0ZVByb2dyYW0odGhpcy5nbCwgdGhpcy5wcm9ncmFtLCB0aGlzLnByb2Nlc3NlZF92ZXJ0ZXhfc2hhZGVyX3NvdXJjZSwgdGhpcy5wcm9jZXNzZWRfZnJhZ21lbnRfc2hhZGVyX3NvdXJjZSk7XG4gICAgdGhpcy5nbC51c2VQcm9ncmFtKHRoaXMucHJvZ3JhbSk7XG4gICAgdGhpcy5yZWZyZXNoVW5pZm9ybXMoKTtcbiAgICB0aGlzLnJlZnJlc2hBdHRyaWJ1dGVzKCk7XG59O1xuXG4vLyBleDogcHJvZ3JhbS51bmlmb3JtKCczZicsICdwb3NpdGlvbicsIHgsIHksIHopO1xuR0wuUHJvZ3JhbS5wcm90b3R5cGUudW5pZm9ybSA9IGZ1bmN0aW9uIChtZXRob2QsIG5hbWUpIC8vIG1ldGhvZC1hcHByb3ByaWF0ZSBhcmd1bWVudHMgZm9sbG93XG57XG4gICAgdmFyIHVuaWZvcm0gPSAodGhpcy51bmlmb3Jtc1tuYW1lXSA9IHRoaXMudW5pZm9ybXNbbmFtZV0gfHwge30pO1xuICAgIHVuaWZvcm0ubmFtZSA9IG5hbWU7XG4gICAgdW5pZm9ybS5sb2NhdGlvbiA9IHVuaWZvcm0ubG9jYXRpb24gfHwgdGhpcy5nbC5nZXRVbmlmb3JtTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcbiAgICB1bmlmb3JtLm1ldGhvZCA9ICd1bmlmb3JtJyArIG1ldGhvZDtcbiAgICB1bmlmb3JtLnZhbHVlcyA9IEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdGhpcy51cGRhdGVVbmlmb3JtKG5hbWUpO1xufTtcblxuLy8gU2V0IGEgc2luZ2xlIHVuaWZvcm1cbkdMLlByb2dyYW0ucHJvdG90eXBlLnVwZGF0ZVVuaWZvcm0gPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICB2YXIgdW5pZm9ybSA9IHRoaXMudW5pZm9ybXNbbmFtZV07XG4gICAgaWYgKHVuaWZvcm0gPT0gbnVsbCB8fCB1bmlmb3JtLmxvY2F0aW9uID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB0aGlzLmdsW3VuaWZvcm0ubWV0aG9kXS5hcHBseSh0aGlzLmdsLCBbdW5pZm9ybS5sb2NhdGlvbl0uY29uY2F0KHVuaWZvcm0udmFsdWVzKSk7IC8vIGNhbGwgYXBwcm9wcmlhdGUgR0wgdW5pZm9ybSBtZXRob2QgYW5kIHBhc3MgdGhyb3VnaCBhcmd1bWVudHNcbn07XG5cbi8vIFJlZnJlc2ggdW5pZm9ybSBsb2NhdGlvbnMgYW5kIHNldCB0byBsYXN0IGNhY2hlZCB2YWx1ZXNcbkdMLlByb2dyYW0ucHJvdG90eXBlLnJlZnJlc2hVbmlmb3JtcyA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgdSBpbiB0aGlzLnVuaWZvcm1zKSB7XG4gICAgICAgIHRoaXMudW5pZm9ybXNbdV0ubG9jYXRpb24gPSB0aGlzLmdsLmdldFVuaWZvcm1Mb2NhdGlvbih0aGlzLnByb2dyYW0sIHUpO1xuICAgICAgICB0aGlzLnVwZGF0ZVVuaWZvcm0odSk7XG4gICAgfVxufTtcblxuR0wuUHJvZ3JhbS5wcm90b3R5cGUucmVmcmVzaEF0dHJpYnV0ZXMgPSBmdW5jdGlvbiAoKVxue1xuICAgIC8vIHZhciBsZW4gPSB0aGlzLmdsLmdldFByb2dyYW1QYXJhbWV0ZXIodGhpcy5wcm9ncmFtLCB0aGlzLmdsLkFDVElWRV9BVFRSSUJVVEVTKTtcbiAgICAvLyBmb3IgKHZhciBpPTA7IGkgPCBsZW47IGkrKykge1xuICAgIC8vICAgICB2YXIgYSA9IHRoaXMuZ2wuZ2V0QWN0aXZlQXR0cmliKHRoaXMucHJvZ3JhbSwgaSk7XG4gICAgLy8gICAgIGNvbnNvbGUubG9nKGEpO1xuICAgIC8vIH1cbiAgICB0aGlzLmF0dHJpYnMgPSB7fTtcbn07XG5cbi8vIEdldCB0aGUgbG9jYXRpb24gb2YgYSB2ZXJ0ZXggYXR0cmlidXRlXG5HTC5Qcm9ncmFtLnByb3RvdHlwZS5hdHRyaWJ1dGUgPSBmdW5jdGlvbiAobmFtZSlcbntcbiAgICB2YXIgYXR0cmliID0gKHRoaXMuYXR0cmlic1tuYW1lXSA9IHRoaXMuYXR0cmlic1tuYW1lXSB8fCB7fSk7XG4gICAgaWYgKGF0dHJpYi5sb2NhdGlvbiAhPSBudWxsKSB7XG4gICAgICAgIHJldHVybiBhdHRyaWI7XG4gICAgfVxuXG4gICAgYXR0cmliLm5hbWUgPSBuYW1lO1xuICAgIGF0dHJpYi5sb2NhdGlvbiA9IHRoaXMuZ2wuZ2V0QXR0cmliTG9jYXRpb24odGhpcy5wcm9ncmFtLCBuYW1lKTtcblxuICAgIC8vIHZhciBpbmZvID0gdGhpcy5nbC5nZXRBY3RpdmVBdHRyaWIodGhpcy5wcm9ncmFtLCBhdHRyaWIubG9jYXRpb24pO1xuICAgIC8vIGF0dHJpYi50eXBlID0gaW5mby50eXBlO1xuICAgIC8vIGF0dHJpYi5zaXplID0gaW5mby5zaXplO1xuXG4gICAgcmV0dXJuIGF0dHJpYjtcbn07XG5cbi8vIFRyaWFuZ3VsYXRpb24gdXNpbmcgbGlidGVzcy5qcyBwb3J0IG9mIGdsdVRlc3NlbGF0b3Jcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9icmVuZGFua2VubnkvbGlidGVzcy5qc1xudHJ5IHtcbiAgICBHTC50ZXNzZWxhdG9yID0gKGZ1bmN0aW9uIGluaXRUZXNzZWxhdG9yKCkge1xuICAgICAgICAvLyBDYWxsZWQgZm9yIGVhY2ggdmVydGV4IG9mIHRlc3NlbGF0b3Igb3V0cHV0XG4gICAgICAgIGZ1bmN0aW9uIHZlcnRleENhbGxiYWNrKGRhdGEsIHBvbHlWZXJ0QXJyYXkpIHtcbiAgICAgICAgICAgIHBvbHlWZXJ0QXJyYXkucHVzaChbZGF0YVswXSwgZGF0YVsxXV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2FsbGVkIHdoZW4gc2VnbWVudHMgaW50ZXJzZWN0IGFuZCBtdXN0IGJlIHNwbGl0XG4gICAgICAgIGZ1bmN0aW9uIGNvbWJpbmVDYWxsYmFjayhjb29yZHMsIGRhdGEsIHdlaWdodCkge1xuICAgICAgICAgICAgcmV0dXJuIGNvb3JkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbGxlZCB3aGVuIGEgdmVydGV4IHN0YXJ0cyBvciBzdG9wcyBhIGJvdW5kYXJ5IGVkZ2Ugb2YgYSBwb2x5Z29uXG4gICAgICAgIGZ1bmN0aW9uIGVkZ2VDYWxsYmFjayhmbGFnKSB7XG4gICAgICAgICAgICAvLyBOby1vcCBjYWxsYmFjayB0byBmb3JjZSBzaW1wbGUgdHJpYW5nbGUgcHJpbWl0aXZlcyAobm8gdHJpYW5nbGUgc3RyaXBzIG9yIGZhbnMpLlxuICAgICAgICAgICAgLy8gU2VlOiBodHRwOi8vd3d3LmdscHJvZ3JhbW1pbmcuY29tL3JlZC9jaGFwdGVyMTEuaHRtbFxuICAgICAgICAgICAgLy8gXCJTaW5jZSBlZGdlIGZsYWdzIG1ha2Ugbm8gc2Vuc2UgaW4gYSB0cmlhbmdsZSBmYW4gb3IgdHJpYW5nbGUgc3RyaXAsIGlmIHRoZXJlIGlzIGEgY2FsbGJhY2tcbiAgICAgICAgICAgIC8vIGFzc29jaWF0ZWQgd2l0aCBHTFVfVEVTU19FREdFX0ZMQUcgdGhhdCBlbmFibGVzIGVkZ2UgZmxhZ3MsIHRoZSBHTFVfVEVTU19CRUdJTiBjYWxsYmFjayBpc1xuICAgICAgICAgICAgLy8gY2FsbGVkIG9ubHkgd2l0aCBHTF9UUklBTkdMRVMuXCJcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdHTC50ZXNzZWxhdG9yOiBlZGdlIGZsYWc6ICcgKyBmbGFnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciB0ZXNzZWxhdG9yID0gbmV3IGxpYnRlc3MuR2x1VGVzc2VsYXRvcigpO1xuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NDYWxsYmFjayhsaWJ0ZXNzLmdsdUVudW0uR0xVX1RFU1NfVkVSVEVYX0RBVEEsIHZlcnRleENhbGxiYWNrKTtcbiAgICAgICAgdGVzc2VsYXRvci5nbHVUZXNzQ2FsbGJhY2sobGlidGVzcy5nbHVFbnVtLkdMVV9URVNTX0NPTUJJTkUsIGNvbWJpbmVDYWxsYmFjayk7XG4gICAgICAgIHRlc3NlbGF0b3IuZ2x1VGVzc0NhbGxiYWNrKGxpYnRlc3MuZ2x1RW51bS5HTFVfVEVTU19FREdFX0ZMQUcsIGVkZ2VDYWxsYmFjayk7XG5cbiAgICAgICAgLy8gQnJlbmRhbiBLZW5ueTpcbiAgICAgICAgLy8gbGlidGVzcyB3aWxsIHRha2UgM2QgdmVydHMgYW5kIGZsYXR0ZW4gdG8gYSBwbGFuZSBmb3IgdGVzc2VsYXRpb25cbiAgICAgICAgLy8gc2luY2Ugb25seSBkb2luZyAyZCB0ZXNzZWxhdGlvbiBoZXJlLCBwcm92aWRlIHo9MSBub3JtYWwgdG8gc2tpcFxuICAgICAgICAvLyBpdGVyYXRpbmcgb3ZlciB2ZXJ0cyBvbmx5IHRvIGdldCB0aGUgc2FtZSBhbnN3ZXIuXG4gICAgICAgIC8vIGNvbW1lbnQgb3V0IHRvIHRlc3Qgbm9ybWFsLWdlbmVyYXRpb24gY29kZVxuICAgICAgICB0ZXNzZWxhdG9yLmdsdVRlc3NOb3JtYWwoMCwgMCwgMSk7XG5cbiAgICAgICAgcmV0dXJuIHRlc3NlbGF0b3I7XG4gICAgfSkoKTtcblxuICAgIEdMLnRyaWFuZ3VsYXRlUG9seWdvbiA9IGZ1bmN0aW9uIEdMVHJpYW5ndWxhdGUgKGNvbnRvdXJzKVxuICAgIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlVmVydHMgPSBbXTtcbiAgICAgICAgR0wudGVzc2VsYXRvci5nbHVUZXNzQmVnaW5Qb2x5Z29uKHRyaWFuZ2xlVmVydHMpO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY29udG91cnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc0JlZ2luQ29udG91cigpO1xuICAgICAgICAgICAgdmFyIGNvbnRvdXIgPSBjb250b3Vyc1tpXTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgY29udG91ci5sZW5ndGg7IGogKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgY29vcmRzID0gW2NvbnRvdXJbal1bMF0sIGNvbnRvdXJbal1bMV0sIDBdO1xuICAgICAgICAgICAgICAgIEdMLnRlc3NlbGF0b3IuZ2x1VGVzc1ZlcnRleChjb29yZHMsIGNvb3Jkcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRDb250b3VyKCk7XG4gICAgICAgIH1cblxuICAgICAgICBHTC50ZXNzZWxhdG9yLmdsdVRlc3NFbmRQb2x5Z29uKCk7XG4gICAgICAgIHJldHVybiB0cmlhbmdsZVZlcnRzO1xuICAgIH07XG59XG5jYXRjaCAoZSkge1xuICAgIC8vIGNvbnNvbGUubG9nKFwibGlidGVzcyBub3QgZGVmaW5lZCFcIik7XG4gICAgLy8gc2tpcCBpZiBsaWJ0ZXNzIG5vdCBkZWZpbmVkXG59XG5cbi8vIEFkZCBvbmUgb3IgbW9yZSB2ZXJ0aWNlcyB0byBhbiBhcnJheSAoZGVzdGluZWQgdG8gYmUgdXNlZCBhcyBhIEdMIGJ1ZmZlciksICdzdHJpcGluZycgZWFjaCB2ZXJ0ZXggd2l0aCBjb25zdGFudCBkYXRhXG4vLyBVc2VkIGZvciBhZGRpbmcgdmFsdWVzIHRoYXQgYXJlIG9mdGVuIGNvbnN0YW50IHBlciBnZW9tZXRyeSBvciBwb2x5Z29uLCBsaWtlIGNvbG9ycywgbm9ybWFscyAoZm9yIHBvbHlzIHNpdHRpbmcgZmxhdCBvbiBtYXApLCBsYXllciBhbmQgbWF0ZXJpYWwgaW5mbywgZXRjLlxuR0wuYWRkVmVydGljZXMgPSBmdW5jdGlvbiAodmVydGljZXMsIHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKVxue1xuICAgIGlmICh2ZXJ0aWNlcyAhPSBudWxsICYmIHZlcnRpY2VzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gQXJyYXkgb2YgdmVydGljZXNcbiAgICAgICAgaWYgKHR5cGVvZiB2ZXJ0aWNlc1swXSA9PSAnb2JqZWN0Jykge1xuICAgICAgICAgICAgZm9yICh2YXIgdj0wOyB2IDwgdmVydGljZXMubGVuZ3RoOyB2KyspIHtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlc1t2XSk7XG4gICAgICAgICAgICAgICAgaWYgKHZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgdmVydGV4X2RhdGEucHVzaC5hcHBseSh2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIFNpbmdsZSB2ZXJ0ZXhcbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoLmFwcGx5KHZlcnRleF9kYXRhLCB2ZXJ0aWNlcyk7XG4gICAgICAgICAgICBpZiAodmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICAgICAgICAgIHZlcnRleF9kYXRhLnB1c2guYXBwbHkodmVydGV4X2RhdGEsIHZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiB2ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIENyZWF0ZXMgYSBWZXJ0ZXggQXJyYXkgT2JqZWN0IGlmIHRoZSBleHRlbnNpb24gaXMgYXZhaWxhYmxlLCBvciBmYWxscyBiYWNrIG9uIHN0YW5kYXJkIGF0dHJpYnV0ZSBjYWxsc1xuR0wuVmVydGV4QXJyYXlPYmplY3QgPSB7fTtcbkdMLlZlcnRleEFycmF5T2JqZWN0LmRpc2FibGVkID0gZmFsc2U7IC8vIHNldCB0byB0cnVlIHRvIGRpc2FibGUgVkFPcyBldmVuIGlmIGV4dGVuc2lvbiBpcyBhdmFpbGFibGVcbkdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3ZhbyA9IG51bGw7IC8vIGN1cnJlbnRseSBib3VuZCBWQU9cblxuR0wuVmVydGV4QXJyYXlPYmplY3QuaW5pdCA9IGZ1bmN0aW9uIChnbClcbntcbiAgICBpZiAoR0wuVmVydGV4QXJyYXlPYmplY3QuZXh0ID09IG51bGwpIHtcbiAgICAgICAgaWYgKEdMLlZlcnRleEFycmF5T2JqZWN0LmRpc2FibGVkICE9IHRydWUpIHtcbiAgICAgICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dCA9IGdsLmdldEV4dGVuc2lvbihcIk9FU192ZXJ0ZXhfYXJyYXlfb2JqZWN0XCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dCAhPSBudWxsKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIGF2YWlsYWJsZVwiKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChHTC5WZXJ0ZXhBcnJheU9iamVjdC5kaXNhYmxlZCAhPSB0cnVlKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIE5PVCBhdmFpbGFibGVcIik7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIlZlcnRleCBBcnJheSBPYmplY3QgZXh0ZW5zaW9uIGZvcmNlIGRpc2FibGVkXCIpO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuR0wuVmVydGV4QXJyYXlPYmplY3QuY3JlYXRlID0gZnVuY3Rpb24gKHNldHVwLCB0ZWFyZG93bilcbntcbiAgICB2YXIgdmFvID0ge307XG4gICAgdmFvLnNldHVwID0gc2V0dXA7XG4gICAgdmFvLnRlYXJkb3duID0gdGVhcmRvd247XG5cbiAgICB2YXIgZXh0ID0gR0wuVmVydGV4QXJyYXlPYmplY3QuZXh0O1xuICAgIGlmIChleHQgIT0gbnVsbCkge1xuICAgICAgICB2YW8uX3ZhbyA9IGV4dC5jcmVhdGVWZXJ0ZXhBcnJheU9FUygpO1xuICAgICAgICBleHQuYmluZFZlcnRleEFycmF5T0VTKHZhby5fdmFvKTtcbiAgICAgICAgdmFvLnNldHVwKCk7XG4gICAgICAgIGV4dC5iaW5kVmVydGV4QXJyYXlPRVMobnVsbCk7XG4gICAgICAgIGlmICh0eXBlb2YgdmFvLnRlYXJkb3duID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHZhby50ZWFyZG93bigpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YW8uc2V0dXAoKTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFvO1xufTtcblxuR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZCA9IGZ1bmN0aW9uICh2YW8pXG57XG4gICAgdmFyIGV4dCA9IEdMLlZlcnRleEFycmF5T2JqZWN0LmV4dDtcbiAgICBpZiAodmFvICE9IG51bGwpIHtcbiAgICAgICAgaWYgKGV4dCAhPSBudWxsICYmIHZhby5fdmFvICE9IG51bGwpIHtcbiAgICAgICAgICAgIGV4dC5iaW5kVmVydGV4QXJyYXlPRVModmFvLl92YW8pO1xuICAgICAgICAgICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYm91bmRfdmFvID0gdmFvO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdmFvLnNldHVwKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIGlmIChleHQgIT0gbnVsbCkge1xuICAgICAgICAgICAgZXh0LmJpbmRWZXJ0ZXhBcnJheU9FUyhudWxsKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChHTC5WZXJ0ZXhBcnJheU9iamVjdC5ib3VuZF92YW8gIT0gbnVsbCAmJiB0eXBlb2YgR0wuVmVydGV4QXJyYXlPYmplY3QuYm91bmRfdmFvLnRlYXJkb3duID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3Zhby50ZWFyZG93bigpO1xuICAgICAgICB9XG4gICAgICAgIEdMLlZlcnRleEFycmF5T2JqZWN0LmJvdW5kX3ZhbyA9IG51bGw7XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTDtcbn1cbiIsInZhciBWZWN0b3IgPSByZXF1aXJlKCcuLi92ZWN0b3IuanMnKTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4uL3BvaW50LmpzJyk7XG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG5cbnZhciBHTEJ1aWxkZXJzID0ge307XG5cbkdMQnVpbGRlcnMuZGVidWcgPSBmYWxzZTtcblxuLy8gVGVzc2VsYXRlIGEgZmxhdCAyRCBwb2x5Z29uIHdpdGggZml4ZWQgaGVpZ2h0IGFuZCBhZGQgdG8gR0wgdmVydGV4IGJ1ZmZlclxuR0xCdWlsZGVycy5idWlsZFBvbHlnb25zID0gZnVuY3Rpb24gR0xCdWlsZGVyc0J1aWxkUG9seWdvbnMgKHBvbHlnb25zLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciB2ZXJ0ZXhfY29uc3RhbnRzID0gW3osIDAsIDAsIDFdOyAvLyBwcm92aWRlZCB6LCBhbmQgdXB3YXJkcy1mYWNpbmcgbm9ybWFsXG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB2ZXJ0ZXhfY29uc3RhbnRzLnB1c2guYXBwbHkodmVydGV4X2NvbnN0YW50cywgb3B0aW9ucy52ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICB9XG5cbiAgICB2YXIgbnVtX3BvbHlnb25zID0gcG9seWdvbnMubGVuZ3RoO1xuICAgIGZvciAodmFyIHA9MDsgcCA8IG51bV9wb2x5Z29uczsgcCsrKSB7XG4gICAgICAgIHZhciB2ZXJ0aWNlcyA9IEdMLnRyaWFuZ3VsYXRlUG9seWdvbihwb2x5Z29uc1twXSk7XG4gICAgICAgIEdMLmFkZFZlcnRpY2VzKHZlcnRpY2VzLCB2ZXJ0ZXhfZGF0YSwgdmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gVGVzc2VsYXRlIGFuZCBleHRydWRlIGEgZmxhdCAyRCBwb2x5Z29uIGludG8gYSBzaW1wbGUgM0QgbW9kZWwgd2l0aCBmaXhlZCBoZWlnaHQgYW5kIGFkZCB0byBHTCB2ZXJ0ZXggYnVmZmVyXG5HTEJ1aWxkZXJzLmJ1aWxkRXh0cnVkZWRQb2x5Z29ucyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZEV4dHJ1ZGVkUG9seWdvbiAocG9seWdvbnMsIHosIGhlaWdodCwgbWluX2hlaWdodCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgdmFyIG1pbl96ID0geiArIChtaW5faGVpZ2h0IHx8IDApO1xuICAgIHZhciBtYXhfeiA9IHogKyBoZWlnaHQ7XG5cbiAgICAvLyBUb3BcbiAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWdvbnMocG9seWdvbnMsIG1heF96LCB2ZXJ0ZXhfZGF0YSwgeyB2ZXJ0ZXhfY29uc3RhbnRzOiBvcHRpb25zLnZlcnRleF9jb25zdGFudHMgfSk7XG5cbiAgICAvLyBXYWxsc1xuICAgIHZhciB3YWxsX3ZlcnRleF9jb25zdGFudHMgPSBbbnVsbCwgbnVsbCwgbnVsbF07IC8vIG5vcm1hbHMgd2lsbCBiZSBjYWxjdWxhdGVkIGJlbG93XG4gICAgaWYgKG9wdGlvbnMudmVydGV4X2NvbnN0YW50cykge1xuICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHMucHVzaC5hcHBseSh3YWxsX3ZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgdmFyIG51bV9wb2x5Z29ucyA9IHBvbHlnb25zLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9seWdvbnM7IHArKykge1xuICAgICAgICB2YXIgcG9seWdvbiA9IHBvbHlnb25zW3BdO1xuXG4gICAgICAgIGZvciAodmFyIHE9MDsgcSA8IHBvbHlnb24ubGVuZ3RoOyBxKyspIHtcbiAgICAgICAgICAgIHZhciBjb250b3VyID0gcG9seWdvbltxXTtcblxuICAgICAgICAgICAgZm9yICh2YXIgdz0wOyB3IDwgY29udG91ci5sZW5ndGggLSAxOyB3KyspIHtcbiAgICAgICAgICAgICAgICB2YXIgd2FsbF92ZXJ0aWNlcyA9IFtdO1xuXG4gICAgICAgICAgICAgICAgLy8gVHdvIHRyaWFuZ2xlcyBmb3IgdGhlIHF1YWQgZm9ybWVkIGJ5IGVhY2ggdmVydGV4IHBhaXIsIGdvaW5nIGZyb20gYm90dG9tIHRvIHRvcCBoZWlnaHRcbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIC8vIFRyaWFuZ2xlXG4gICAgICAgICAgICAgICAgICAgIFtjb250b3VyW3crMV1bMF0sIGNvbnRvdXJbdysxXVsxXSwgbWF4X3pdLFxuICAgICAgICAgICAgICAgICAgICBbY29udG91clt3KzFdWzBdLCBjb250b3VyW3crMV1bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgLy8gVHJpYW5nbGVcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1pbl96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbd11bMF0sIGNvbnRvdXJbd11bMV0sIG1heF96XSxcbiAgICAgICAgICAgICAgICAgICAgW2NvbnRvdXJbdysxXVswXSwgY29udG91clt3KzFdWzFdLCBtYXhfel1cbiAgICAgICAgICAgICAgICApO1xuXG4gICAgICAgICAgICAgICAgLy8gQ2FsYyB0aGUgbm9ybWFsIG9mIHRoZSB3YWxsIGZyb20gdXAgdmVjdG9yIGFuZCBvbmUgc2VnbWVudCBvZiB0aGUgd2FsbCB0cmlhbmdsZXNcbiAgICAgICAgICAgICAgICB2YXIgbm9ybWFsID0gVmVjdG9yLmNyb3NzKFxuICAgICAgICAgICAgICAgICAgICBbMCwgMCwgMV0sXG4gICAgICAgICAgICAgICAgICAgIFZlY3Rvci5ub3JtYWxpemUoW2NvbnRvdXJbdysxXVswXSAtIGNvbnRvdXJbd11bMF0sIGNvbnRvdXJbdysxXVsxXSAtIGNvbnRvdXJbd11bMV0sIDBdKVxuICAgICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgICAgICB3YWxsX3ZlcnRleF9jb25zdGFudHNbMF0gPSBub3JtYWxbMF07XG4gICAgICAgICAgICAgICAgd2FsbF92ZXJ0ZXhfY29uc3RhbnRzWzFdID0gbm9ybWFsWzFdO1xuICAgICAgICAgICAgICAgIHdhbGxfdmVydGV4X2NvbnN0YW50c1syXSA9IG5vcm1hbFsyXTtcblxuICAgICAgICAgICAgICAgIEdMLmFkZFZlcnRpY2VzKHdhbGxfdmVydGljZXMsIHZlcnRleF9kYXRhLCB3YWxsX3ZlcnRleF9jb25zdGFudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgdGVzc2VsbGF0ZWQgdHJpYW5nbGVzIGZvciBhIHBvbHlsaW5lXG4vLyBCYXNpY2FsbHkgZm9sbG93aW5nIHRoZSBtZXRob2QgZGVzY3JpYmVkIGhlcmUgZm9yIG1pdGVyIGpvaW50czpcbi8vIGh0dHA6Ly9hcnRncmFtbWVyLmJsb2dzcG90LmNvLnVrLzIwMTEvMDcvZHJhd2luZy1wb2x5bGluZXMtYnktdGVzc2VsbGF0aW9uLmh0bWxcbkdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMgPSBmdW5jdGlvbiBHTEJ1aWxkZXJzQnVpbGRQb2x5bGluZXMgKGxpbmVzLCB6LCB3aWR0aCwgdmVydGV4X2RhdGEsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5jbG9zZWRfcG9seWdvbiA9IG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gfHwgZmFsc2U7XG4gICAgb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcyA9IG9wdGlvbnMucmVtb3ZlX3RpbGVfZWRnZXMgfHwgZmFsc2U7XG5cbiAgICB2YXIgdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXTsgLy8gcHJvdmlkZWQgeiwgYW5kIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgIGlmIChvcHRpb25zLnZlcnRleF9jb25zdGFudHMpIHtcbiAgICAgICAgdmVydGV4X2NvbnN0YW50cy5wdXNoLmFwcGx5KHZlcnRleF9jb25zdGFudHMsIG9wdGlvbnMudmVydGV4X2NvbnN0YW50cyk7XG4gICAgfVxuXG4gICAgLy8gTGluZSBjZW50ZXIgLSBkZWJ1Z2dpbmdcbiAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICAgICAgdmFyIGxpbmUgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgIGZvciAodmFyIHA9MDsgcCA8IGxpbmUubGVuZ3RoIC0gMTsgcCsrKSB7XG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgdmFyIHBhID0gbGluZVtwXTtcbiAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lW3ArMV07XG5cbiAgICAgICAgICAgICAgICBvcHRpb25zLnZlcnRleF9saW5lcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwLFxuICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMS4wLCAwLCAwXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBCdWlsZCB0cmlhbmdsZXNcbiAgICB2YXIgdmVydGljZXMgPSBbXTtcbiAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgIGZvciAodmFyIGxuPTA7IGxuIDwgbnVtX2xpbmVzOyBsbisrKSB7XG4gICAgICAgIHZhciBsaW5lID0gbGluZXNbbG5dO1xuICAgICAgICAvLyBNdWx0aXBsZSBsaW5lIHNlZ21lbnRzXG4gICAgICAgIGlmIChsaW5lLmxlbmd0aCA+IDIpIHtcbiAgICAgICAgICAgIC8vIEJ1aWxkIGFuY2hvcnMgZm9yIGxpbmUgc2VnbWVudHM6XG4gICAgICAgICAgICAvLyBhbmNob3JzIGFyZSAzIHBvaW50cywgZWFjaCBjb25uZWN0aW5nIDIgbGluZSBzZWdtZW50cyB0aGF0IHNoYXJlIGEgam9pbnQgKHN0YXJ0IHBvaW50LCBqb2ludCBwb2ludCwgZW5kIHBvaW50KVxuXG4gICAgICAgICAgICB2YXIgYW5jaG9ycyA9IFtdO1xuXG4gICAgICAgICAgICBpZiAobGluZS5sZW5ndGggPiAzKSB7XG4gICAgICAgICAgICAgICAgLy8gRmluZCBtaWRwb2ludHMgb2YgZWFjaCBsaW5lIHNlZ21lbnRcbiAgICAgICAgICAgICAgICAvLyBGb3IgY2xvc2VkIHBvbHlnb25zLCBjYWxjdWxhdGUgYWxsIG1pZHBvaW50cyBzaW5jZSBzZWdtZW50cyB3aWxsIHdyYXAgYXJvdW5kIHRvIGZpcnN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgdmFyIG1pZCA9IFtdO1xuICAgICAgICAgICAgICAgIHZhciBwLCBwbWF4O1xuICAgICAgICAgICAgICAgIGlmIChvcHRpb25zLmNsb3NlZF9wb2x5Z29uID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICAgICAgcCA9IDA7IC8vIHN0YXJ0IG9uIGZpcnN0IHBvaW50XG4gICAgICAgICAgICAgICAgICAgIHBtYXggPSBsaW5lLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIC8vIEZvciBvcGVuIHBvbHlnb25zLCBza2lwIGZpcnN0IG1pZHBvaW50IGFuZCB1c2UgbGluZSBzdGFydCBpbnN0ZWFkXG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHAgPSAxOyAvLyBzdGFydCBvbiBzZWNvbmQgcG9pbnRcbiAgICAgICAgICAgICAgICAgICAgcG1heCA9IGxpbmUubGVuZ3RoIC0gMjtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2gobGluZVswXSk7IC8vIHVzZSBsaW5lIHN0YXJ0IGluc3RlYWQgb2YgZmlyc3QgbWlkcG9pbnRcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBDYWxjIG1pZHBvaW50c1xuICAgICAgICAgICAgICAgIGZvciAoOyBwIDwgcG1heDsgcCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmVbcF07XG4gICAgICAgICAgICAgICAgICAgIHZhciBwYiA9IGxpbmVbcCsxXTtcbiAgICAgICAgICAgICAgICAgICAgbWlkLnB1c2goWyhwYVswXSArIHBiWzBdKSAvIDIsIChwYVsxXSArIHBiWzFdKSAvIDJdKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBTYW1lIGNsb3NlZC9vcGVuIHBvbHlnb24gbG9naWMgYXMgYWJvdmU6IGtlZXAgbGFzdCBtaWRwb2ludCBmb3IgY2xvc2VkLCBza2lwIGZvciBvcGVuXG4gICAgICAgICAgICAgICAgdmFyIG1tYXg7XG4gICAgICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2xvc2VkX3BvbHlnb24gPT0gdHJ1ZSkge1xuICAgICAgICAgICAgICAgICAgICBtbWF4ID0gbWlkLmxlbmd0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIG1pZC5wdXNoKGxpbmVbbGluZS5sZW5ndGgtMV0pOyAvLyB1c2UgbGluZSBlbmQgaW5zdGVhZCBvZiBsYXN0IG1pZHBvaW50XG4gICAgICAgICAgICAgICAgICAgIG1tYXggPSBtaWQubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYWtlIGFuY2hvcnMgYnkgY29ubmVjdGluZyBtaWRwb2ludHMgdG8gbGluZSBqb2ludHNcbiAgICAgICAgICAgICAgICBmb3IgKHA9MDsgcCA8IG1tYXg7IHArKykgIHtcbiAgICAgICAgICAgICAgICAgICAgYW5jaG9ycy5wdXNoKFttaWRbcF0sIGxpbmVbKHArMSkgJSBsaW5lLmxlbmd0aF0sIG1pZFsocCsxKSAlIG1pZC5sZW5ndGhdXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gRGVnZW5lcmF0ZSBjYXNlLCBhIDMtcG9pbnQgbGluZSBpcyBqdXN0IGEgc2luZ2xlIGFuY2hvclxuICAgICAgICAgICAgICAgIGFuY2hvcnMgPSBbW2xpbmVbMF0sIGxpbmVbMV0sIGxpbmVbMl1dXTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZm9yICh2YXIgcD0wOyBwIDwgYW5jaG9ycy5sZW5ndGg7IHArKykge1xuICAgICAgICAgICAgICAgIGlmICghb3B0aW9ucy5yZW1vdmVfdGlsZV9lZGdlcykge1xuICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgLy8gYnVpbGRTZWdtZW50KGFuY2hvcnNbcF1bMF0sIGFuY2hvcnNbcF1bMV0pOyAvLyB1c2UgdGhlc2UgdG8gZHJhdyBleHRydWRlZCBzZWdtZW50cyB3L28gam9pbiwgZm9yIGRlYnVnZ2luZ1xuICAgICAgICAgICAgICAgICAgICAvLyBidWlsZFNlZ21lbnQoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB2YXIgZWRnZTEgPSBHTEJ1aWxkZXJzLmlzT25UaWxlRWRnZShhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGVkZ2UyID0gR0xCdWlsZGVycy5pc09uVGlsZUVkZ2UoYW5jaG9yc1twXVsxXSwgYW5jaG9yc1twXVsyXSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICghZWRnZTEgJiYgIWVkZ2UyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBidWlsZEFuY2hvcihhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzBdLCBhbmNob3JzW3BdWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIGlmICghZWRnZTIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJ1aWxkU2VnbWVudChhbmNob3JzW3BdWzFdLCBhbmNob3JzW3BdWzJdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBTaW5nbGUgMi1wb2ludCBzZWdtZW50XG4gICAgICAgIGVsc2UgaWYgKGxpbmUubGVuZ3RoID09IDIpIHtcbiAgICAgICAgICAgIGJ1aWxkU2VnbWVudChsaW5lWzBdLCBsaW5lWzFdKTsgLy8gVE9ETzogcmVwbGFjZSBidWlsZFNlZ21lbnQgd2l0aCBhIGRlZ2VuZXJhdGUgZm9ybSBvZiBidWlsZEFuY2hvcj8gYnVpbGRTZWdtZW50IGlzIHN0aWxsIHVzZWZ1bCBmb3IgZGVidWdnaW5nXG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgR0wuYWRkVmVydGljZXModmVydGljZXMsIHZlcnRleF9kYXRhLCB2ZXJ0ZXhfY29uc3RhbnRzKTtcblxuICAgIC8vIEJ1aWxkIHRyaWFuZ2xlcyBmb3IgYSBzaW5nbGUgbGluZSBzZWdtZW50LCBleHRydWRlZCBieSB0aGUgcHJvdmlkZWQgd2lkdGhcbiAgICBmdW5jdGlvbiBidWlsZFNlZ21lbnQgKHBhLCBwYikge1xuICAgICAgICB2YXIgc2xvcGUgPSBWZWN0b3Iubm9ybWFsaXplKFsocGJbMV0gLSBwYVsxXSkgKiAtMSwgcGJbMF0gLSBwYVswXV0pO1xuXG4gICAgICAgIHZhciBwYV9vdXRlciA9IFtwYVswXSArIHNsb3BlWzBdICogd2lkdGgvMiwgcGFbMV0gKyBzbG9wZVsxXSAqIHdpZHRoLzJdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbcGFbMF0gLSBzbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gc2xvcGVbMV0gKiB3aWR0aC8yXTtcblxuICAgICAgICB2YXIgcGJfb3V0ZXIgPSBbcGJbMF0gKyBzbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgc2xvcGVbMV0gKiB3aWR0aC8yXTtcbiAgICAgICAgdmFyIHBiX2lubmVyID0gW3BiWzBdIC0gc2xvcGVbMF0gKiB3aWR0aC8yLCBwYlsxXSAtIHNsb3BlWzFdICogd2lkdGgvMl07XG5cbiAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgIHBiX2lubmVyLCBwYl9vdXRlciwgcGFfaW5uZXIsXG4gICAgICAgICAgICBwYV9pbm5lciwgcGJfb3V0ZXIsIHBhX291dGVyXG4gICAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gQnVpbGQgdHJpYW5nbGVzIGZvciBhIDMtcG9pbnQgJ2FuY2hvcicgc2hhcGUsIGNvbnNpc3Rpbmcgb2YgdHdvIGxpbmUgc2VnbWVudHMgd2l0aCBhIGpvaW50XG4gICAgLy8gVE9ETzogbW92ZSB0aGVzZSBmdW5jdGlvbnMgb3V0IG9mIGNsb3N1cmVzP1xuICAgIGZ1bmN0aW9uIGJ1aWxkQW5jaG9yIChwYSwgam9pbnQsIHBiKSB7XG4gICAgICAgIC8vIElubmVyIGFuZCBvdXRlciBsaW5lIHNlZ21lbnRzIGZvciBbcGEsIGpvaW50XSBhbmQgW2pvaW50LCBwYl1cbiAgICAgICAgdmFyIHBhX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKGpvaW50WzFdIC0gcGFbMV0pICogLTEsIGpvaW50WzBdIC0gcGFbMF1dKTtcbiAgICAgICAgdmFyIHBhX291dGVyID0gW1xuICAgICAgICAgICAgW3BhWzBdICsgcGFfc2xvcGVbMF0gKiB3aWR0aC8yLCBwYVsxXSArIHBhX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbam9pbnRbMF0gKyBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdICsgcGFfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGFfaW5uZXIgPSBbXG4gICAgICAgICAgICBbcGFbMF0gLSBwYV9zbG9wZVswXSAqIHdpZHRoLzIsIHBhWzFdIC0gcGFfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtqb2ludFswXSAtIHBhX3Nsb3BlWzBdICogd2lkdGgvMiwgam9pbnRbMV0gLSBwYV9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgdmFyIHBiX3Nsb3BlID0gVmVjdG9yLm5vcm1hbGl6ZShbKHBiWzFdIC0gam9pbnRbMV0pICogLTEsIHBiWzBdIC0gam9pbnRbMF1dKTtcbiAgICAgICAgdmFyIHBiX291dGVyID0gW1xuICAgICAgICAgICAgW2pvaW50WzBdICsgcGJfc2xvcGVbMF0gKiB3aWR0aC8yLCBqb2ludFsxXSArIHBiX3Nsb3BlWzFdICogd2lkdGgvMl0sXG4gICAgICAgICAgICBbcGJbMF0gKyBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIHBiWzFdICsgcGJfc2xvcGVbMV0gKiB3aWR0aC8yXVxuICAgICAgICBdO1xuICAgICAgICB2YXIgcGJfaW5uZXIgPSBbXG4gICAgICAgICAgICBbam9pbnRbMF0gLSBwYl9zbG9wZVswXSAqIHdpZHRoLzIsIGpvaW50WzFdIC0gcGJfc2xvcGVbMV0gKiB3aWR0aC8yXSxcbiAgICAgICAgICAgIFtwYlswXSAtIHBiX3Nsb3BlWzBdICogd2lkdGgvMiwgcGJbMV0gLSBwYl9zbG9wZVsxXSAqIHdpZHRoLzJdXG4gICAgICAgIF07XG5cbiAgICAgICAgLy8gTWl0ZXIgam9pbiAtIHNvbHZlIGZvciB0aGUgaW50ZXJzZWN0aW9uIGJldHdlZW4gdGhlIHR3byBvdXRlciBsaW5lIHNlZ21lbnRzXG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb24gPSBWZWN0b3IubGluZUludGVyc2VjdGlvbihwYV9vdXRlclswXSwgcGFfb3V0ZXJbMV0sIHBiX291dGVyWzBdLCBwYl9vdXRlclsxXSk7XG4gICAgICAgIHZhciBsaW5lX2RlYnVnID0gbnVsbDtcbiAgICAgICAgaWYgKGludGVyc2VjdGlvbiAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X291dGVyID0gaW50ZXJzZWN0aW9uO1xuXG4gICAgICAgICAgICAvLyBDYXAgdGhlIGludGVyc2VjdGlvbiBwb2ludCB0byBhIHJlYXNvbmFibGUgZGlzdGFuY2UgKGFzIGpvaW4gYW5nbGUgYmVjb21lcyBzaGFycGVyLCBtaXRlciBqb2ludCBkaXN0YW5jZSB3b3VsZCBhcHByb2FjaCBpbmZpbml0eSlcbiAgICAgICAgICAgIHZhciBsZW5fc3EgPSBWZWN0b3IubGVuZ3RoU3EoW2ludGVyc2VjdF9vdXRlclswXSAtIGpvaW50WzBdLCBpbnRlcnNlY3Rfb3V0ZXJbMV0gLSBqb2ludFsxXV0pO1xuICAgICAgICAgICAgdmFyIG1pdGVyX2xlbl9tYXggPSAzOyAvLyBtdWx0aXBsaWVyIG9uIGxpbmUgd2lkdGggZm9yIG1heCBkaXN0YW5jZSBtaXRlciBqb2luIGNhbiBiZSBmcm9tIGpvaW50XG4gICAgICAgICAgICBpZiAobGVuX3NxID4gKHdpZHRoICogd2lkdGggKiBtaXRlcl9sZW5fbWF4ICogbWl0ZXJfbGVuX21heCkpIHtcbiAgICAgICAgICAgICAgICBsaW5lX2RlYnVnID0gJ2Rpc3RhbmNlJztcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBWZWN0b3Iubm9ybWFsaXplKFtpbnRlcnNlY3Rfb3V0ZXJbMF0gLSBqb2ludFswXSwgaW50ZXJzZWN0X291dGVyWzFdIC0gam9pbnRbMV1dKTtcbiAgICAgICAgICAgICAgICBpbnRlcnNlY3Rfb3V0ZXIgPSBbXG4gICAgICAgICAgICAgICAgICAgIGpvaW50WzBdICsgaW50ZXJzZWN0X291dGVyWzBdICogbWl0ZXJfbGVuX21heCxcbiAgICAgICAgICAgICAgICAgICAgam9pbnRbMV0gKyBpbnRlcnNlY3Rfb3V0ZXJbMV0gKiBtaXRlcl9sZW5fbWF4XG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgaW50ZXJzZWN0X2lubmVyID0gW1xuICAgICAgICAgICAgICAgIChqb2ludFswXSAtIGludGVyc2VjdF9vdXRlclswXSkgKyBqb2ludFswXSxcbiAgICAgICAgICAgICAgICAoam9pbnRbMV0gLSBpbnRlcnNlY3Rfb3V0ZXJbMV0pICsgam9pbnRbMV1cbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHZlcnRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBpbnRlcnNlY3Rfb3V0ZXIsIHBhX291dGVyWzBdLFxuXG4gICAgICAgICAgICAgICAgcGJfaW5uZXJbMV0sIHBiX291dGVyWzFdLCBpbnRlcnNlY3RfaW5uZXIsXG4gICAgICAgICAgICAgICAgaW50ZXJzZWN0X2lubmVyLCBwYl9vdXRlclsxXSwgaW50ZXJzZWN0X291dGVyXG4gICAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gTGluZSBzZWdtZW50cyBhcmUgcGFyYWxsZWwsIHVzZSB0aGUgZmlyc3Qgb3V0ZXIgbGluZSBzZWdtZW50IGFzIGpvaW4gaW5zdGVhZFxuICAgICAgICAgICAgbGluZV9kZWJ1ZyA9ICdwYXJhbGxlbCc7XG4gICAgICAgICAgICBwYV9pbm5lclsxXSA9IHBiX2lubmVyWzBdO1xuICAgICAgICAgICAgcGFfb3V0ZXJbMV0gPSBwYl9vdXRlclswXTtcblxuICAgICAgICAgICAgdmVydGljZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXSwgcGFfb3V0ZXJbMV0sIHBhX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzBdLCBwYV9vdXRlclsxXSwgcGFfb3V0ZXJbMF0sXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXSwgcGJfb3V0ZXJbMV0sIHBiX2lubmVyWzBdLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzBdLCBwYl9vdXRlclsxXSwgcGJfb3V0ZXJbMF1cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFeHRydWRlZCBpbm5lci9vdXRlciBlZGdlcyAtIGRlYnVnZ2luZ1xuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBvcHRpb25zLnZlcnRleF9saW5lcykge1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX2lubmVyWzFdWzBdLCBwYV9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX2lubmVyWzFdWzBdLCBwYl9pbm5lclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9vdXRlclswXVswXSwgcGFfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9vdXRlclswXVswXSwgcGJfb3V0ZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclswXVswXSwgcGFfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzBdWzBdLCBwYV9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYV9pbm5lclsxXVswXSwgcGFfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBhX291dGVyWzFdWzBdLCBwYV9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclswXVswXSwgcGJfaW5uZXJbMF1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzBdWzBdLCBwYl9vdXRlclswXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDAsXG5cbiAgICAgICAgICAgICAgICBwYl9pbm5lclsxXVswXSwgcGJfaW5uZXJbMV1bMV0sIHogKyAwLjAwMSwgMCwgMCwgMSwgMCwgMS4wLCAwLFxuICAgICAgICAgICAgICAgIHBiX291dGVyWzFdWzBdLCBwYl9vdXRlclsxXVsxXSwgeiArIDAuMDAxLCAwLCAwLCAxLCAwLCAxLjAsIDBcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoR0xCdWlsZGVycy5kZWJ1ZyAmJiBsaW5lX2RlYnVnICYmIG9wdGlvbnMudmVydGV4X2xpbmVzKSB7XG4gICAgICAgICAgICB2YXIgZGNvbG9yO1xuICAgICAgICAgICAgaWYgKGxpbmVfZGVidWcgPT0gJ3BhcmFsbGVsJykge1xuICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKFwiISEhIGxpbmVzIGFyZSBwYXJhbGxlbCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzAsIDEsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGluZV9kZWJ1ZyA9PSAnZGlzdGFuY2UnKSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCIhISEgbWl0ZXIgaW50ZXJzZWN0aW9uIHBvaW50IGV4Y2VlZGVkIGFsbG93ZWQgZGlzdGFuY2UgZnJvbSBqb2ludCAhISFcIik7XG4gICAgICAgICAgICAgICAgZGNvbG9yID0gWzEsIDAsIDBdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ09TTSBpZDogJyArIGZlYXR1cmUuaWQpOyAvLyBUT0RPOiBpZiB0aGlzIGZ1bmN0aW9uIGlzIG1vdmVkIG91dCBvZiBhIGNsb3N1cmUsIHRoaXMgZmVhdHVyZSBkZWJ1ZyBpbmZvIHdvbid0IGJlIGF2YWlsYWJsZVxuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coW3BhLCBqb2ludCwgcGJdKTtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGZlYXR1cmUpO1xuICAgICAgICAgICAgb3B0aW9ucy52ZXJ0ZXhfbGluZXMucHVzaChcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdLFxuICAgICAgICAgICAgICAgIGpvaW50WzBdLCBqb2ludFsxXSwgeiArIDAuMDAyLFxuICAgICAgICAgICAgICAgIDAsIDAsIDEsIGRjb2xvclswXSwgZGNvbG9yWzFdLCBkY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgam9pbnRbMF0sIGpvaW50WzFdLCB6ICsgMC4wMDIsXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgZGNvbG9yWzBdLCBkY29sb3JbMV0sIGRjb2xvclsyXSxcbiAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCBkY29sb3JbMF0sIGRjb2xvclsxXSwgZGNvbG9yWzJdXG4gICAgICAgICAgICApO1xuXG4gICAgICAgICAgICB2YXIgbnVtX2xpbmVzID0gbGluZXMubGVuZ3RoO1xuICAgICAgICAgICAgZm9yICh2YXIgbG49MDsgbG4gPCBudW1fbGluZXM7IGxuKyspIHtcbiAgICAgICAgICAgICAgICB2YXIgbGluZTIgPSBsaW5lc1tsbl07XG5cbiAgICAgICAgICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lMi5sZW5ndGggLSAxOyBwKyspIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYSA9IGxpbmUyW3BdO1xuICAgICAgICAgICAgICAgICAgICB2YXIgcGIgPSBsaW5lMltwKzFdO1xuXG4gICAgICAgICAgICAgICAgICAgIG9wdGlvbnMudmVydGV4X2xpbmVzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjAsXG4gICAgICAgICAgICAgICAgICAgICAgICBwYlswXSwgcGJbMV0sIHogKyAwLjAwMDUsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLCAwLCAxLCAwLCAwLCAxLjBcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZlcnRleF9kYXRhO1xufTtcblxuLy8gQnVpbGQgYSBxdWFkIGNlbnRlcmVkIG9uIGEgcG9pbnRcbkdMQnVpbGRlcnMuYnVpbGRRdWFkcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZFF1YWRzIChwb2ludHMsIHdpZHRoLCBoZWlnaHQsIGFkZEdlb21ldHJ5LCBvcHRpb25zKVxue1xuICAgIHZhciBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBudW1fcG9pbnRzID0gcG9pbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBwPTA7IHAgPCBudW1fcG9pbnRzOyBwKyspIHtcbiAgICAgICAgdmFyIHBvaW50ID0gcG9pbnRzW3BdO1xuXG4gICAgICAgIHZhciBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSAtIGhlaWdodC8yXSxcbiAgICAgICAgICAgIFtwb2ludFswXSArIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG5cbiAgICAgICAgICAgIFtwb2ludFswXSAtIHdpZHRoLzIsIHBvaW50WzFdIC0gaGVpZ2h0LzJdLFxuICAgICAgICAgICAgW3BvaW50WzBdICsgd2lkdGgvMiwgcG9pbnRbMV0gKyBoZWlnaHQvMl0sXG4gICAgICAgICAgICBbcG9pbnRbMF0gLSB3aWR0aC8yLCBwb2ludFsxXSArIGhlaWdodC8yXSxcbiAgICAgICAgXTtcblxuICAgICAgICBpZiAob3B0aW9ucy50ZXhjb29yZHMgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdmFyIHRleGNvb3JkcyA9IFtcbiAgICAgICAgICAgICAgICBbLTEsIC0xXSxcbiAgICAgICAgICAgICAgICBbMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcblxuICAgICAgICAgICAgICAgIFstMSwgLTFdLFxuICAgICAgICAgICAgICAgIFsxLCAxXSxcbiAgICAgICAgICAgICAgICBbLTEsIDFdXG4gICAgICAgICAgICBdO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHZlcnRpY2VzID0ge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBwb3NpdGlvbnMsXG4gICAgICAgICAgICB0ZXhjb29yZHM6IChvcHRpb25zLnRleGNvb3JkcyAmJiB0ZXhjb29yZHMpXG4gICAgICAgIH07XG4gICAgICAgIGFkZEdlb21ldHJ5KHZlcnRpY2VzKTtcbiAgICB9XG59O1xuXG4vLyBCdWlsZCBuYXRpdmUgR0wgbGluZXMgZm9yIGEgcG9seWxpbmVcbkdMQnVpbGRlcnMuYnVpbGRMaW5lcyA9IGZ1bmN0aW9uIEdMQnVpbGRlcnNCdWlsZExpbmVzIChsaW5lcywgZmVhdHVyZSwgbGF5ZXIsIHN0eWxlLCB0aWxlLCB6LCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHZhciBjb2xvciA9IHN0eWxlLmNvbG9yO1xuICAgIHZhciB3aWR0aCA9IHN0eWxlLndpZHRoO1xuXG4gICAgdmFyIG51bV9saW5lcyA9IGxpbmVzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IG51bV9saW5lczsgbG4rKykge1xuICAgICAgICB2YXIgbGluZSA9IGxpbmVzW2xuXTtcblxuICAgICAgICBmb3IgKHZhciBwPTA7IHAgPCBsaW5lLmxlbmd0aCAtIDE7IHArKykge1xuICAgICAgICAgICAgLy8gUG9pbnQgQSB0byBCXG4gICAgICAgICAgICB2YXIgcGEgPSBsaW5lW3BdO1xuICAgICAgICAgICAgdmFyIHBiID0gbGluZVtwKzFdO1xuXG4gICAgICAgICAgICB2ZXJ0ZXhfZGF0YS5wdXNoKFxuICAgICAgICAgICAgICAgIC8vIFBvaW50IEFcbiAgICAgICAgICAgICAgICBwYVswXSwgcGFbMV0sIHosXG4gICAgICAgICAgICAgICAgMCwgMCwgMSwgLy8gZmxhdCBzdXJmYWNlcyBwb2ludCBzdHJhaWdodCB1cFxuICAgICAgICAgICAgICAgIGNvbG9yWzBdLCBjb2xvclsxXSwgY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgLy8gUG9pbnQgQlxuICAgICAgICAgICAgICAgIHBiWzBdLCBwYlsxXSwgeixcbiAgICAgICAgICAgICAgICAwLCAwLCAxLCAvLyBmbGF0IHN1cmZhY2VzIHBvaW50IHN0cmFpZ2h0IHVwXG4gICAgICAgICAgICAgICAgY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gdmVydGV4X2RhdGE7XG59O1xuXG4vKiBVdGlsaXR5IGZ1bmN0aW9ucyAqL1xuXG4vLyBUZXN0cyBpZiBhIGxpbmUgc2VnbWVudCAoZnJvbSBwb2ludCBBIHRvIEIpIGlzIG5lYXJseSBjb2luY2lkZW50IHdpdGggdGhlIGVkZ2Ugb2YgYSB0aWxlXG5HTEJ1aWxkZXJzLmlzT25UaWxlRWRnZSA9IGZ1bmN0aW9uIChwYSwgcGIsIG9wdGlvbnMpXG57XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgICB2YXIgdG9sZXJhbmNlX2Z1bmN0aW9uID0gb3B0aW9ucy50b2xlcmFuY2VfZnVuY3Rpb24gfHwgR0xCdWlsZGVycy52YWx1ZXNXaXRoaW5Ub2xlcmFuY2U7XG4gICAgdmFyIHRvbGVyYW5jZSA9IG9wdGlvbnMudG9sZXJhbmNlIHx8IDE7IC8vIHR3ZWFrIHRoaXMgYWRqdXN0IGlmIGNhdGNoaW5nIHRvbyBmZXcvbWFueSBsaW5lIHNlZ21lbnRzIG5lYXIgdGlsZSBlZGdlc1xuICAgIHZhciB0aWxlX21pbiA9IEdMQnVpbGRlcnMudGlsZV9ib3VuZHNbMF07XG4gICAgdmFyIHRpbGVfbWF4ID0gR0xCdWlsZGVycy50aWxlX2JvdW5kc1sxXTtcbiAgICB2YXIgZWRnZSA9IG51bGw7XG5cbiAgICBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzBdLCB0aWxlX21pbi54LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlswXSwgdGlsZV9taW4ueCwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2xlZnQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMF0sIHRpbGVfbWF4LngsIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzBdLCB0aWxlX21heC54LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAncmlnaHQnO1xuICAgIH1cbiAgICBlbHNlIGlmICh0b2xlcmFuY2VfZnVuY3Rpb24ocGFbMV0sIHRpbGVfbWluLnksIHRvbGVyYW5jZSkgJiYgdG9sZXJhbmNlX2Z1bmN0aW9uKHBiWzFdLCB0aWxlX21pbi55LCB0b2xlcmFuY2UpKSB7XG4gICAgICAgIGVkZ2UgPSAndG9wJztcbiAgICB9XG4gICAgZWxzZSBpZiAodG9sZXJhbmNlX2Z1bmN0aW9uKHBhWzFdLCB0aWxlX21heC55LCB0b2xlcmFuY2UpICYmIHRvbGVyYW5jZV9mdW5jdGlvbihwYlsxXSwgdGlsZV9tYXgueSwgdG9sZXJhbmNlKSkge1xuICAgICAgICBlZGdlID0gJ2JvdHRvbSc7XG4gICAgfVxuICAgIHJldHVybiBlZGdlO1xufTtcblxuR0xCdWlsZGVycy5zZXRUaWxlU2NhbGUgPSBmdW5jdGlvbiAoc2NhbGUpXG57XG4gICAgR0xCdWlsZGVycy50aWxlX2JvdW5kcyA9IFtcbiAgICAgICAgUG9pbnQoMCwgMCksXG4gICAgICAgIFBvaW50KHNjYWxlLCAtc2NhbGUpIC8vIFRPRE86IGNvcnJlY3QgZm9yIGZsaXBwZWQgeS1heGlzP1xuICAgIF07XG59O1xuXG5HTEJ1aWxkZXJzLnZhbHVlc1dpdGhpblRvbGVyYW5jZSA9IGZ1bmN0aW9uIChhLCBiLCB0b2xlcmFuY2UpXG57XG4gICAgdG9sZXJhbmNlID0gdG9sZXJhbmNlIHx8IDE7XG4gICAgcmV0dXJuIChNYXRoLmFicyhhIC0gYikgPCB0b2xlcmFuY2UpO1xufTtcblxuLy8gQnVpbGQgYSB6aWd6YWcgbGluZSBwYXR0ZXJuIGZvciB0ZXN0aW5nIGpvaW5zIGFuZCBjYXBzXG5HTEJ1aWxkZXJzLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgbWluID0gUG9pbnQoMCwgMCk7IC8vIHRpbGUubWluO1xuICAgIHZhciBtYXggPSBQb2ludCg0MDk2LCA0MDk2KTsgLy8gdGlsZS5tYXg7XG4gICAgdmFyIGcgPSB7XG4gICAgICAgIGlkOiAxMjMsXG4gICAgICAgIGdlb21ldHJ5OiB7XG4gICAgICAgICAgICB0eXBlOiAnTGluZVN0cmluZycsXG4gICAgICAgICAgICBjb29yZGluYXRlczogW1xuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC43NSArIG1heC55ICogMC4yNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC43NSArIG1heC54ICogMC4yNSwgbWluLnkgKiAwLjUgKyBtYXgueSAqIDAuNV0sXG4gICAgICAgICAgICAgICAgW21pbi54ICogMC4yNSArIG1heC54ICogMC43NSwgbWluLnkgKiAwLjc1ICsgbWF4LnkgKiAwLjI1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjI1ICsgbWF4LnggKiAwLjc1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNCArIG1heC54ICogMC42LCBtaW4ueSAqIDAuNSArIG1heC55ICogMC41XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjUgKyBtYXgueCAqIDAuNSwgbWluLnkgKiAwLjI1ICsgbWF4LnkgKiAwLjc1XSxcbiAgICAgICAgICAgICAgICBbbWluLnggKiAwLjc1ICsgbWF4LnggKiAwLjI1LCBtaW4ueSAqIDAuMjUgKyBtYXgueSAqIDAuNzVdLFxuICAgICAgICAgICAgICAgIFttaW4ueCAqIDAuNzUgKyBtYXgueCAqIDAuMjUsIG1pbi55ICogMC40ICsgbWF4LnkgKiAwLjZdXG4gICAgICAgICAgICBdXG4gICAgICAgIH0sXG4gICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgIGtpbmQ6ICdkZWJ1ZydcbiAgICAgICAgfVxuICAgIH07XG4gICAgLy8gY29uc29sZS5sb2coZy5nZW9tZXRyeS5jb29yZGluYXRlcyk7XG4gICAgcmV0dXJuIGc7XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEdMQnVpbGRlcnM7XG59XG4iLCIvKioqIE1hbmFnZSByZW5kZXJpbmcgZm9yIHByaW1pdGl2ZXMgKioqL1xudmFyIEdMID0gcmVxdWlyZSgnLi9nbC5qcycpO1xuXG4vLyBBdHRyaWJzIGFyZSBhbiBhcnJheSwgaW4gbGF5b3V0IG9yZGVyLCBvZjogbmFtZSwgc2l6ZSwgdHlwZSwgbm9ybWFsaXplZFxuLy8gZXg6IHsgbmFtZTogJ3Bvc2l0aW9uJywgc2l6ZTogMywgdHlwZTogZ2wuRkxPQVQsIG5vcm1hbGl6ZWQ6IGZhbHNlIH1cbmZ1bmN0aW9uIEdMR2VvbWV0cnkgKGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgYXR0cmlicywgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICAgIHRoaXMuZ2wgPSBnbDtcbiAgICB0aGlzLmdsX3Byb2dyYW0gPSBnbF9wcm9ncmFtO1xuICAgIHRoaXMuYXR0cmlicyA9IGF0dHJpYnM7XG4gICAgdGhpcy52ZXJ0ZXhfZGF0YSA9IHZlcnRleF9kYXRhOyAvLyBGbG9hdDMyQXJyYXlcbiAgICB0aGlzLmJ1ZmZlciA9IHRoaXMuZ2wuY3JlYXRlQnVmZmVyKCk7XG4gICAgdGhpcy5kcmF3X21vZGUgPSBvcHRpb25zLmRyYXdfbW9kZSB8fCB0aGlzLmdsLlRSSUFOR0xFUztcbiAgICB0aGlzLmRhdGFfdXNhZ2UgPSBvcHRpb25zLmRhdGFfdXNhZ2UgfHwgdGhpcy5nbC5TVEFUSUNfRFJBVztcblxuICAgIC8vIENhbGMgdmVydGV4IHN0cmlkZVxuICAgIHRoaXMudmVydGV4X3N0cmlkZSA9IDA7XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG5cbiAgICAgICAgYXR0cmliLmxvY2F0aW9uID0gdGhpcy5nbF9wcm9ncmFtLmF0dHJpYnV0ZShhdHRyaWIubmFtZSkubG9jYXRpb247XG4gICAgICAgIGF0dHJpYi5ieXRlX3NpemUgPSBhdHRyaWIuc2l6ZTtcblxuICAgICAgICBzd2l0Y2ggKGF0dHJpYi50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuRkxPQVQ6XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuSU5UOlxuICAgICAgICAgICAgY2FzZSB0aGlzLmdsLlVOU0lHTkVEX0lOVDpcbiAgICAgICAgICAgICAgICBhdHRyaWIuYnl0ZV9zaXplICo9IDQ7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuU0hPUlQ6XG4gICAgICAgICAgICBjYXNlIHRoaXMuZ2wuVU5TSUdORURfU0hPUlQ6XG4gICAgICAgICAgICAgICAgYXR0cmliLmJ5dGVfc2l6ZSAqPSAyO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG5cbiAgICAgICAgYXR0cmliLm9mZnNldCA9IHRoaXMudmVydGV4X3N0cmlkZTtcbiAgICAgICAgdGhpcy52ZXJ0ZXhfc3RyaWRlICs9IGF0dHJpYi5ieXRlX3NpemU7XG4gICAgfVxuXG4gICAgdGhpcy52ZXJ0ZXhfY291bnQgPSB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGggLyB0aGlzLnZlcnRleF9zdHJpZGU7XG5cbiAgICB0aGlzLnZhbyA9IEdMLlZlcnRleEFycmF5T2JqZWN0LmNyZWF0ZShmdW5jdGlvbigpIHtcbiAgICAgICAgdGhpcy5nbC5iaW5kQnVmZmVyKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLmJ1ZmZlcik7XG4gICAgICAgIHRoaXMuc2V0dXAoKTtcbiAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgdGhpcy5nbC5idWZmZXJEYXRhKHRoaXMuZ2wuQVJSQVlfQlVGRkVSLCB0aGlzLnZlcnRleF9kYXRhLCB0aGlzLmRhdGFfdXNhZ2UpO1xufVxuXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5zZXR1cCA9IGZ1bmN0aW9uICgpXG57XG4gICAgZm9yICh2YXIgYT0wOyBhIDwgdGhpcy5hdHRyaWJzLmxlbmd0aDsgYSsrKSB7XG4gICAgICAgIHZhciBhdHRyaWIgPSB0aGlzLmF0dHJpYnNbYV07XG4gICAgICAgIHRoaXMuZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYXR0cmliLmxvY2F0aW9uKTtcbiAgICAgICAgdGhpcy5nbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKGF0dHJpYi5sb2NhdGlvbiwgYXR0cmliLnNpemUsIGF0dHJpYi50eXBlLCBhdHRyaWIubm9ybWFsaXplZCwgdGhpcy52ZXJ0ZXhfc3RyaWRlLCBhdHRyaWIub2Zmc2V0KTtcbiAgICB9XG59O1xuXG5HTEdlb21ldHJ5LnByb3RvdHlwZS5yZW5kZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuZ2wudXNlUHJvZ3JhbSh0aGlzLmdsX3Byb2dyYW0ucHJvZ3JhbSk7XG4gICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZCh0aGlzLnZhbyk7XG5cbiAgICBpZiAodHlwZW9mIHRoaXMuX3JlbmRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHRoaXMuX3JlbmRlcigpO1xuICAgIH1cblxuICAgIC8vIFRPRE86IHN1cHBvcnQgZWxlbWVudCBhcnJheSBtb2RlXG4gICAgdGhpcy5nbC5kcmF3QXJyYXlzKHRoaXMuZHJhd19tb2RlLCAwLCB0aGlzLnZlcnRleF9jb3VudCk7XG4gICAgR0wuVmVydGV4QXJyYXlPYmplY3QuYmluZChudWxsKTtcbn07XG5cbkdMR2VvbWV0cnkucHJvdG90eXBlLmRlc3Ryb3kgPSBmdW5jdGlvbiAoKVxue1xuICAgIGNvbnNvbGUubG9nKFwiR0xHZW9tZXRyeS5kZXN0cm95OiBkZWxldGUgYnVmZmVyIG9mIHNpemUgXCIgKyB0aGlzLnZlcnRleF9kYXRhLmJ5dGVMZW5ndGgpO1xuICAgIHRoaXMuZ2wuZGVsZXRlQnVmZmVyKHRoaXMuYnVmZmVyKTtcbiAgICBkZWxldGUgdGhpcy52ZXJ0ZXhfZGF0YTtcbn07XG5cbi8vIERyYXdzIGEgc2V0IG9mIHRyaWFuZ2xlc1xuR0xUcmlhbmdsZXMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHTEdlb21ldHJ5LnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIEdMVHJpYW5nbGVzIChnbCwgZ2xfcHJvZ3JhbSwgdmVydGV4X2RhdGEpXG57XG4gICAgR0xHZW9tZXRyeS5jYWxsKHRoaXMsIGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgW1xuICAgICAgICB7IG5hbWU6ICdwb3NpdGlvbicsIHNpemU6IDMsIHR5cGU6IGdsLkZMT0FULCBub3JtYWxpemVkOiBmYWxzZSB9LFxuICAgICAgICB7IG5hbWU6ICdub3JtYWwnLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnY29sb3InLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnbGF5ZXInLCBzaXplOiAxLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xuICAgIHRoaXMuZ2VvbWV0cnlfY291bnQgPSB0aGlzLnZlcnRleF9jb3VudCAvIDM7XG59XG5cbi8vIERyYXdzIGEgc2V0IG9mIHBvaW50cyBhcyBxdWFkcywgaW50ZW5kZWQgdG8gYmUgcmVuZGVyZWQgYXMgZGlzdGFuY2UgZmllbGRzXG5HTFBvbHlQb2ludHMucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShHTEdlb21ldHJ5LnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIEdMUG9seVBvaW50cyAoZ2wsIGdsX3Byb2dyYW0sIHZlcnRleF9kYXRhKVxue1xuICAgIEdMR2VvbWV0cnkuY2FsbCh0aGlzLCBnbCwgZ2xfcHJvZ3JhbSwgdmVydGV4X2RhdGEsIFtcbiAgICAgICAgeyBuYW1lOiAncG9zaXRpb24nLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAndGV4Y29vcmQnLCBzaXplOiAyLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnY29sb3InLCBzaXplOiAzLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfSxcbiAgICAgICAgeyBuYW1lOiAnbGF5ZXInLCBzaXplOiAxLCB0eXBlOiBnbC5GTE9BVCwgbm9ybWFsaXplZDogZmFsc2UgfVxuICAgIF0pO1xuICAgIHRoaXMuZ2VvbWV0cnlfY291bnQgPSB0aGlzLnZlcnRleF9jb3VudCAvIDM7XG59XG5cbi8vIERyYXdzIGEgc2V0IG9mIGxpbmVzXG4vLyBTaGFyZXMgYWxsIGNoYXJhY3RlcmlzdGljcyB3aXRoIHRyaWFuZ2xlcyBleGNlcHQgZm9yIGRyYXcgbW9kZVxuR0xMaW5lcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKEdMVHJpYW5nbGVzLnByb3RvdHlwZSk7XG5cbmZ1bmN0aW9uIEdMTGluZXMgKGdsLCBnbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSwgb3B0aW9ucylcbntcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBHTFRyaWFuZ2xlcy5jYWxsKHRoaXMsIGdsLCBwcm9ncmFtLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgdGhpcy5kcmF3X21vZGUgPSB0aGlzLmdsLkxJTkVTO1xuICAgIHRoaXMubGluZV93aWR0aCA9IG9wdGlvbnMubGluZV93aWR0aCB8fCAyO1xuICAgIHRoaXMuZ2VvbWV0cnlfY291bnQgPSB0aGlzLnZlcnRleF9jb3VudCAvIDI7XG59XG5cbkdMTGluZXMucHJvdG90eXBlLl9yZW5kZXIgPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMuZ2wubGluZVdpZHRoKHRoaXMubGluZV93aWR0aCk7XG4gICAgaWYgKHR5cGVvZiBHTFRyaWFuZ2xlcy5wcm90b3R5cGUuX3JlbmRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIEdMVHJpYW5nbGVzLnByb3RvdHlwZS5fcmVuZGVyLmNhbGwodGhpcyk7XG4gICAgfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSB7XG4gICAgICAgIEdMR2VvbWV0cnk6IEdMR2VvbWV0cnksXG4gICAgICAgIEdMVHJpYW5nbGVzOiBHTFRyaWFuZ2xlcyxcbiAgICAgICAgR0xQb2x5UG9pbnRzOiBHTFBvbHlQb2ludHMsXG4gICAgICAgIEdMTGluZXM6IEdMTGluZXNcbiAgICB9O1xufVxuIiwidmFyIFBvaW50ID0gcmVxdWlyZSgnLi4vcG9pbnQuanMnKTtcbnZhciBHZW8gPSByZXF1aXJlKCcuLi9nZW8uanMnKTtcbnZhciBWZWN0b3JSZW5kZXJlciA9IHJlcXVpcmUoJy4uL3ZlY3Rvcl9yZW5kZXJlci5qcycpO1xuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsLmpzJyk7XG52YXIgR0xCdWlsZGVycyA9IHJlcXVpcmUoJy4vZ2xfYnVpbGRlcnMuanMnKTtcbnZhciBHTEdlb21ldHJ5ID0gcmVxdWlyZSgnLi9nbF9nZW9tLmpzJykuR0xHZW9tZXRyeTtcbnZhciBHTFRyaWFuZ2xlcyA9IHJlcXVpcmUoJy4vZ2xfZ2VvbS5qcycpLkdMVHJpYW5nbGVzO1xudmFyIEdMUG9seVBvaW50cyA9IHJlcXVpcmUoJy4vZ2xfZ2VvbS5qcycpLkdMUG9seVBvaW50cztcbnZhciBHTExpbmVzID0gcmVxdWlyZSgnLi9nbF9nZW9tLmpzJykuR0xMaW5lcztcblxuVmVjdG9yUmVuZGVyZXIuR0xSZW5kZXJlciA9IEdMUmVuZGVyZXI7XG5HTFJlbmRlcmVyLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlKTtcbkdMUmVuZGVyZXIuZGVidWcgPSBmYWxzZTtcblxuR0xSZW5kZXJlci5zaGFkZXJfc291cmNlcyA9IHJlcXVpcmUoJy4vZ2xfc2hhZGVycy5qcycpO1xuXG5mdW5jdGlvbiBHTFJlbmRlcmVyICh0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG4gICAgVmVjdG9yUmVuZGVyZXIuY2FsbCh0aGlzLCAnR0xSZW5kZXJlcicsIHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucyk7XG5cbiAgICBHTEJ1aWxkZXJzLnNldFRpbGVTY2FsZShWZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlKTtcbiAgICBHTC5Qcm9ncmFtLmRlZmluZXMuVElMRV9TQ0FMRSA9IFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUgKyAnLjAnO1xuXG4gICAgdGhpcy5jb250YWluZXIgPSBvcHRpb25zLmNvbnRhaW5lcjtcbiAgICB0aGlzLmNvbnRpbnVvdXNfYW5pbWF0aW9uID0gZmFsc2U7IC8vIHJlcXVlc3QgcmVkcmF3IGV2ZXJ5IGZyYW1lXG59XG5cbkdMUmVuZGVyZXIucHJvdG90eXBlLl9pbml0ID0gZnVuY3Rpb24gR0xSZW5kZXJlckluaXQgKClcbntcbiAgICB0aGlzLmNvbnRhaW5lciA9IHRoaXMuY29udGFpbmVyIHx8IGRvY3VtZW50LmJvZHk7XG4gICAgdGhpcy5jYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUudG9wID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS5sZWZ0ID0gMDtcbiAgICB0aGlzLmNhbnZhcy5zdHlsZS56SW5kZXggPSAtMTtcbiAgICB0aGlzLmNvbnRhaW5lci5hcHBlbmRDaGlsZCh0aGlzLmNhbnZhcyk7XG5cbiAgICB0aGlzLmdsID0gR0wuZ2V0Q29udGV4dCh0aGlzLmNhbnZhcyk7XG5cbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzO1xuXG4gICAgdGhpcy5yZW5kZXJfbW9kZXMgPSB7XG4gICAgICAgICdwb2x5Z29ucyc6IHtcbiAgICAgICAgICAgIGdsX3Byb2dyYW06IG5ldyBHTC5Qcm9ncmFtKHRoaXMuZ2wsIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSksXG4gICAgICAgICAgICBtYWtlR0xHZW9tZXRyeTogZnVuY3Rpb24gKHZlcnRleF9kYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHTFRyaWFuZ2xlcyhyZW5kZXJlci5nbCwgdGhpcy5nbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgICdwb2x5Z29uc19ub2lzZSc6IHtcbiAgICAgICAgICAgIGdsX3Byb2dyYW06IG5ldyBHTC5Qcm9ncmFtKHRoaXMuZ2wsIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSwgeyBkZWZpbmVzOiB7ICdFRkZFQ1RfTk9JU0VfVEVYVFVSRSc6IHRydWUsICdFRkZFQ1RfTk9JU0VfQU5JTUFUQUJMRSc6IHRydWUgfSB9KSxcbiAgICAgICAgICAgIG1ha2VHTEdlb21ldHJ5OiBmdW5jdGlvbiAodmVydGV4X2RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdMVHJpYW5nbGVzKHJlbmRlcmVyLmdsLCB0aGlzLmdsX3Byb2dyYW0sIHZlcnRleF9kYXRhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAgJ3BvaW50cyc6IHtcbiAgICAgICAgICAgIC8vIFRPRE86IHJlcGxhY2UgcmVsYXRpdmUgc2hhZGVyIHBhdGhzIHdpdGggYSBiZXR0ZXIgYXV0by1wYXRoaW5nIHN5c3RlbVxuICAgICAgICAgICAgLy8gZ2xfcHJvZ3JhbTogbmV3IEdMLlByb2dyYW0uY3JlYXRlUHJvZ3JhbUZyb21VUkxzKHRoaXMuZ2wsIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgKyAnLi4vc2hhZGVycy9wb2ludF92ZXJ0ZXguZ2xzbCcsIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgKyAnLi4vc2hhZGVycy9wb2ludF9mcmFnbWVudC5nbHNsJywgeyBkZWZpbmVzOiB7ICdFRkZFQ1RfU0NSRUVOX0NPTE9SJzogdHJ1ZSB9IH0pLFxuICAgICAgICAgICAgZ2xfcHJvZ3JhbTogbmV3IEdMLlByb2dyYW0odGhpcy5nbCwgR0xSZW5kZXJlci5zaGFkZXJfc291cmNlc1sncG9pbnRfdmVydGV4J10sIEdMUmVuZGVyZXIuc2hhZGVyX3NvdXJjZXNbJ3BvaW50X2ZyYWdtZW50J10sIHsgZGVmaW5lczogeyAnRUZGRUNUX1NDUkVFTl9DT0xPUic6IHRydWUgfSB9KSxcbiAgICAgICAgICAgIG1ha2VHTEdlb21ldHJ5OiBmdW5jdGlvbiAodmVydGV4X2RhdGEpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEdMUG9seVBvaW50cyhyZW5kZXJlci5nbCwgdGhpcy5nbF9wcm9ncmFtLCB2ZXJ0ZXhfZGF0YSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5yZXNpemVNYXAodGhpcy5jb250YWluZXIuY2xpZW50V2lkdGgsIHRoaXMuY29udGFpbmVyLmNsaWVudEhlaWdodCk7XG5cbiAgICAvLyB0aGlzLnpvb21fc3RlcCA9IDAuMDI7IC8vIGZvciBmcmFjdGlvbmFsIHpvb20gdXNlciBhZGp1c3RtZW50XG4gICAgdGhpcy5zdGFydF90aW1lID0gK25ldyBEYXRlKCk7XG4gICAgdGhpcy5sYXN0X3JlbmRlcl9jb3VudCA9IG51bGw7XG4gICAgdGhpcy5pbml0SW5wdXRIYW5kbGVycygpO1xufTtcblxuLy8gRGV0ZXJtaW5lIGEgWiB2YWx1ZSB0aGF0IHdpbGwgc3RhY2sgZmVhdHVyZXMgaW4gYSBcInBhaW50ZXIncyBhbGdvcml0aG1cIiBzdHlsZSwgZmlyc3QgYnkgbGF5ZXIsIHRoZW4gYnkgZHJhdyBvcmRlciB3aXRoaW4gbGF5ZXJcbi8vIEZlYXR1cmVzIGFyZSBhc3N1bWVkIHRvIGJlIGFscmVhZHkgc29ydGVkIGluIGRlc2lyZWQgZHJhdyBvcmRlciBieSB0aGUgbGF5ZXIgcHJlLXByb2Nlc3NvclxuR0xSZW5kZXJlci5jYWxjdWxhdGVaID0gZnVuY3Rpb24gKGxheWVyLCB0aWxlLCBsYXllcl9vZmZzZXQsIGZlYXR1cmVfb2Zmc2V0KVxue1xuICAgIC8vIHZhciBsYXllcl9vZmZzZXQgPSBsYXllcl9vZmZzZXQgfHwgMDtcbiAgICAvLyB2YXIgZmVhdHVyZV9vZmZzZXQgPSBmZWF0dXJlX29mZnNldCB8fCAwO1xuICAgIHZhciB6ID0gMDsgLy8gVE9ETzogbWFkZSB0aGlzIGEgbm8tb3AgdW50aWwgcmV2aXNpdGluZyB3aGVyZSBpdCBzaG91bGQgbGl2ZSAtIG9uZS10aW1lIGNhbGMgaGVyZSwgaW4gdmVydGV4IGxheW91dC9zaGFkZXIsIGV0Yy5cbiAgICByZXR1cm4gejtcbn07XG5cbi8vIFByb2Nlc3MgZ2VvbWV0cnkgZm9yIHRpbGUgLSBjYWxsZWQgYnkgd2ViIHdvcmtlclxuR0xSZW5kZXJlci5hZGRUaWxlID0gZnVuY3Rpb24gKHRpbGUsIGxheWVycywgc3R5bGVzKVxue1xuICAgIHZhciBsYXllciwgc3R5bGUsIGZlYXR1cmUsIHosIG1vZGU7XG4gICAgdmFyIHZlcnRleF9kYXRhID0ge307XG5cbiAgICAvLyBKb2luIGxpbmUgdGVzdCBwYXR0ZXJuXG4gICAgLy8gaWYgKEdMUmVuZGVyZXIuZGVidWcpIHtcbiAgICAvLyAgICAgdGlsZS5sYXllcnNbJ3JvYWRzJ10uZmVhdHVyZXMucHVzaChHTFJlbmRlcmVyLmJ1aWxkWmlnemFnTGluZVRlc3RQYXR0ZXJuKCkpO1xuICAgIC8vIH1cblxuICAgIC8vIEJ1aWxkIHJhdyBnZW9tZXRyeSBhcnJheXNcbiAgICB0aWxlLmRlYnVnLmZlYXR1cmVzID0gMDtcbiAgICBmb3IgKHZhciBsbj0wOyBsbiA8IGxheWVycy5sZW5ndGg7IGxuKyspIHtcbiAgICAgICAgbGF5ZXIgPSBsYXllcnNbbG5dO1xuXG4gICAgICAgIC8vIFNraXAgbGF5ZXJzIHdpdGggbm8gc3R5bGVzIGRlZmluZWRcbiAgICAgICAgaWYgKHN0eWxlc1tsYXllci5uYW1lXSA9PSBudWxsKSB7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aWxlLmxheWVyc1tsYXllci5uYW1lXSAhPSBudWxsKSB7XG4gICAgICAgICAgICB2YXIgbnVtX2ZlYXR1cmVzID0gdGlsZS5sYXllcnNbbGF5ZXIubmFtZV0uZmVhdHVyZXMubGVuZ3RoO1xuXG4gICAgICAgICAgICAvLyBSZW5kZXJpbmcgcmV2ZXJzZSBvcmRlciBha2EgdG9wIHRvIGJvdHRvbVxuICAgICAgICAgICAgZm9yICh2YXIgZiA9IG51bV9mZWF0dXJlcy0xOyBmID49IDA7IGYtLSkge1xuICAgICAgICAgICAgICAgIGZlYXR1cmUgPSB0aWxlLmxheWVyc1tsYXllci5uYW1lXS5mZWF0dXJlc1tmXTtcbiAgICAgICAgICAgICAgICB6ID0gR0xSZW5kZXJlci5jYWxjdWxhdGVaKGxheWVyLCB0aWxlKTtcbiAgICAgICAgICAgICAgICBzdHlsZSA9IFZlY3RvclJlbmRlcmVyLnBhcnNlU3R5bGVGb3JGZWF0dXJlKGZlYXR1cmUsIHN0eWxlc1tsYXllci5uYW1lXSwgdGlsZSk7XG5cbiAgICAgICAgICAgICAgICAvLyBTa2lwIGZlYXR1cmU/XG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlID09IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gRmlyc3QgZmVhdHVyZSBpbiB0aGlzIHJlbmRlciBtb2RlP1xuICAgICAgICAgICAgICAgIG1vZGUgPSBzdHlsZS5yZW5kZXJfbW9kZTtcbiAgICAgICAgICAgICAgICBpZiAodmVydGV4X2RhdGFbbW9kZV0gPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICB2ZXJ0ZXhfZGF0YVttb2RlXSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIERFQlVHR0lORyBsaW5lL3RpbGUgaW50ZXJzZWN0aW9ucyByZXR1cm5lZCBhcyBwb2ludHNcbiAgICAgICAgICAgICAgICAvLyAjbWFwemVuLDQwLjc0NzMzMDExNTg5NjE3LC03My45NzUzNTE0NTI4Mjc0NywxN1xuICAgICAgICAgICAgICAgIC8vIGlmIChmZWF0dXJlLmlkID09IDE1Nzk2NDgxMyAmJiBmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ1BvaW50Jykge1xuICAgICAgICAgICAgICAgIC8vICAgICBzdHlsZS5jb2xvciA9IFsxLCAxLCAwXTtcbiAgICAgICAgICAgICAgICAvLyAgICAgc3R5bGUuc2l6ZSA9IFN0eWxlLndpZHRoLnBpeGVscygxMCwgdGlsZSk7XG4gICAgICAgICAgICAgICAgLy8gfVxuXG4gICAgICAgICAgICAgICAgdmFyIHZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHN0eWxlLmNvbG9yWzBdLCBzdHlsZS5jb2xvclsxXSwgc3R5bGUuY29sb3JbMl0sXG4gICAgICAgICAgICAgICAgICAgIGxuXG4gICAgICAgICAgICAgICAgICAgIC8vIFRPRE86IGFkZCBtYXRlcmlhbCBpbmZvLCBldGMuXG4gICAgICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yWzBdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzFdLCBzdHlsZS5vdXRsaW5lLmNvbG9yWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgbG4gLSAwLjUgLy8gb3V0bGluZXMgc2l0IGJldHdlZW4gbGF5ZXJzLCB1bmRlcm5lYXRoIGN1cnJlbnQgbGF5ZXIgYnV0IGFib3ZlIHRoZSBvbmUgYmVsb3dcbiAgICAgICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB2YXIgcG9pbnRzID0gbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgbGluZXMgPSBudWxsLFxuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IG51bGw7XG5cbiAgICAgICAgICAgICAgICBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2x5Z29uJykge1xuICAgICAgICAgICAgICAgICAgICBwb2x5Z29ucyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aVBvbHlnb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvbHlnb25zID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdMaW5lU3RyaW5nJykge1xuICAgICAgICAgICAgICAgICAgICBsaW5lcyA9IFtmZWF0dXJlLmdlb21ldHJ5LmNvb3JkaW5hdGVzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdNdWx0aUxpbmVTdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGxpbmVzID0gZmVhdHVyZS5nZW9tZXRyeS5jb29yZGluYXRlcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSBpZiAoZmVhdHVyZS5nZW9tZXRyeS50eXBlID09ICdQb2ludCcpIHtcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzID0gW2ZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXNdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmIChmZWF0dXJlLmdlb21ldHJ5LnR5cGUgPT0gJ011bHRpUG9pbnQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IGZlYXR1cmUuZ2VvbWV0cnkuY29vcmRpbmF0ZXM7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKHBvbHlnb25zICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gRXh0cnVkZWQgcG9seWdvbnMgKGUuZy4gM0QgYnVpbGRpbmdzKVxuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUuZXh0cnVkZSAmJiBzdHlsZS5oZWlnaHQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRFeHRydWRlZFBvbHlnb25zKHBvbHlnb25zLCB6LCBzdHlsZS5oZWlnaHQsIHN0eWxlLm1pbl9oZWlnaHQsIHZlcnRleF9kYXRhW21vZGVdLCB7IHZlcnRleF9jb25zdGFudHM6IHZlcnRleF9jb25zdGFudHMgfSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgLy8gUmVndWxhciBwb2x5Z29uc1xuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5Z29ucyhwb2x5Z29ucywgeiwgdmVydGV4X2RhdGFbbW9kZV0sIHsgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50cyB9KTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gdmFyIHBvbHlnb25fdmVydGV4X2NvbnN0YW50cyA9IFt6LCAwLCAwLCAxXS5jb25jYXQodmVydGV4X2NvbnN0YW50cyk7IC8vIHVwd2FyZHMtZmFjaW5nIG5vcm1hbFxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gR0xCdWlsZGVycy5idWlsZFBvbHlnb25zMihcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBwb2x5Z29ucyxcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICAgICAgR0wuYWRkVmVydGljZXModmVydGljZXMucG9zaXRpb25zLCB2ZXJ0ZXhfZGF0YVttb2RlXSwgcG9seWdvbl92ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gUG9seWdvbiBvdXRsaW5lc1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3R5bGUub3V0bGluZS5jb2xvciAmJiBzdHlsZS5vdXRsaW5lLndpZHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBtcGM9MDsgbXBjIDwgcG9seWdvbnMubGVuZ3RoOyBtcGMrKykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMocG9seWdvbnNbbXBjXSwgR0xSZW5kZXJlci5jYWxjdWxhdGVaKGxheWVyLCB0aWxlLCAtMC41KSwgc3R5bGUub3V0bGluZS53aWR0aCwgdmVydGV4X2RhdGFbbW9kZV0sIHsgY2xvc2VkX3BvbHlnb246IHRydWUsIHJlbW92ZV90aWxlX2VkZ2VzOiB0cnVlLCB2ZXJ0ZXhfY29uc3RhbnRzOiBvdXRsaW5lX3ZlcnRleF9jb25zdGFudHMgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICBpZiAobGluZXMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICBHTEJ1aWxkZXJzLmJ1aWxkUG9seWxpbmVzKGxpbmVzLCB6LCBzdHlsZS53aWR0aCwgdmVydGV4X2RhdGFbbW9kZV0sIHsgdmVydGV4X2NvbnN0YW50czogdmVydGV4X2NvbnN0YW50cyB9KTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBMaW5lIG91dGxpbmVzXG4gICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZS5vdXRsaW5lLmNvbG9yICYmIHN0eWxlLm91dGxpbmUud2lkdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIEdMQnVpbGRlcnMuYnVpbGRQb2x5bGluZXMobGluZXMsIEdMUmVuZGVyZXIuY2FsY3VsYXRlWihsYXllciwgdGlsZSwgLTAuNSksIHN0eWxlLndpZHRoICsgMiAqIHN0eWxlLm91dGxpbmUud2lkdGgsIHZlcnRleF9kYXRhW21vZGVdLCB7IHZlcnRleF9jb25zdGFudHM6IG91dGxpbmVfdmVydGV4X2NvbnN0YW50cyB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGlmIChwb2ludHMgIT0gbnVsbCkge1xuICAgICAgICAgICAgICAgICAgICAvLyBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShmZWF0dXJlKSk7XG4gICAgICAgICAgICAgICAgICAgIC8vIE5PVEU6IGFkZGluZyB0byB6IHRvIGV4cGVyaW1lbnQgd2l0aCBcImZsb2F0aW5nXCIgUE9Jc1xuICAgICAgICAgICAgICAgICAgICB2YXIgcG9pbnRfdmVydGV4X2NvbnN0YW50cyA9IFt6ICsgMSwgMCwgMCwgMV0uY29uY2F0KHZlcnRleF9jb25zdGFudHMpOyAvLyB1cHdhcmRzLWZhY2luZyBub3JtYWxcbiAgICAgICAgICAgICAgICAgICAgR0xCdWlsZGVycy5idWlsZFF1YWRzKFxuICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRzLCBzdHlsZS5zaXplICogMiwgc3R5bGUuc2l6ZSAqIDIsXG4gICAgICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAodmVydGljZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YXIgdnMgPSB2ZXJ0aWNlcy5wb3NpdGlvbnM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBBbHRlcm5hdGUgdmVydGV4IGxheW91dCBmb3IgJ3BvaW50cycgc2hhZGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKG1vZGUgPT0gJ3BvaW50cycpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcG9pbnRfdmVydGV4X2NvbnN0YW50cyA9IHZlcnRleF9jb25zdGFudHM7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZm9yICh2YXIgdiBpbiB2ZXJ0aWNlcy5wb3NpdGlvbnMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZzW3ZdID0gdmVydGljZXMucG9zaXRpb25zW3ZdLmNvbmNhdCh6KyAxLCB2ZXJ0aWNlcy50ZXhjb29yZHNbdl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gR0wuYWRkVmVydGljZXModmVydGljZXMucG9zaXRpb25zLCB2ZXJ0ZXhfZGF0YVttb2RlXSwgcG9pbnRfdmVydGV4X2NvbnN0YW50cyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgR0wuYWRkVmVydGljZXModnMsIHZlcnRleF9kYXRhW21vZGVdLCBwb2ludF92ZXJ0ZXhfY29uc3RhbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB7IHRleGNvb3JkczogKG1vZGUgPT0gJ3BvaW50cycpIH1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICB0aWxlLmRlYnVnLmZlYXR1cmVzKys7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aWxlLnZlcnRleF9kYXRhID0ge307XG4gICAgZm9yICh2YXIgcyBpbiB2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICB0aWxlLnZlcnRleF9kYXRhW3NdID0gbmV3IEZsb2F0MzJBcnJheSh2ZXJ0ZXhfZGF0YVtzXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHRpbGU7XG59O1xuXG4vLyBDYWxsZWQgb24gbWFpbiB0aHJlYWQgd2hlbiBhIHdlYiB3b3JrZXIgY29tcGxldGVzIHByb2Nlc3NpbmcgZm9yIGEgc2luZ2xlIHRpbGVcbkdMUmVuZGVyZXIucHJvdG90eXBlLl90aWxlV29ya2VyQ29tcGxldGVkID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdmFyIHZlcnRleF9kYXRhID0gdGlsZS52ZXJ0ZXhfZGF0YTtcblxuICAgIC8vIENyZWF0ZSBHTCBnZW9tZXRyeSBvYmplY3RzXG4gICAgdGlsZS5nbF9nZW9tZXRyeSA9IHt9O1xuXG4gICAgZm9yICh2YXIgcyBpbiB2ZXJ0ZXhfZGF0YSkge1xuICAgICAgICB0aWxlLmdsX2dlb21ldHJ5W3NdID0gdGhpcy5yZW5kZXJfbW9kZXNbc10ubWFrZUdMR2VvbWV0cnkodmVydGV4X2RhdGFbc10pO1xuICAgIH1cblxuICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyA9IDA7XG4gICAgdGlsZS5kZWJ1Zy5idWZmZXJfc2l6ZSA9IDA7XG4gICAgZm9yICh2YXIgcCBpbiB0aWxlLmdsX2dlb21ldHJ5KSB7XG4gICAgICAgIHRpbGUuZGVidWcuZ2VvbWV0cmllcyArPSB0aWxlLmdsX2dlb21ldHJ5W3BdLmdlb21ldHJ5X2NvdW50O1xuICAgICAgICB0aWxlLmRlYnVnLmJ1ZmZlcl9zaXplICs9IHRpbGUuZ2xfZ2VvbWV0cnlbcF0udmVydGV4X2RhdGEuYnl0ZUxlbmd0aDtcbiAgICB9XG5cbiAgICB0aWxlLmRlYnVnLmdlb21fcmF0aW8gPSAodGlsZS5kZWJ1Zy5nZW9tZXRyaWVzIC8gdGlsZS5kZWJ1Zy5mZWF0dXJlcykudG9GaXhlZCgxKTtcblxuICAgIC8vIFNlbGVjdGlvbiAtIGV4cGVyaW1lbnRhbC9mdXR1cmVcbiAgICAvLyB2YXIgZ2xfcmVuZGVyZXIgPSB0aGlzO1xuICAgIC8vIHZhciBwaXhlbCA9IG5ldyBVaW50OEFycmF5KDQpO1xuICAgIC8vIHRpbGVEaXYub25tb3VzZW1vdmUgPSBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAvLyAgICAgLy8gY29uc29sZS5sb2coZXZlbnQub2Zmc2V0WCArICcsICcgKyBldmVudC5vZmZzZXRZICsgJyB8ICcgKyBwYXJzZUludCh0aWxlRGl2LnN0eWxlLmxlZnQpICsgJywgJyArIHBhcnNlSW50XG4gICAgLy8gICAgIHZhciBwID0gUG9pbnQoXG4gICAgLy8gICAgICAgICBldmVudC5vZmZzZXRYICsgcGFyc2VJbnQodGlsZURpdi5zdHlsZS5sZWZ0KSxcbiAgICAvLyAgICAgICAgIGV2ZW50Lm9mZnNldFkgKyBwYXJzZUludCh0aWxlRGl2LnN0eWxlLnRvcClcbiAgICAvLyAgICAgKTtcbiAgICAvLyAgICAgZ2xfcmVuZGVyZXIuZ2wucmVhZFBpeGVscyhwLngsIHAueSwgMSwgMSwgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgcGl4ZWwpO1xuICAgIC8vICAgICBjb25zb2xlLmxvZyhwLnggKyAnLCAnICsgcC55ICsgJzogKCcgKyBwaXhlbFswXSArICcsICcgKyBwaXhlbFsxXSArICcsICcgKyBwaXhlbFsyXSArICcsICcgKyBwaXhlbFszXSArICcpJylcbiAgICAvLyB9O1xuXG4gICAgZGVsZXRlIHRpbGUudmVydGV4X2RhdGE7IC8vIFRPRE86IG1pZ2h0IHdhbnQgdG8gcHJlc2VydmUgdGhpcyBmb3IgcmVidWlsZGluZyBnZW9tZXRyaWVzIHdoZW4gc3R5bGVzL2V0Yy4gY2hhbmdlP1xufTtcblxuR0xSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVGlsZSA9IGZ1bmN0aW9uIEdMUmVuZGVyZXJSZW1vdmVUaWxlIChrZXkpXG57XG4gICAgaWYgKHRoaXMubWFwX3pvb21pbmcgPT0gdHJ1ZSkge1xuICAgICAgICByZXR1cm47IC8vIHNob3J0IGNpcmN1aXQgdGlsZSByZW1vdmFsLCBHTCByZW5kZXJlciB3aWxsIHN3ZWVwIG91dCB0aWxlcyBieSB6b29tIGxldmVsIHdoZW4gem9vbSBlbmRzXG4gICAgfVxuXG4gICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW2tleV07XG5cbiAgICBpZiAodGlsZSAhPSBudWxsICYmIHRpbGUuZ2xfZ2VvbWV0cnkgIT0gbnVsbCkge1xuICAgICAgICBmb3IgKHZhciBwIGluIHRpbGUuZ2xfZ2VvbWV0cnkpIHtcbiAgICAgICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnlbcF0uZGVzdHJveSgpO1xuICAgICAgICB9XG4gICAgICAgIHRpbGUuZ2xfZ2VvbWV0cnkgPSBudWxsO1xuICAgIH1cbiAgICBWZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucmVtb3ZlVGlsZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufTtcblxuR0xSZW5kZXJlci5wcm90b3R5cGUucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb20gPSAyO1xuR0xSZW5kZXJlci5wcm90b3R5cGUuc2V0Wm9vbSA9IGZ1bmN0aW9uICh6b29tKVxue1xuICAgIC8vIFNjaGVkdWxlIEdMIHRpbGVzIGZvciByZW1vdmFsIG9uIHpvb21cbiAgICBjb25zb2xlLmxvZyhcInJlbmRlcmVyLm1hcF9sYXN0X3pvb206IFwiICsgdGhpcy5tYXBfbGFzdF96b29tKTtcblxuICAgIHRoaXMubWFwX3pvb21pbmcgPSBmYWxzZTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHZhciBiZWxvdyA9IHRoaXMuem9vbTtcbiAgICB2YXIgYWJvdmUgPSB0aGlzLnpvb207XG4gICAgaWYgKE1hdGguYWJzKHRoaXMuem9vbSAtIHRoaXMubWFwX2xhc3Rfem9vbSkgPD0gdGhpcy5wcmVzZXJ2ZV90aWxlc193aXRoaW5fem9vbSkge1xuICAgICAgICBpZiAodGhpcy56b29tID4gdGhpcy5tYXBfbGFzdF96b29tKSB7XG4gICAgICAgICAgICBiZWxvdyA9IHRoaXMuem9vbSAtIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBhYm92ZSA9IHRoaXMuem9vbSArIHRoaXMucHJlc2VydmVfdGlsZXNfd2l0aGluX3pvb207XG4gICAgICAgIH1cbiAgICB9XG4gICAgdGhpcy5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UoYmVsb3csIGFib3ZlKTtcbiAgICB0aGlzLm1hcF9sYXN0X3pvb20gPSB0aGlzLnpvb207XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7IC8vIGNhbGxpbmcgYmVjYXVzZSB0aGlzIGlzIGEgZnVsbCBvdmVycmlkZSBvZiB0aGUgcGFyZW50IGNsYXNzXG59O1xuXG5HTFJlbmRlcmVyLnByb3RvdHlwZS5yZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgPSBmdW5jdGlvbiAoYmVsb3csIGFib3ZlKVxue1xuICAgIGJlbG93ID0gTWF0aC5taW4oYmVsb3csIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYmVsb3cpO1xuICAgIGFib3ZlID0gTWF0aC5taW4oYWJvdmUsIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgYWJvdmUpO1xuXG4gICAgY29uc29sZS5sb2coXCJyZW1vdmVUaWxlc091dHNpZGVab29tUmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgdmFyIHJlbW92ZV90aWxlcyA9IFtdO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNbdF07XG4gICAgICAgIGlmICh0aWxlLmNvb3Jkcy56IDwgYmVsb3cgfHwgdGlsZS5jb29yZHMueiA+IGFib3ZlKSB7XG4gICAgICAgICAgICByZW1vdmVfdGlsZXMucHVzaCh0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBmb3IgKHZhciByPTA7IHIgPCByZW1vdmVfdGlsZXMubGVuZ3RoOyByKyspIHtcbiAgICAgICAgdmFyIGtleSA9IHJlbW92ZV90aWxlc1tyXTtcbiAgICAgICAgY29uc29sZS5sb2coXCJyZW1vdmVkIFwiICsga2V5ICsgXCIgKG91dHNpZGUgcmFuZ2UgW1wiICsgYmVsb3cgKyBcIiwgXCIgKyBhYm92ZSArIFwiXSlcIik7XG4gICAgICAgIHRoaXMucmVtb3ZlVGlsZShrZXkpO1xuICAgIH1cbn07XG5cbi8vIE92ZXJyaWRlcyBiYXNlIGNsYXNzIG1ldGhvZCAoYSBubyBvcClcbkdMUmVuZGVyZXIucHJvdG90eXBlLnJlc2l6ZU1hcCA9IGZ1bmN0aW9uICh3aWR0aCwgaGVpZ2h0KVxue1xuICAgIFZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5yZXNpemVNYXAuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuY3NzX3NpemUgPSB7IHdpZHRoOiB3aWR0aCwgaGVpZ2h0OiBoZWlnaHQgfTtcbiAgICB0aGlzLmRldmljZV9zaXplID0geyB3aWR0aDogTWF0aC5yb3VuZCh0aGlzLmNzc19zaXplLndpZHRoICogdGhpcy5kZXZpY2VfcGl4ZWxfcmF0aW8pLCBoZWlnaHQ6IE1hdGgucm91bmQodGhpcy5jc3Nfc2l6ZS5oZWlnaHQgKiB0aGlzLmRldmljZV9waXhlbF9yYXRpbykgfTtcblxuICAgIHRoaXMuY2FudmFzLnN0eWxlLndpZHRoID0gdGhpcy5jc3Nfc2l6ZS53aWR0aCArICdweCc7XG4gICAgdGhpcy5jYW52YXMuc3R5bGUuaGVpZ2h0ID0gdGhpcy5jc3Nfc2l6ZS5oZWlnaHQgKyAncHgnO1xuICAgIHRoaXMuY2FudmFzLndpZHRoID0gdGhpcy5kZXZpY2Vfc2l6ZS53aWR0aDtcbiAgICB0aGlzLmNhbnZhcy5oZWlnaHQgPSB0aGlzLmRldmljZV9zaXplLmhlaWdodDtcbiAgICB0aGlzLmdsLnZpZXdwb3J0KDAsIDAsIHRoaXMuY2FudmFzLndpZHRoLCB0aGlzLmNhbnZhcy5oZWlnaHQpO1xufTtcblxuR0xSZW5kZXJlci5wcm90b3R5cGUuX3JlbmRlciA9IGZ1bmN0aW9uIEdMUmVuZGVyZXJSZW5kZXIgKClcbntcbiAgICB2YXIgZ2wgPSB0aGlzLmdsO1xuXG4gICAgdGhpcy5pbnB1dCgpO1xuXG4gICAgLy8gUmVzZXQgZnJhbWUgc3RhdGVcbiAgICBnbC5jbGVhckNvbG9yKDAuMCwgMC4wLCAwLjAsIDEuMCk7XG4gICAgZ2wuY2xlYXIoZ2wuQ09MT1JfQlVGRkVSX0JJVCB8IGdsLkRFUFRIX0JVRkZFUl9CSVQpO1xuICAgIGdsLmVuYWJsZShnbC5ERVBUSF9URVNUKTtcbiAgICBnbC5kZXB0aEZ1bmMoZ2wuTEVTUyk7XG4gICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSk7XG4gICAgZ2wuY3VsbEZhY2UoZ2wuQkFDSyk7XG5cbiAgICAvLyBSZW5kZXIgdGlsZXMgZ3JvdXBlZCBieSByZW5kZXJnIG1vZGUgKEdMIHByb2dyYW0pXG4gICAgdmFyIHJlbmRlcl9jb3VudCA9IDA7XG4gICAgZm9yICh2YXIgbW9kZSBpbiB0aGlzLnJlbmRlcl9tb2Rlcykge1xuICAgICAgICB2YXIgZ2xfcHJvZ3JhbSA9IHRoaXMucmVuZGVyX21vZGVzW21vZGVdLmdsX3Byb2dyYW07XG5cbiAgICAgICAgZ2wudXNlUHJvZ3JhbShnbF9wcm9ncmFtLnByb2dyYW0pO1xuXG4gICAgICAgIC8vIFRPRE86IHNldCB0aGVzZSBvbmNlIHBlciBwcm9ncmFtLCBkb24ndCBzZXQgd2hlbiB0aGV5IGhhdmVuJ3QgY2hhbmdlZFxuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3Jlc29sdXRpb24nLCB0aGlzLmNzc19zaXplLndpZHRoLCB0aGlzLmNzc19zaXplLmhlaWdodCk7XG4gICAgICAgIGdsX3Byb2dyYW0udW5pZm9ybSgnMWYnLCAndGltZScsICgoK25ldyBEYXRlKCkpIC0gdGhpcy5zdGFydF90aW1lKSAvIDEwMDApO1xuXG4gICAgICAgIHZhciBjZW50ZXIgPSBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5jZW50ZXIubG5nLCB0aGlzLmNlbnRlci5sYXQpKTtcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICdtYXBfY2VudGVyJywgY2VudGVyLngsIGNlbnRlci55KTtcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICdtYXBfem9vbScsIHRoaXMuem9vbSk7IC8vIE1hdGguZmxvb3IodGhpcy56b29tKSArIChNYXRoLmxvZygodGhpcy56b29tICUgMSkgKyAxKSAvIE1hdGguTE4yIC8vIHNjYWxlIGZyYWN0aW9uYWwgem9vbSBieSBsb2dcbiAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcxZicsICdudW1fbGF5ZXJzJywgdGhpcy5sYXllcnMubGVuZ3RoKTtcblxuICAgICAgICB2YXIgbWV0ZXJzX3Blcl9waXhlbCA9IEdlby5taW5fem9vbV9tZXRlcnNfcGVyX3BpeGVsIC8gTWF0aC5wb3coMiwgdGhpcy56b29tKTtcbiAgICAgICAgdmFyIG1ldGVyX3pvb20gPSBQb2ludCh0aGlzLmNzc19zaXplLndpZHRoIC8gMiAqIG1ldGVyc19wZXJfcGl4ZWwsIHRoaXMuY3NzX3NpemUuaGVpZ2h0IC8gMiAqIG1ldGVyc19wZXJfcGl4ZWwpO1xuICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ21ldGVyX3pvb20nLCBtZXRlcl96b29tLngsIG1ldGVyX3pvb20ueSk7XG5cbiAgICAgICAgLy8gVE9ETzogbWFrZSBhIGxpc3Qgb2YgcmVuZGVyYWJsZSB0aWxlcyBvbmNlIHBlciBmcmFtZSwgb3V0c2lkZSB0aGlzIGxvb3BcbiAgICAgICAgLy8gUmVuZGVyIHRpbGUgR0wgZ2VvbWV0cmllc1xuICAgICAgICB2YXIgY2FwcGVkX3pvb20gPSBNYXRoLm1pbih+fnRoaXMuem9vbSwgdGhpcy50aWxlX3NvdXJjZS5tYXhfem9vbSB8fCB+fnRoaXMuem9vbSk7XG4gICAgICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSB0aGlzLnRpbGVzW3RdO1xuICAgICAgICAgICAgaWYgKHRpbGUubG9hZGVkID09IHRydWUgJiZcbiAgICAgICAgICAgICAgICB0aWxlLnZpc2libGUgPT0gdHJ1ZSAmJlxuICAgICAgICAgICAgICAgIE1hdGgubWluKHRpbGUuY29vcmRzLnosIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20gfHwgdGlsZS5jb29yZHMueikgPT0gY2FwcGVkX3pvb20pIHtcblxuICAgICAgICAgICAgICAgIGlmICh0aWxlLmdsX2dlb21ldHJ5W21vZGVdICE9IG51bGwpIHtcbiAgICAgICAgICAgICAgICAgICAgZ2xfcHJvZ3JhbS51bmlmb3JtKCcyZicsICd0aWxlX21pbicsIHRpbGUubWluLngsIHRpbGUubWluLnkpO1xuICAgICAgICAgICAgICAgICAgICBnbF9wcm9ncmFtLnVuaWZvcm0oJzJmJywgJ3RpbGVfbWF4JywgdGlsZS5tYXgueCwgdGlsZS5tYXgueSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdGlsZS5nbF9nZW9tZXRyeVttb2RlXS5yZW5kZXIoKTtcbiAgICAgICAgICAgICAgICAgICAgcmVuZGVyX2NvdW50ICs9IHRpbGUuZ2xfZ2VvbWV0cnlbbW9kZV0uZ2VvbWV0cnlfY291bnQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHJlbmRlcl9jb3VudCAhPSB0aGlzLmxhc3RfcmVuZGVyX2NvdW50KSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwicmVuZGVyZWQgXCIgKyByZW5kZXJfY291bnQgKyBcIiBwcmltaXRpdmVzXCIpO1xuICAgIH1cbiAgICB0aGlzLmxhc3RfcmVuZGVyX2NvdW50ID0gcmVuZGVyX2NvdW50O1xuXG4gICAgaWYgKHRoaXMuY29udGludW91c19hbmltYXRpb24gPT0gdHJ1ZSkge1xuICAgICAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdHJ1ZTtcbn07XG5cbi8vIFN1bSBvZiBhIGRlYnVnIHByb3BlcnR5IGFjcm9zcyB0aWxlc1xuR0xSZW5kZXJlci5wcm90b3R5cGUuZ2V0RGVidWdTdW0gPSBmdW5jdGlvbiAocHJvcCwgZmlsdGVyKVxue1xuICAgIHZhciBzdW0gPSAwO1xuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXSAhPSBudWxsICYmICh0eXBlb2YgZmlsdGVyICE9ICdmdW5jdGlvbicgfHwgZmlsdGVyKHRoaXMudGlsZXNbdF0pID09IHRydWUpKSB7XG4gICAgICAgICAgICBzdW0gKz0gdGhpcy50aWxlc1t0XS5kZWJ1Z1twcm9wXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VtO1xufTtcblxuLy8gQXZlcmFnZSBvZiBhIGRlYnVnIHByb3BlcnR5IGFjcm9zcyB0aWxlc1xuR0xSZW5kZXJlci5wcm90b3R5cGUuZ2V0RGVidWdBdmVyYWdlID0gZnVuY3Rpb24gKHByb3AsIGZpbHRlcilcbntcbiAgICByZXR1cm4gdGhpcy5nZXREZWJ1Z1N1bShwcm9wLCBmaWx0ZXIpIC8gT2JqZWN0LmtleXModGhpcy50aWxlcykubGVuZ3RoO1xufTtcblxuLy8gVXNlciBpbnB1dFxuLy8gVE9ETzogcmVzdG9yZSBmcmFjdGlvbmFsIHpvb20gc3VwcG9ydCBvbmNlIGxlYWZsZXQgYW5pbWF0aW9uIHJlZmFjdG9yIHB1bGwgcmVxdWVzdCBpcyBtZXJnZWRcblxuR0xSZW5kZXJlci5wcm90b3R5cGUuaW5pdElucHV0SGFuZGxlcnMgPSBmdW5jdGlvbiBHTFJlbmRlcmVySW5pdElucHV0SGFuZGxlcnMgKClcbntcbiAgICB2YXIgZ2xfcmVuZGVyZXIgPSB0aGlzO1xuICAgIGdsX3JlbmRlcmVyLmtleSA9IG51bGw7XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmIChldmVudC5rZXlDb2RlID09IDM3KSB7XG4gICAgICAgICAgICBnbF9yZW5kZXJlci5rZXkgPSAnbGVmdCc7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoZXZlbnQua2V5Q29kZSA9PSAzOSkge1xuICAgICAgICAgICAgZ2xfcmVuZGVyZXIua2V5ID0gJ3JpZ2h0JztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDM4KSB7XG4gICAgICAgICAgICBnbF9yZW5kZXJlci5rZXkgPSAndXAnO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGV2ZW50LmtleUNvZGUgPT0gNDApIHtcbiAgICAgICAgICAgIGdsX3JlbmRlcmVyLmtleSA9ICdkb3duJztcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmIChldmVudC5rZXlDb2RlID09IDgzKSB7IC8vIHNcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwicmVsb2FkaW5nIHNoYWRlcnNcIik7XG4gICAgICAgICAgICBmb3IgKHZhciBtb2RlIGluIHRoaXMucmVuZGVyX21vZGVzKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZW5kZXJfbW9kZXNbbW9kZV0uZ2xfcHJvZ3JhbS5jb21waWxlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBnbF9yZW5kZXJlci5kaXJ0eSA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2tleXVwJywgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGdsX3JlbmRlcmVyLmtleSA9IG51bGw7XG4gICAgfSk7XG59O1xuXG5HTFJlbmRlcmVyLnByb3RvdHlwZS5pbnB1dCA9IGZ1bmN0aW9uIEdMUmVuZGVyZXJJbnB1dCAoKVxue1xuICAgIC8vIC8vIEZyYWN0aW9uYWwgem9vbSBzY2FsaW5nXG4gICAgLy8gaWYgKHRoaXMua2V5ID09ICd1cCcpIHtcbiAgICAvLyAgICAgdGhpcy5zZXRab29tKHRoaXMuem9vbSArIHRoaXMuem9vbV9zdGVwKTtcbiAgICAvLyB9XG4gICAgLy8gZWxzZSBpZiAodGhpcy5rZXkgPT0gJ2Rvd24nKSB7XG4gICAgLy8gICAgIHRoaXMuc2V0Wm9vbSh0aGlzLnpvb20gLSB0aGlzLnpvb21fc3RlcCk7XG4gICAgLy8gfVxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBHTFJlbmRlcmVyO1xufVxuIiwiLy8gR2VuZXJhdGVkIGZyb20gR0xTTCBmaWxlcywgZG9uJ3QgZWRpdCFcbnZhciBzaGFkZXJfc291cmNlcyA9IHt9O1xuXG5zaGFkZXJfc291cmNlc1sncG9pbnRfZnJhZ21lbnQnXSA9XG5cInVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgZmNvbG9yO1xcblwiICtcblwidmFyeWluZyB2ZWMyIGZ0ZXhjb29yZDtcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluICh2b2lkKSB7XFxuXCIgK1xuXCIgICAgdmVjNCBjb2xvciA9IHZlYzQoZmNvbG9yLCAxLik7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyBpZiAobGVuZ3RoKGZ0ZXhjb29yZC54eSkgPiAxMC4pIHtcXG5cIiArXG5cIiAgICAvLyAgICAgLy8gY29sb3IgPSB2ZWM0KDAuLCAwLiwgMC4sIDAuKTtcXG5cIiArXG5cIiAgICAvLyAgICAgZGlzY2FyZDtcXG5cIiArXG5cIiAgICAvLyB9XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICBmbG9hdCBsZW4gPSBsZW5ndGgoZnRleGNvb3JkKTtcXG5cIiArXG5cIiAgICBpZiAobGVuID4gMS4pIHtcXG5cIiArXG5cIiAgICAgICAgZGlzY2FyZDtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCIgICAgY29sb3IucmdiICo9ICgxLiAtIHNtb290aHN0ZXAoLjI1LCAxLiwgbGVuKSkgKyAwLjU7XFxuXCIgK1xuXCIgICAgLy8gY29sb3IuYSA9ICgxLiAtIHNtb290aHN0ZXAoMi41LCAxMC4sIGxlbikpICsgMC4yNTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICNpZiBkZWZpbmVkKEVGRkVDVF9TQ1JFRU5fQ09MT1IpXFxuXCIgK1xuXCIgICAgICAgIC8vIE11dGF0ZSBjb2xvcnMgYnkgc2NyZWVuIHBvc2l0aW9uXFxuXCIgK1xuXCIgICAgICAgIGNvbG9yLnJnYiArPSB2ZWMzKGdsX0ZyYWdDb29yZC54IC8gcmVzb2x1dGlvbi54LCAwLjAsIGdsX0ZyYWdDb29yZC55IC8gcmVzb2x1dGlvbi55KTtcXG5cIiArXG5cIiAgICAjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiICAgIGdsX0ZyYWdDb2xvciA9IGNvbG9yO1xcblwiICtcblwifVxcblwiICtcblwiXCI7XG5cbnNoYWRlcl9zb3VyY2VzWydwb2ludF92ZXJ0ZXgnXSA9XG5cInVuaWZvcm0gdmVjMiBtYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCBtYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiBtZXRlcl96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHRpbGVfbWluO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHRpbGVfbWF4O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCBudW1fbGF5ZXJzO1xcblwiICtcblwiLy8gdW5pZm9ybSBmbG9hdCB0aW1lO1xcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcXG5cIiArXG5cIi8vIGF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMyIHRleGNvb3JkO1xcblwiICtcblwiYXR0cmlidXRlIHZlYzMgY29sb3I7XFxuXCIgK1xuXCJhdHRyaWJ1dGUgZmxvYXQgbGF5ZXI7XFxuXCIgK1xuXCJcXG5cIiArXG5cInZhcnlpbmcgdmVjMyBmY29sb3I7XFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzIgZnRleGNvb3JkO1xcblwiICtcblwiXFxuXCIgK1xuXCIvLyB2ZWMzIGxpZ2h0ID0gbm9ybWFsaXplKHZlYzMoMC4yLCAwLjcsIC0wLjUpKTsgLy8gdmVjMygwLjEsIDAuMiwgLTAuNClcXG5cIiArXG5cIi8vIGNvbnN0IGZsb2F0IGFtYmllbnQgPSAwLjQ1O1xcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgICAgdmVjMyB2cG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgICAvLyB2ZWMzIHZub3JtYWwgPSBub3JtYWw7XFxuXCIgK1xuXCIgICAgLy8gdmVjMiB2dGV4Y29vcmQgPSB0ZXhjb29yZDtcXG5cIiArXG5cIlxcblwiICtcblwiICAgIC8vIENhbGMgcG9zaXRpb24gb2YgdmVydGV4IGluIG1ldGVycywgcmVsYXRpdmUgdG8gY2VudGVyIG9mIHNjcmVlblxcblwiICtcblwiICAgIHZwb3NpdGlvbi55ICo9IC0xLjA7IC8vIGFkanVzdCBmb3IgZmxpcHBlZCB5LWNvb3Jkc1xcblwiICtcblwiICAgIHZwb3NpdGlvbi54eSAqPSAodGlsZV9tYXggLSB0aWxlX21pbikgLyBUSUxFX1NDQUxFOyAvLyBhZGp1c3QgZm9yIHZlcnRleCBsb2NhdGlvbiB3aXRoaW4gdGlsZSAoc2NhbGVkIGZyb20gbG9jYWwgY29vcmRzIHRvIG1ldGVycylcXG5cIiArXG5cIiAgICB2cG9zaXRpb24ueHkgKz0gdGlsZV9taW4ueHkgLSBtYXBfY2VudGVyOyAvLyBhZGp1c3QgZm9yIGNvcm5lciBvZiB0aWxlIHJlbGF0aXZlIHRvIG1hcCBjZW50ZXJcXG5cIiArXG5cIiAgICB2cG9zaXRpb24ueHkgLz0gbWV0ZXJfem9vbTsgLy8gYWRqdXN0IGZvciB6b29tIGluIG1ldGVycyB0byBnZXQgY2xpcCBzcGFjZSBjb29yZHNcXG5cIiArXG5cIlxcblwiICtcblwiICAgIC8vIFNoYWRpbmcgJiB0ZXh0dXJlXFxuXCIgK1xuXCIgICAgZmNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICAgZnRleGNvb3JkID0gdGV4Y29vcmQ7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyAjaWYgZGVmaW5lZChQUk9KRUNUSU9OX1BFUlNQRUNUSVZFKVxcblwiICtcblwiICAgIC8vICAgICAvLyBQZXJzcGVjdGl2ZS1zdHlsZSBwcm9qZWN0aW9uXFxuXCIgK1xuXCIgICAgLy8gICAgIHZlYzIgcGVyc3BlY3RpdmVfb2Zmc2V0ID0gdmVjMigtMC4yNSwgLTAuMjUpO1xcblwiICtcblwiICAgIC8vICAgICB2ZWMyIHBlcnNwZWN0aXZlX2ZhY3RvciA9IHZlYzIoMC44LCAwLjgpOyAvLyB2ZWMyKC0wLjI1LCAwLjc1KTtcXG5cIiArXG5cIiAgICAvLyAgICAgdnBvc2l0aW9uLnh5ICs9IHZwb3NpdGlvbi56ICogcGVyc3BlY3RpdmVfZmFjdG9yICogKHZwb3NpdGlvbi54eSAtIHBlcnNwZWN0aXZlX29mZnNldCkgLyBtZXRlcl96b29tLnh5OyAvLyBwZXJzcGVjdGl2ZSBmcm9tIG9mZnNldCBjZW50ZXIgc2NyZWVuXFxuXCIgK1xuXCIgICAgLy8gI2VsaWYgZGVmaW5lZChQUk9KRUNUSU9OX0lTT01FVFJJQykgfHwgZGVmaW5lZChQUk9KRUNUSU9OX1BPUFVQKVxcblwiICtcblwiICAgIC8vICAgICAvLyBQb3AtdXAgZWZmZWN0IC0gM2QgaW4gY2VudGVyIG9mIHZpZXdwb3J0LCBmYWRpbmcgdG8gMmQgYXQgZWRnZXNcXG5cIiArXG5cIiAgICAvLyAgICAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QT1BVUClcXG5cIiArXG5cIiAgICAvLyAgICAgICAgIGlmICh2cG9zaXRpb24ueiA+IDEuMCkge1xcblwiICtcblwiICAgIC8vICAgICAgICAgICAgIGZsb2F0IGNkID0gZGlzdGFuY2UodnBvc2l0aW9uLnh5ICogKHJlc29sdXRpb24ueHkgLyByZXNvbHV0aW9uLnl5KSwgdmVjMigwLjAsIDAuMCkpO1xcblwiICtcblwiICAgIC8vICAgICAgICAgICAgIGNvbnN0IGZsb2F0IHBvcHVwX2ZhZGVfaW5uZXIgPSAwLjU7XFxuXCIgK1xuXCIgICAgLy8gICAgICAgICAgICAgY29uc3QgZmxvYXQgcG9wdXBfZmFkZV9vdXRlciA9IDAuNzU7XFxuXCIgK1xuXCIgICAgLy8gICAgICAgICAgICAgaWYgKGNkID4gcG9wdXBfZmFkZV9pbm5lcikge1xcblwiICtcblwiICAgIC8vICAgICAgICAgICAgICAgICB2cG9zaXRpb24ueiAqPSAxLjAgLSBzbW9vdGhzdGVwKHBvcHVwX2ZhZGVfaW5uZXIsIHBvcHVwX2ZhZGVfb3V0ZXIsIGNkKTtcXG5cIiArXG5cIiAgICAvLyAgICAgICAgICAgICB9XFxuXCIgK1xuXCIgICAgLy8gICAgICAgICAgICAgY29uc3QgZmxvYXQgem9vbV9ib29zdF9zdGFydCA9IDE1LjA7XFxuXCIgK1xuXCIgICAgLy8gICAgICAgICAgICAgY29uc3QgZmxvYXQgem9vbV9ib29zdF9lbmQgPSAxNy4wO1xcblwiICtcblwiICAgIC8vICAgICAgICAgICAgIGNvbnN0IGZsb2F0IHpvb21fYm9vc3RfbWFnbml0dWRlID0gMC43NTtcXG5cIiArXG5cIiAgICAvLyAgICAgICAgICAgICB2cG9zaXRpb24ueiAqPSAxLjAgKyAoMS4wIC0gc21vb3Roc3RlcCh6b29tX2Jvb3N0X3N0YXJ0LCB6b29tX2Jvb3N0X2VuZCwgbWFwX3pvb20pKSAqIHpvb21fYm9vc3RfbWFnbml0dWRlO1xcblwiICtcblwiICAgIC8vICAgICAgICAgfVxcblwiICtcblwiICAgIC8vICAgICAjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiICAgIC8vICAgICAvLyBJc29tZXRyaWMtc3R5bGUgcHJvamVjdGlvblxcblwiICtcblwiICAgIC8vICAgICB2cG9zaXRpb24ueSArPSB2cG9zaXRpb24ueiAvIG1ldGVyX3pvb20ueTsgLy8geiBjb29yZGluYXRlIGlzIGEgc2ltcGxlIHRyYW5zbGF0aW9uIHVwIGFsb25nIHkgYXhpcywgYWxhIGlzb21ldHJpY1xcblwiICtcblwiICAgIC8vICAgICAvLyB2cG9zaXRpb24ueSArPSB2cG9zaXRpb24ueiAqIDAuNTsgLy8gY2xvc2VyIHRvIFVsdGltYSA3LXN0eWxlIGF4b25vbWV0cmljXFxuXCIgK1xuXCIgICAgLy8gICAgIC8vIHZwb3NpdGlvbi54IC09IHZwb3NpdGlvbi56ICogMC41O1xcblwiICtcblwiICAgIC8vICNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gUmV2ZXJzZSBhbmQgc2NhbGUgdG8gMC0xIGZvciBHTCBkZXB0aCBidWZmZXJcXG5cIiArXG5cIiAgICAvLyBMYXllcnMgYXJlIGZvcmNlLW9yZGVyZWQgKGhpZ2hlciBsYXllcnMgZ3VhcmFudGVlZCB0byByZW5kZXIgb24gdG9wIG9mIGxvd2VyKSwgdGhlbiBieSBoZWlnaHQvZGVwdGhcXG5cIiArXG5cIiAgICBmbG9hdCB6X2xheWVyX3NjYWxlID0gNDA5Ni47XFxuXCIgK1xuXCIgICAgZmxvYXQgel9sYXllcl9yYW5nZSA9IChudW1fbGF5ZXJzICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgICBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pICogel9sYXllcl9zY2FsZTtcXG5cIiArXG5cIiAgICAvLyBmbG9hdCB6X2xheWVyID0gKGxheWVyICsgMS4pO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgdnBvc2l0aW9uLnogPSB6X2xheWVyICsgY2xhbXAodnBvc2l0aW9uLnosIDEuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgICB2cG9zaXRpb24ueiA9ICh6X2xheWVyX3JhbmdlIC0gdnBvc2l0aW9uLnopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgIGdsX1Bvc2l0aW9uID0gdmVjNCh2cG9zaXRpb24sIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fZnJhZ21lbnQnXSA9XG5cInVuaWZvcm0gdmVjMiByZXNvbHV0aW9uO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB0aW1lO1xcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgZmNvbG9yO1xcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIiAgICB2YXJ5aW5nIHZlYzMgZnBvc2l0aW9uO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy80MjAwMjI0L3JhbmRvbS1ub2lzZS1mdW5jdGlvbnMtZm9yLWdsc2xcXG5cIiArXG5cIiAgICAvLyBmbG9hdCByYW5kICh2ZWMyIGNvKSB7XFxuXCIgK1xuXCIgICAgLy8gICAgcmV0dXJuIGZyYWN0KHNpbihkb3QoY28ueHksIHZlYzIoMTIuOTg5OCwgNzguMjMzKSkpICogNDM3NTguNTQ1Myk7XFxuXCIgK1xuXCIgICAgLy8gfVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gTm9pc2UgZnVuY3Rpb25zIGZyb206IGh0dHBzOi8vZ2l0aHViLmNvbS9hc2hpbWEvd2ViZ2wtbm9pc2VcXG5cIiArXG5cIiAgICB2ZWMzIG1vZDI4OSh2ZWMzIHgpIHtcXG5cIiArXG5cIiAgICAgICAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICB2ZWM0IG1vZDI4OSh2ZWM0IHgpIHtcXG5cIiArXG5cIiAgICAgICAgcmV0dXJuIHggLSBmbG9vcih4ICogKDEuMCAvIDI4OS4wKSkgKiAyODkuMDtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICB2ZWM0IHBlcm11dGUodmVjNCB4KSB7XFxuXCIgK1xuXCIgICAgICAgIHJldHVybiBtb2QyODkoKCh4KjM0LjApKzEuMCkqeCk7XFxuXCIgK1xuXCIgICAgfVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgdmVjNCB0YXlsb3JJbnZTcXJ0KHZlYzQgcikge1xcblwiICtcblwiICAgICAgICByZXR1cm4gMS43OTI4NDI5MTQwMDE1OSAtIDAuODUzNzM0NzIwOTUzMTQgKiByO1xcblwiICtcblwiICAgIH1cXG5cIiArXG5cIlxcblwiICtcblwiICAgIHZlYzMgZmFkZSh2ZWMzIHQpIHtcXG5cIiArXG5cIiAgICAgICAgcmV0dXJuIHQqdCp0Kih0Kih0KjYuMC0xNS4wKSsxMC4wKTtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICBmbG9hdCBzbm9pc2UodmVjMyB2KSB7XFxuXCIgK1xuXCIgICAgICAgIGNvbnN0IHZlYzIgIEMgPSB2ZWMyKDEuMC82LjAsIDEuMC8zLjApIDtcXG5cIiArXG5cIiAgICAgICAgY29uc3QgdmVjNCAgRCA9IHZlYzQoMC4wLCAwLjUsIDEuMCwgMi4wKTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAvLyBGaXJzdCBjb3JuZXJcXG5cIiArXG5cIiAgICAgICAgdmVjMyBpICA9IGZsb29yKHYgKyBkb3QodiwgQy55eXkpICk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgeDAgPSAgIHYgLSBpICsgZG90KGksIEMueHh4KSA7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgLy8gT3RoZXIgY29ybmVyc1xcblwiICtcblwiICAgICAgICB2ZWMzIGcgPSBzdGVwKHgwLnl6eCwgeDAueHl6KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBsID0gMS4wIC0gZztcXG5cIiArXG5cIiAgICAgICAgdmVjMyBpMSA9IG1pbiggZy54eXosIGwuenh5ICk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgaTIgPSBtYXgoIGcueHl6LCBsLnp4eSApO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIC8vICAgeDAgPSB4MCAtIDAuMCArIDAuMCAqIEMueHh4O1xcblwiICtcblwiICAgICAgICAvLyAgIHgxID0geDAgLSBpMSAgKyAxLjAgKiBDLnh4eDtcXG5cIiArXG5cIiAgICAgICAgLy8gICB4MiA9IHgwIC0gaTIgICsgMi4wICogQy54eHg7XFxuXCIgK1xuXCIgICAgICAgIC8vICAgeDMgPSB4MCAtIDEuMCArIDMuMCAqIEMueHh4O1xcblwiICtcblwiICAgICAgICB2ZWMzIHgxID0geDAgLSBpMSArIEMueHh4O1xcblwiICtcblwiICAgICAgICB2ZWMzIHgyID0geDAgLSBpMiArIEMueXl5OyAvLyAyLjAqQy54ID0gMS8zID0gQy55XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgeDMgPSB4MCAtIEQueXl5OyAgICAgIC8vIC0xLjArMy4wKkMueCA9IC0wLjUgPSAtRC55XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgLy8gUGVybXV0YXRpb25zXFxuXCIgK1xuXCIgICAgICAgIGkgPSBtb2QyODkoaSk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgcCA9IHBlcm11dGUoIHBlcm11dGUoIHBlcm11dGUoXFxuXCIgK1xuXCIgICAgICAgIGkueiArIHZlYzQoMC4wLCBpMS56LCBpMi56LCAxLjAgKSlcXG5cIiArXG5cIiAgICAgICAgKyBpLnkgKyB2ZWM0KDAuMCwgaTEueSwgaTIueSwgMS4wICkpXFxuXCIgK1xuXCIgICAgICAgICsgaS54ICsgdmVjNCgwLjAsIGkxLngsIGkyLngsIDEuMCApKTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAvLyBHcmFkaWVudHM6IDd4NyBwb2ludHMgb3ZlciBhIHNxdWFyZSwgbWFwcGVkIG9udG8gYW4gb2N0YWhlZHJvbi5cXG5cIiArXG5cIiAgICAgICAgLy8gVGhlIHJpbmcgc2l6ZSAxNyoxNyA9IDI4OSBpcyBjbG9zZSB0byBhIG11bHRpcGxlIG9mIDQ5ICg0OSo2ID0gMjk0KVxcblwiICtcblwiICAgICAgICBmbG9hdCBuXyA9IDAuMTQyODU3MTQyODU3OyAvLyAxLjAvNy4wXFxuXCIgK1xuXCIgICAgICAgIHZlYzMgIG5zID0gbl8gKiBELnd5eiAtIEQueHp4O1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgaiA9IHAgLSA0OS4wICogZmxvb3IocCAqIG5zLnogKiBucy56KTsgIC8vICBtb2QocCw3KjcpXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjNCB4XyA9IGZsb29yKGogKiBucy56KTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCB5XyA9IGZsb29yKGogLSA3LjAgKiB4XyApOyAgICAvLyBtb2QoaixOKVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgeCA9IHhfICpucy54ICsgbnMueXl5eTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCB5ID0geV8gKm5zLnggKyBucy55eXl5O1xcblwiICtcblwiICAgICAgICB2ZWM0IGggPSAxLjAgLSBhYnMoeCkgLSBhYnMoeSk7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjNCBiMCA9IHZlYzQoIHgueHksIHkueHkgKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBiMSA9IHZlYzQoIHguencsIHkuencgKTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAvL3ZlYzQgczAgPSB2ZWM0KGxlc3NUaGFuKGIwLDAuMCkpKjIuMCAtIDEuMDtcXG5cIiArXG5cIiAgICAgICAgLy92ZWM0IHMxID0gdmVjNChsZXNzVGhhbihiMSwwLjApKSoyLjAgLSAxLjA7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgczAgPSBmbG9vcihiMCkqMi4wICsgMS4wO1xcblwiICtcblwiICAgICAgICB2ZWM0IHMxID0gZmxvb3IoYjEpKjIuMCArIDEuMDtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBzaCA9IC1zdGVwKGgsIHZlYzQoMC4wKSk7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjNCBhMCA9IGIwLnh6eXcgKyBzMC54enl3KnNoLnh4eXkgO1xcblwiICtcblwiICAgICAgICB2ZWM0IGExID0gYjEueHp5dyArIHMxLnh6eXcqc2guenp3dyA7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjMyBwMCA9IHZlYzMoYTAueHksaC54KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBwMSA9IHZlYzMoYTAuencsaC55KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBwMiA9IHZlYzMoYTEueHksaC56KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBwMyA9IHZlYzMoYTEuencsaC53KTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAvL05vcm1hbGlzZSBncmFkaWVudHNcXG5cIiArXG5cIiAgICAgICAgdmVjNCBub3JtID0gdGF5bG9ySW52U3FydCh2ZWM0KGRvdChwMCxwMCksIGRvdChwMSxwMSksIGRvdChwMiwgcDIpLCBkb3QocDMscDMpKSk7XFxuXCIgK1xuXCIgICAgICAgIHAwICo9IG5vcm0ueDtcXG5cIiArXG5cIiAgICAgICAgcDEgKj0gbm9ybS55O1xcblwiICtcblwiICAgICAgICBwMiAqPSBub3JtLno7XFxuXCIgK1xuXCIgICAgICAgIHAzICo9IG5vcm0udztcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAvLyBNaXggZmluYWwgbm9pc2UgdmFsdWVcXG5cIiArXG5cIiAgICAgICAgdmVjNCBtID0gbWF4KDAuNiAtIHZlYzQoZG90KHgwLHgwKSwgZG90KHgxLHgxKSwgZG90KHgyLHgyKSwgZG90KHgzLHgzKSksIDAuMCk7XFxuXCIgK1xuXCIgICAgICAgIG0gPSBtICogbTtcXG5cIiArXG5cIiAgICAgICAgcmV0dXJuIDQyLjAgKiBkb3QoIG0qbSwgdmVjNCggZG90KHAwLHgwKSwgZG90KHAxLHgxKSwgZG90KHAyLHgyKSwgZG90KHAzLHgzKSApICk7XFxuXCIgK1xuXCIgICAgfVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gQ2xhc3NpYyBQZXJsaW4gbm9pc2VcXG5cIiArXG5cIiAgICBmbG9hdCBjbm9pc2UodmVjMyBQKSB7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgUGkwID0gZmxvb3IoUCk7IC8vIEludGVnZXIgcGFydCBmb3IgaW5kZXhpbmdcXG5cIiArXG5cIiAgICAgICAgdmVjMyBQaTEgPSBQaTAgKyB2ZWMzKDEuMCk7IC8vIEludGVnZXIgcGFydCArIDFcXG5cIiArXG5cIiAgICAgICAgUGkwID0gbW9kMjg5KFBpMCk7XFxuXCIgK1xuXCIgICAgICAgIFBpMSA9IG1vZDI4OShQaTEpO1xcblwiICtcblwiICAgICAgICB2ZWMzIFBmMCA9IGZyYWN0KFApOyAvLyBGcmFjdGlvbmFsIHBhcnQgZm9yIGludGVycG9sYXRpb25cXG5cIiArXG5cIiAgICAgICAgdmVjMyBQZjEgPSBQZjAgLSB2ZWMzKDEuMCk7IC8vIEZyYWN0aW9uYWwgcGFydCAtIDEuMFxcblwiICtcblwiICAgICAgICB2ZWM0IGl4ID0gdmVjNChQaTAueCwgUGkxLngsIFBpMC54LCBQaTEueCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgaXkgPSB2ZWM0KFBpMC55eSwgUGkxLnl5KTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBpejAgPSBQaTAuenp6ejtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBpejEgPSBQaTEuenp6ejtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICB2ZWM0IGl4eSA9IHBlcm11dGUocGVybXV0ZShpeCkgKyBpeSk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgaXh5MCA9IHBlcm11dGUoaXh5ICsgaXowKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBpeHkxID0gcGVybXV0ZShpeHkgKyBpejEpO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3gwID0gaXh5MCAqICgxLjAgLyA3LjApO1xcblwiICtcblwiICAgICAgICB2ZWM0IGd5MCA9IGZyYWN0KGZsb29yKGd4MCkgKiAoMS4wIC8gNy4wKSkgLSAwLjU7XFxuXCIgK1xuXCIgICAgICAgIGd4MCA9IGZyYWN0KGd4MCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3owID0gdmVjNCgwLjUpIC0gYWJzKGd4MCkgLSBhYnMoZ3kwKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBzejAgPSBzdGVwKGd6MCwgdmVjNCgwLjApKTtcXG5cIiArXG5cIiAgICAgICAgZ3gwIC09IHN6MCAqIChzdGVwKDAuMCwgZ3gwKSAtIDAuNSk7XFxuXCIgK1xuXCIgICAgICAgIGd5MCAtPSBzejAgKiAoc3RlcCgwLjAsIGd5MCkgLSAwLjUpO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3gxID0gaXh5MSAqICgxLjAgLyA3LjApO1xcblwiICtcblwiICAgICAgICB2ZWM0IGd5MSA9IGZyYWN0KGZsb29yKGd4MSkgKiAoMS4wIC8gNy4wKSkgLSAwLjU7XFxuXCIgK1xuXCIgICAgICAgIGd4MSA9IGZyYWN0KGd4MSk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3oxID0gdmVjNCgwLjUpIC0gYWJzKGd4MSkgLSBhYnMoZ3kxKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBzejEgPSBzdGVwKGd6MSwgdmVjNCgwLjApKTtcXG5cIiArXG5cIiAgICAgICAgZ3gxIC09IHN6MSAqIChzdGVwKDAuMCwgZ3gxKSAtIDAuNSk7XFxuXCIgK1xuXCIgICAgICAgIGd5MSAtPSBzejEgKiAoc3RlcCgwLjAsIGd5MSkgLSAwLjUpO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzAwMCA9IHZlYzMoZ3gwLngsZ3kwLngsZ3owLngpO1xcblwiICtcblwiICAgICAgICB2ZWMzIGcxMDAgPSB2ZWMzKGd4MC55LGd5MC55LGd6MC55KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBnMDEwID0gdmVjMyhneDAueixneTAueixnejAueik7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzExMCA9IHZlYzMoZ3gwLncsZ3kwLncsZ3owLncpO1xcblwiICtcblwiICAgICAgICB2ZWMzIGcwMDEgPSB2ZWMzKGd4MS54LGd5MS54LGd6MS54KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBnMTAxID0gdmVjMyhneDEueSxneTEueSxnejEueSk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzAxMSA9IHZlYzMoZ3gxLnosZ3kxLnosZ3oxLnopO1xcblwiICtcblwiICAgICAgICB2ZWMzIGcxMTEgPSB2ZWMzKGd4MS53LGd5MS53LGd6MS53KTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICB2ZWM0IG5vcm0wID0gdGF5bG9ySW52U3FydCh2ZWM0KGRvdChnMDAwLCBnMDAwKSwgZG90KGcwMTAsIGcwMTApLCBkb3QoZzEwMCwgZzEwMCksIGRvdChnMTEwLCBnMTEwKSkpO1xcblwiICtcblwiICAgICAgICBnMDAwICo9IG5vcm0wLng7XFxuXCIgK1xuXCIgICAgICAgIGcwMTAgKj0gbm9ybTAueTtcXG5cIiArXG5cIiAgICAgICAgZzEwMCAqPSBub3JtMC56O1xcblwiICtcblwiICAgICAgICBnMTEwICo9IG5vcm0wLnc7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgbm9ybTEgPSB0YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDEsIGcwMDEpLCBkb3QoZzAxMSwgZzAxMSksIGRvdChnMTAxLCBnMTAxKSwgZG90KGcxMTEsIGcxMTEpKSk7XFxuXCIgK1xuXCIgICAgICAgIGcwMDEgKj0gbm9ybTEueDtcXG5cIiArXG5cIiAgICAgICAgZzAxMSAqPSBub3JtMS55O1xcblwiICtcblwiICAgICAgICBnMTAxICo9IG5vcm0xLno7XFxuXCIgK1xuXCIgICAgICAgIGcxMTEgKj0gbm9ybTEudztcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICBmbG9hdCBuMDAwID0gZG90KGcwMDAsIFBmMCk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4xMDAgPSBkb3QoZzEwMCwgdmVjMyhQZjEueCwgUGYwLnl6KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4wMTAgPSBkb3QoZzAxMCwgdmVjMyhQZjAueCwgUGYxLnksIFBmMC56KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4xMTAgPSBkb3QoZzExMCwgdmVjMyhQZjEueHksIFBmMC56KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4wMDEgPSBkb3QoZzAwMSwgdmVjMyhQZjAueHksIFBmMS56KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4xMDEgPSBkb3QoZzEwMSwgdmVjMyhQZjEueCwgUGYwLnksIFBmMS56KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4wMTEgPSBkb3QoZzAxMSwgdmVjMyhQZjAueCwgUGYxLnl6KSk7XFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4xMTEgPSBkb3QoZzExMSwgUGYxKTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICB2ZWMzIGZhZGVfeHl6ID0gZmFkZShQZjApO1xcblwiICtcblwiICAgICAgICB2ZWM0IG5feiA9IG1peCh2ZWM0KG4wMDAsIG4xMDAsIG4wMTAsIG4xMTApLCB2ZWM0KG4wMDEsIG4xMDEsIG4wMTEsIG4xMTEpLCBmYWRlX3h5ei56KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMiBuX3l6ID0gbWl4KG5fei54eSwgbl96Lnp3LCBmYWRlX3h5ei55KTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbl94eXogPSBtaXgobl95ei54LCBuX3l6LnksIGZhZGVfeHl6LngpO1xcblwiICtcblwiICAgICAgICByZXR1cm4gMi4yICogbl94eXo7XFxuXCIgK1xuXCIgICAgfVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gQ2xhc3NpYyBQZXJsaW4gbm9pc2UsIHBlcmlvZGljIHZhcmlhbnRcXG5cIiArXG5cIiAgICBmbG9hdCBwbm9pc2UodmVjMyBQLCB2ZWMzIHJlcCkge1xcblwiICtcblwiICAgICAgICB2ZWMzIFBpMCA9IG1vZChmbG9vcihQKSwgcmVwKTsgLy8gSW50ZWdlciBwYXJ0LCBtb2R1bG8gcGVyaW9kXFxuXCIgK1xuXCIgICAgICAgIHZlYzMgUGkxID0gbW9kKFBpMCArIHZlYzMoMS4wKSwgcmVwKTsgLy8gSW50ZWdlciBwYXJ0ICsgMSwgbW9kIHBlcmlvZFxcblwiICtcblwiICAgICAgICBQaTAgPSBtb2QyODkoUGkwKTtcXG5cIiArXG5cIiAgICAgICAgUGkxID0gbW9kMjg5KFBpMSk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgUGYwID0gZnJhY3QoUCk7IC8vIEZyYWN0aW9uYWwgcGFydCBmb3IgaW50ZXJwb2xhdGlvblxcblwiICtcblwiICAgICAgICB2ZWMzIFBmMSA9IFBmMCAtIHZlYzMoMS4wKTsgLy8gRnJhY3Rpb25hbCBwYXJ0IC0gMS4wXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgaXggPSB2ZWM0KFBpMC54LCBQaTEueCwgUGkwLngsIFBpMS54KTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBpeSA9IHZlYzQoUGkwLnl5LCBQaTEueXkpO1xcblwiICtcblwiICAgICAgICB2ZWM0IGl6MCA9IFBpMC56enp6O1xcblwiICtcblwiICAgICAgICB2ZWM0IGl6MSA9IFBpMS56enp6O1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgaXh5ID0gcGVybXV0ZShwZXJtdXRlKGl4KSArIGl5KTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBpeHkwID0gcGVybXV0ZShpeHkgKyBpejApO1xcblwiICtcblwiICAgICAgICB2ZWM0IGl4eTEgPSBwZXJtdXRlKGl4eSArIGl6MSk7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjNCBneDAgPSBpeHkwICogKDEuMCAvIDcuMCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3kwID0gZnJhY3QoZmxvb3IoZ3gwKSAqICgxLjAgLyA3LjApKSAtIDAuNTtcXG5cIiArXG5cIiAgICAgICAgZ3gwID0gZnJhY3QoZ3gwKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBnejAgPSB2ZWM0KDAuNSkgLSBhYnMoZ3gwKSAtIGFicyhneTApO1xcblwiICtcblwiICAgICAgICB2ZWM0IHN6MCA9IHN0ZXAoZ3owLCB2ZWM0KDAuMCkpO1xcblwiICtcblwiICAgICAgICBneDAgLT0gc3owICogKHN0ZXAoMC4wLCBneDApIC0gMC41KTtcXG5cIiArXG5cIiAgICAgICAgZ3kwIC09IHN6MCAqIChzdGVwKDAuMCwgZ3kwKSAtIDAuNSk7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjNCBneDEgPSBpeHkxICogKDEuMCAvIDcuMCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgZ3kxID0gZnJhY3QoZmxvb3IoZ3gxKSAqICgxLjAgLyA3LjApKSAtIDAuNTtcXG5cIiArXG5cIiAgICAgICAgZ3gxID0gZnJhY3QoZ3gxKTtcXG5cIiArXG5cIiAgICAgICAgdmVjNCBnejEgPSB2ZWM0KDAuNSkgLSBhYnMoZ3gxKSAtIGFicyhneTEpO1xcblwiICtcblwiICAgICAgICB2ZWM0IHN6MSA9IHN0ZXAoZ3oxLCB2ZWM0KDAuMCkpO1xcblwiICtcblwiICAgICAgICBneDEgLT0gc3oxICogKHN0ZXAoMC4wLCBneDEpIC0gMC41KTtcXG5cIiArXG5cIiAgICAgICAgZ3kxIC09IHN6MSAqIChzdGVwKDAuMCwgZ3kxKSAtIDAuNSk7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjMyBnMDAwID0gdmVjMyhneDAueCxneTAueCxnejAueCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzEwMCA9IHZlYzMoZ3gwLnksZ3kwLnksZ3owLnkpO1xcblwiICtcblwiICAgICAgICB2ZWMzIGcwMTAgPSB2ZWMzKGd4MC56LGd5MC56LGd6MC56KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBnMTEwID0gdmVjMyhneDAudyxneTAudyxnejAudyk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzAwMSA9IHZlYzMoZ3gxLngsZ3kxLngsZ3oxLngpO1xcblwiICtcblwiICAgICAgICB2ZWMzIGcxMDEgPSB2ZWMzKGd4MS55LGd5MS55LGd6MS55KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMyBnMDExID0gdmVjMyhneDEueixneTEueixnejEueik7XFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZzExMSA9IHZlYzMoZ3gxLncsZ3kxLncsZ3oxLncpO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzQgbm9ybTAgPSB0YXlsb3JJbnZTcXJ0KHZlYzQoZG90KGcwMDAsIGcwMDApLCBkb3QoZzAxMCwgZzAxMCksIGRvdChnMTAwLCBnMTAwKSwgZG90KGcxMTAsIGcxMTApKSk7XFxuXCIgK1xuXCIgICAgICAgIGcwMDAgKj0gbm9ybTAueDtcXG5cIiArXG5cIiAgICAgICAgZzAxMCAqPSBub3JtMC55O1xcblwiICtcblwiICAgICAgICBnMTAwICo9IG5vcm0wLno7XFxuXCIgK1xuXCIgICAgICAgIGcxMTAgKj0gbm9ybTAudztcXG5cIiArXG5cIiAgICAgICAgdmVjNCBub3JtMSA9IHRheWxvckludlNxcnQodmVjNChkb3QoZzAwMSwgZzAwMSksIGRvdChnMDExLCBnMDExKSwgZG90KGcxMDEsIGcxMDEpLCBkb3QoZzExMSwgZzExMSkpKTtcXG5cIiArXG5cIiAgICAgICAgZzAwMSAqPSBub3JtMS54O1xcblwiICtcblwiICAgICAgICBnMDExICo9IG5vcm0xLnk7XFxuXCIgK1xuXCIgICAgICAgIGcxMDEgKj0gbm9ybTEuejtcXG5cIiArXG5cIiAgICAgICAgZzExMSAqPSBub3JtMS53O1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIGZsb2F0IG4wMDAgPSBkb3QoZzAwMCwgUGYwKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjEwMCA9IGRvdChnMTAwLCB2ZWMzKFBmMS54LCBQZjAueXopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjAxMCA9IGRvdChnMDEwLCB2ZWMzKFBmMC54LCBQZjEueSwgUGYwLnopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjExMCA9IGRvdChnMTEwLCB2ZWMzKFBmMS54eSwgUGYwLnopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjAwMSA9IGRvdChnMDAxLCB2ZWMzKFBmMC54eSwgUGYxLnopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjEwMSA9IGRvdChnMTAxLCB2ZWMzKFBmMS54LCBQZjAueSwgUGYxLnopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjAxMSA9IGRvdChnMDExLCB2ZWMzKFBmMC54LCBQZjEueXopKTtcXG5cIiArXG5cIiAgICAgICAgZmxvYXQgbjExMSA9IGRvdChnMTExLCBQZjEpO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgICAgIHZlYzMgZmFkZV94eXogPSBmYWRlKFBmMCk7XFxuXCIgK1xuXCIgICAgICAgIHZlYzQgbl96ID0gbWl4KHZlYzQobjAwMCwgbjEwMCwgbjAxMCwgbjExMCksIHZlYzQobjAwMSwgbjEwMSwgbjAxMSwgbjExMSksIGZhZGVfeHl6LnopO1xcblwiICtcblwiICAgICAgICB2ZWMyIG5feXogPSBtaXgobl96Lnh5LCBuX3ouencsIGZhZGVfeHl6LnkpO1xcblwiICtcblwiICAgICAgICBmbG9hdCBuX3h5eiA9IG1peChuX3l6LngsIG5feXoueSwgZmFkZV94eXoueCk7XFxuXCIgK1xuXCIgICAgICAgIHJldHVybiAyLjIgKiBuX3h5ejtcXG5cIiArXG5cIiAgICB9XFxuXCIgK1xuXCIjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwidm9pZCBtYWluICh2b2lkKSB7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAjaWYgZGVmaW5lZChFRkZFQ1RfU1BPVExJR0hUKVxcblwiICtcblwiICAgIC8vIFNwb3RsaWdodCBlZmZlY3RcXG5cIiArXG5cIiAgICAgICAgdmVjMiBwb3NpdGlvbiA9IGdsX0ZyYWdDb29yZC54eSAvIHJlc29sdXRpb24ueHk7ICAgIC8vIHNjYWxlIGNvb3JkcyB0byBbMC4wLCAxLjBdXFxuXCIgK1xuXCIgICAgICAgIHBvc2l0aW9uID0gcG9zaXRpb24gKiAyLjAgLSAxLjA7ICAgICAgICAgICAgICAgICAgICAvLyBzY2FsZSBjb29yZHMgdG8gWy0xLjAsIDEuMF1cXG5cIiArXG5cIiAgICAgICAgcG9zaXRpb24ueSAqPSByZXNvbHV0aW9uLnkgLyByZXNvbHV0aW9uLng7ICAgICAgICAgIC8vIGNvcnJlY3QgYXNwZWN0IHJhdGlvXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgdmVjMyBjb2xvciA9IGZjb2xvciAqIG1heCgxLjAgLSBkaXN0YW5jZShwb3NpdGlvbiwgdmVjMigwLjAsIDAuMCkpLCAwLjIpO1xcblwiICtcblwiICAgICAgICAvLyB2ZWMzIGNvbG9yID0gZmNvbG9yICogKDEuMCAtIGRvdChub3JtYWxpemUodmVjMyhyYW5kKGdsX0ZyYWdDb29yZC54eSAqIDAuMDEpICogMTAuMCwgMC4wLCAtMS4wKSksIHZlYzMoMCwgMCwgMS4wKSkpO1xcblwiICtcblwiICAgICNlbHNlXFxuXCIgK1xuXCIgICAgICAgIHZlYzMgY29sb3IgPSBmY29sb3I7XFxuXCIgK1xuXCIgICAgI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAjaWYgZGVmaW5lZChFRkZFQ1RfQ09MT1JfQkxFRUQpXFxuXCIgK1xuXCIgICAgICAgIC8vIE11dGF0ZSBjb2xvcnMgYnkgc2NyZWVuIHBvc2l0aW9uIG9yIHRpbWVcXG5cIiArXG5cIiAgICAgICAgY29sb3IgKz0gdmVjMyhnbF9GcmFnQ29vcmQueCAvIHJlc29sdXRpb24ueCwgMC4wLCBnbF9GcmFnQ29vcmQueSAvIHJlc29sdXRpb24ueSk7XFxuXCIgK1xuXCIgICAgICAgIGNvbG9yLnIgKz0gc2luKHRpbWUgLyAzLjApO1xcblwiICtcblwiICAgICNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gTXV0YXRlIGNvbG9yIGJ5IDNkIG5vaXNlXFxuXCIgK1xuXCIgICAgI2lmIGRlZmluZWQgKEVGRkVDVF9OT0lTRV9URVhUVVJFKVxcblwiICtcblwiICAgICAgICAjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfQU5JTUFUQUJMRSkgJiYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfQU5JTUFURUQpXFxuXCIgK1xuXCIgICAgICAgICAgICBjb2xvciAqPSAoYWJzKGNub2lzZSgoZnBvc2l0aW9uICsgdmVjMyh0aW1lICogNS4sIHRpbWUgKiA3LjUsIHRpbWUgKiAxMC4pKSAvIDEwLjApKSAvIDQuMCkgKyAwLjc1O1xcblwiICtcblwiICAgICAgICAjZW5kaWZcXG5cIiArXG5cIiAgICAgICAgI2lmbmRlZiBFRkZFQ1RfTk9JU0VfQU5JTUFUQUJMRVxcblwiICtcblwiICAgICAgICAgICAgY29sb3IgKj0gKGFicyhjbm9pc2UoZnBvc2l0aW9uIC8gMTAuMCkpIC8gNC4wKSArIDAuNzU7XFxuXCIgK1xuXCIgICAgICAgICNlbmRpZlxcblwiICtcblwiICAgICNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgZ2xfRnJhZ0NvbG9yID0gdmVjNChjb2xvciwgMS4wKTtcXG5cIiArXG5cIiAgICAvLyBnbF9GcmFnQ29sb3IgPSB2ZWM0KDEuMCwgMC4wLCAwLjAsIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuc2hhZGVyX3NvdXJjZXNbJ3BvbHlnb25fdmVydGV4J10gPVxuXCIvLyAjZGVmaW5lIFBST0pFQ1RJT05fUEVSU1BFQ1RJVkVcXG5cIiArXG5cIi8vICNkZWZpbmUgUFJPSkVDVElPTl9JU09NRVRSSUNcXG5cIiArXG5cIi8vICNkZWZpbmUgUFJPSkVDVElPTl9QT1BVUFxcblwiICtcblwiXFxuXCIgK1xuXCIvLyAjZGVmaW5lIExJR0hUSU5HX1BPSU5UXFxuXCIgK1xuXCIvLyAjZGVmaW5lIExJR0hUSU5HX0RJUkVDVElPTlxcblwiICtcblwiXFxuXCIgK1xuXCIvLyAjZGVmaW5lIEFOSU1BVElPTl9FTEVWQVRPUlxcblwiICtcblwiLy8gI2RlZmluZSBBTklNQVRJT05fV0FWRVxcblwiICtcblwiXFxuXCIgK1xuXCJ1bmlmb3JtIHZlYzIgcmVzb2x1dGlvbjtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiBtYXBfY2VudGVyO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCBtYXBfem9vbTtcXG5cIiArXG5cInVuaWZvcm0gdmVjMiBtZXRlcl96b29tO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHRpbGVfbWluO1xcblwiICtcblwidW5pZm9ybSB2ZWMyIHRpbGVfbWF4O1xcblwiICtcblwidW5pZm9ybSBmbG9hdCBudW1fbGF5ZXJzO1xcblwiICtcblwidW5pZm9ybSBmbG9hdCB0aW1lO1xcblwiICtcblwiXFxuXCIgK1xuXCJhdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbjtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIG5vcm1hbDtcXG5cIiArXG5cImF0dHJpYnV0ZSB2ZWMzIGNvbG9yO1xcblwiICtcblwiYXR0cmlidXRlIGZsb2F0IGxheWVyO1xcblwiICtcblwiXFxuXCIgK1xuXCJ2YXJ5aW5nIHZlYzMgZmNvbG9yO1xcblwiICtcblwiXFxuXCIgK1xuXCIjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIiAgICB2YXJ5aW5nIHZlYzMgZnBvc2l0aW9uO1xcblwiICtcblwiI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cInZlYzMgbGlnaHQgPSBub3JtYWxpemUodmVjMygwLjIsIDAuNywgLTAuNSkpOyAvLyB2ZWMzKDAuMSwgMC4yLCAtMC40KVxcblwiICtcblwiY29uc3QgZmxvYXQgYW1iaWVudCA9IDAuNDU7XFxuXCIgK1xuXCJcXG5cIiArXG5cIi8vIFByb2plY3QgbGF0LWxuZyB0byBtZXJjYXRvclxcblwiICtcblwiLy8gdmVjMiBsYXRMbmdUb01ldGVycyAodmVjMiBjb29yZGluYXRlKSB7XFxuXCIgK1xuXCIvLyAgICAgY29uc3QgZmxvYXQgcGkgPSAzLjE0MTU5MjY7XFxuXCIgK1xuXCIvLyAgICAgY29uc3QgZmxvYXQgaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyA9IDIwMDM3NTA4LjM0Mjc4OTI0NDtcXG5cIiArXG5cIi8vICAgICB2ZWMyIHByb2plY3RlZDtcXG5cIiArXG5cIlxcblwiICtcblwiLy8gICAgIC8vIExhdGl0dWRlXFxuXCIgK1xuXCIvLyAgICAgcHJvamVjdGVkLnkgPSBsb2codGFuKChjb29yZGluYXRlLnkgKyA5MC4wKSAqIHBpIC8gMzYwLjApKSAvIChwaSAvIDE4MC4wKTtcXG5cIiArXG5cIi8vICAgICBwcm9qZWN0ZWQueSA9IHByb2plY3RlZC55ICogaGFsZl9jaXJjdW1mZXJlbmNlX21ldGVycyAvIDE4MC4wO1xcblwiICtcblwiXFxuXCIgK1xuXCIvLyAgICAgLy8gTG9uZ2l0dWRlXFxuXCIgK1xuXCIvLyAgICAgcHJvamVjdGVkLnggPSBjb29yZGluYXRlLnggKiBoYWxmX2NpcmN1bWZlcmVuY2VfbWV0ZXJzIC8gMTgwLjA7XFxuXCIgK1xuXCJcXG5cIiArXG5cIi8vICAgICByZXR1cm4gcHJvamVjdGVkO1xcblwiICtcblwiLy8gfVxcblwiICtcblwiXFxuXCIgK1xuXCJ2b2lkIG1haW4oKSB7XFxuXCIgK1xuXCIgICAgdmVjMyB2cG9zaXRpb24gPSBwb3NpdGlvbjtcXG5cIiArXG5cIiAgICB2ZWMzIHZub3JtYWwgPSBub3JtYWw7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyBDYWxjIHBvc2l0aW9uIG9mIHZlcnRleCBpbiBtZXRlcnMsIHJlbGF0aXZlIHRvIGNlbnRlciBvZiBzY3JlZW5cXG5cIiArXG5cIiAgICB2cG9zaXRpb24ueSAqPSAtMS4wOyAvLyBhZGp1c3QgZm9yIGZsaXBwZWQgeS1jb29yZHNcXG5cIiArXG5cIiAgICAvLyB2cG9zaXRpb24ueSArPSBUSUxFX1NDQUxFOyAvLyBhbHRlcm5hdGUsIHRvIGFsc28gYWRqdXN0IGZvciBmb3JjZS1wb3NpdGl2ZSB5IGNvb3JkcyBpbiB0aWxlXFxuXCIgK1xuXCIgICAgdnBvc2l0aW9uLnh5ICo9ICh0aWxlX21heCAtIHRpbGVfbWluKSAvIFRJTEVfU0NBTEU7IC8vIGFkanVzdCBmb3IgdmVydGV4IGxvY2F0aW9uIHdpdGhpbiB0aWxlIChzY2FsZWQgZnJvbSBsb2NhbCBjb29yZHMgdG8gbWV0ZXJzKVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgLy8gVmVydGV4IGRpc3BsYWNlbWVudCArIHByb2NlZHVyYWwgZWZmZWN0c1xcblwiICtcblwiICAgICNpZiBkZWZpbmVkKEFOSU1BVElPTl9FTEVWQVRPUikgfHwgZGVmaW5lZChBTklNQVRJT05fV0FWRSkgfHwgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIiAgICAgICAgdmVjMyB2cG9zaXRpb25fd29ybGQgPSB2cG9zaXRpb24gKyB2ZWMzKHRpbGVfbWluLCAwLik7IC8vIG5lZWQgdmVydGV4IGluIHdvcmxkIGNvb3JkcyAoYmVmb3JlIG1hcCBjZW50ZXIgdHJhbnNmb3JtKSwgaGFjayB0byBnZXQgYXJvdW5kIHByZWNpc2lvbiBpc3N1ZXMgKHNlZSBiZWxvdylcXG5cIiArXG5cIlxcblwiICtcblwiICAgICAgICAjaWYgZGVmaW5lZChFRkZFQ1RfTk9JU0VfVEVYVFVSRSlcXG5cIiArXG5cIiAgICAgICAgICAgIGZwb3NpdGlvbiA9IHZwb3NpdGlvbl93b3JsZDtcXG5cIiArXG5cIiAgICAgICAgI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgaWYgKHZwb3NpdGlvbl93b3JsZC56ID4gMS4wKSB7XFxuXCIgK1xuXCIgICAgICAgICAgICAvLyB2cG9zaXRpb24ueCArPSBzaW4odnBvc2l0aW9uX3dvcmxkLnogKyB0aW1lKSAqIDEwLjAgKiBzaW4ocG9zaXRpb24ueCk7IC8vIHN3YXlpbmcgYnVpbGRpbmdzXFxuXCIgK1xuXCIgICAgICAgICAgICAvLyB2cG9zaXRpb24ueSArPSBjb3ModnBvc2l0aW9uX3dvcmxkLnogKyB0aW1lKSAqIDEwLjA7XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgICAgICNpZiBkZWZpbmVkKEFOSU1BVElPTl9FTEVWQVRPUilcXG5cIiArXG5cIiAgICAgICAgICAgICAgICAvLyB2cG9zaXRpb24ueiAqPSAoc2luKHZwb3NpdGlvbl93b3JsZC56IC8gMjUuMCAqIHRpbWUpICsgMS4wKSAvIDIuMCArIDAuMTsgLy8gZXZlbGF0b3IgYnVpbGRpbmdzXFxuXCIgK1xuXCIgICAgICAgICAgICAgICAgdnBvc2l0aW9uLnogKj0gbWF4KChzaW4odnBvc2l0aW9uX3dvcmxkLnogKyB0aW1lKSArIDEuMCkgLyAyLjAsIDAuMDUpOyAvLyBldmVsYXRvciBidWlsZGluZ3NcXG5cIiArXG5cIiAgICAgICAgICAgICNlbGlmIGRlZmluZWQoQU5JTUFUSU9OX1dBVkUpXFxuXCIgK1xuXCIgICAgICAgICAgICAgICAgdnBvc2l0aW9uLnogKj0gbWF4KChzaW4odnBvc2l0aW9uX3dvcmxkLnggLyAxMDAuMCArIHRpbWUpICsgMS4wKSAvIDIuMCwgMC4wNSk7IC8vIHdhdmVcXG5cIiArXG5cIiAgICAgICAgICAgICNlbmRpZlxcblwiICtcblwiICAgICAgICB9XFxuXCIgK1xuXCIgICAgI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyBOT1RFOiBkdWUgdG8gdW5yZXNvbHZlZCBmbG9hdGluZyBwb2ludCBwcmVjaXNpb24gaXNzdWVzLCB0aWxlIGFuZCBtYXAgY2VudGVyIGFkanVzdG1lbnQgbmVlZCB0byBoYXBwZW4gaW4gT05FIG9wZXJhdGlvbiwgb3IgYXJ0aWZjYXRzIGFyZSBpbnRyb2R1Y2VkXFxuXCIgK1xuXCIgICAgdnBvc2l0aW9uLnh5ICs9IHRpbGVfbWluLnh5IC0gbWFwX2NlbnRlcjsgLy8gYWRqdXN0IGZvciBjb3JuZXIgb2YgdGlsZSByZWxhdGl2ZSB0byBtYXAgY2VudGVyXFxuXCIgK1xuXCIgICAgdnBvc2l0aW9uLnh5IC89IG1ldGVyX3pvb207IC8vIGFkanVzdCBmb3Igem9vbSBpbiBtZXRlcnMgdG8gZ2V0IGNsaXAgc3BhY2UgY29vcmRzXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyBTaGFkaW5nXFxuXCIgK1xuXCIgICAgZmNvbG9yID0gY29sb3I7XFxuXCIgK1xuXCIgICAgLy8gZmNvbG9yICs9IHZlYzMoc2luKHBvc2l0aW9uLnogKyB0aW1lKSwgMC4wLCAwLjApOyAvLyBjb2xvciBjaGFuZ2Ugb24gaGVpZ2h0ICsgdGltZVxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgI2lmIGRlZmluZWQoTElHSFRJTkdfUE9JTlQpIHx8IGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgICAgICAgIC8vIEdvdXJhdWQgc2hhZGluZ1xcblwiICtcblwiICAgICAgICBsaWdodCA9IHZlYzMoLTAuMjUsIC0wLjI1LCAwLjUwKTsgLy8gdmVjMygwLjEsIDAuMSwgMC4zNSk7IC8vIHBvaW50IGxpZ2h0IGxvY2F0aW9uXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgI2lmIGRlZmluZWQoTElHSFRJTkdfTklHSFQpXFxuXCIgK1xuXCIgICAgICAgICAgICAvLyBcXFwiTmlnaHRcXFwiIGVmZmVjdCBieSBmbGlwcGluZyB2ZXJ0ZXggelxcblwiICtcblwiICAgICAgICAgICAgbGlnaHQgPSBub3JtYWxpemUodmVjMyh2cG9zaXRpb24ueCwgdnBvc2l0aW9uLnksIHZwb3NpdGlvbi56KSAtIGxpZ2h0KTsgLy8gbGlnaHQgYW5nbGUgZnJvbSBsaWdodCBwb2ludCB0byB2ZXJ0ZXhcXG5cIiArXG5cIiAgICAgICAgICAgIGZjb2xvciAqPSBkb3Qodm5vcm1hbCwgbGlnaHQgKiAtMS4wKTsgLy8gKyBhbWJpZW50ICsgY2xhbXAodnBvc2l0aW9uLnogKiAyLjAgLyBtZXRlcl96b29tLngsIDAuMCwgMC4yNSk7XFxuXCIgK1xuXCIgICAgICAgICNlbHNlXFxuXCIgK1xuXCIgICAgICAgICAgICAvLyBQb2ludCBsaWdodC1iYXNlZCBncmFkaWVudFxcblwiICtcblwiICAgICAgICAgICAgbGlnaHQgPSBub3JtYWxpemUodmVjMyh2cG9zaXRpb24ueCwgdnBvc2l0aW9uLnksIC12cG9zaXRpb24ueikgLSBsaWdodCk7IC8vIGxpZ2h0IGFuZ2xlIGZyb20gbGlnaHQgcG9pbnQgdG8gdmVydGV4XFxuXCIgK1xuXCIgICAgICAgICAgICBmY29sb3IgKj0gZG90KHZub3JtYWwsIGxpZ2h0ICogLTEuMCkgKyBhbWJpZW50ICsgY2xhbXAodnBvc2l0aW9uLnogKiAyLjAgLyBtZXRlcl96b29tLngsIDAuMCwgMC4yNSk7XFxuXCIgK1xuXCIgICAgICAgICNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgI2VsaWYgZGVmaW5lZChMSUdIVElOR19ESVJFQ1RJT04pXFxuXCIgK1xuXCIgICAgICAgIC8vIEZsYXQgc2hhZGluZ1xcblwiICtcblwiICAgICAgICBsaWdodCA9IG5vcm1hbGl6ZSh2ZWMzKDAuMiwgMC43LCAtMC41KSk7XFxuXCIgK1xuXCIgICAgICAgIC8vIGxpZ2h0ID0gbm9ybWFsaXplKHZlYzMoLTEuLCAwLjcsIC0uMCkpO1xcblwiICtcblwiICAgICAgICAvLyBsaWdodCA9IG5vcm1hbGl6ZSh2ZWMzKC0xLiwgMC43LCAtLjc1KSk7XFxuXCIgK1xuXCIgICAgICAgIC8vIGZjb2xvciAqPSBtYXgoZG90KHZub3JtYWwsIGxpZ2h0ICogLTEuMCksIDAuMSkgKyBhbWJpZW50O1xcblwiICtcblwiICAgICAgICBmY29sb3IgKj0gZG90KHZub3JtYWwsIGxpZ2h0ICogLTEuMCkgKyBhbWJpZW50O1xcblwiICtcblwiICAgICNlbmRpZlxcblwiICtcblwiXFxuXCIgK1xuXCIgICAgI2lmIGRlZmluZWQoUFJPSkVDVElPTl9QRVJTUEVDVElWRSlcXG5cIiArXG5cIiAgICAgICAgLy8gUGVyc3BlY3RpdmUtc3R5bGUgcHJvamVjdGlvblxcblwiICtcblwiICAgICAgICB2ZWMyIHBlcnNwZWN0aXZlX29mZnNldCA9IHZlYzIoLTAuMjUsIC0wLjI1KTtcXG5cIiArXG5cIiAgICAgICAgdmVjMiBwZXJzcGVjdGl2ZV9mYWN0b3IgPSB2ZWMyKDAuOCwgMC44KTsgLy8gdmVjMigtMC4yNSwgMC43NSk7XFxuXCIgK1xuXCIgICAgICAgIHZwb3NpdGlvbi54eSArPSB2cG9zaXRpb24ueiAqIHBlcnNwZWN0aXZlX2ZhY3RvciAqICh2cG9zaXRpb24ueHkgLSBwZXJzcGVjdGl2ZV9vZmZzZXQpIC8gbWV0ZXJfem9vbS54eTsgLy8gcGVyc3BlY3RpdmUgZnJvbSBvZmZzZXQgY2VudGVyIHNjcmVlblxcblwiICtcblwiICAgICNlbGlmIGRlZmluZWQoUFJPSkVDVElPTl9JU09NRVRSSUMpIHx8IGRlZmluZWQoUFJPSkVDVElPTl9QT1BVUClcXG5cIiArXG5cIiAgICAgICAgLy8gUG9wLXVwIGVmZmVjdCAtIDNkIGluIGNlbnRlciBvZiB2aWV3cG9ydCwgZmFkaW5nIHRvIDJkIGF0IGVkZ2VzXFxuXCIgK1xuXCIgICAgICAgICNpZiBkZWZpbmVkKFBST0pFQ1RJT05fUE9QVVApXFxuXCIgK1xuXCIgICAgICAgICAgICBpZiAodnBvc2l0aW9uLnogPiAxLjApIHtcXG5cIiArXG5cIiAgICAgICAgICAgICAgICBmbG9hdCBjZCA9IGRpc3RhbmNlKHZwb3NpdGlvbi54eSAqIChyZXNvbHV0aW9uLnh5IC8gcmVzb2x1dGlvbi55eSksIHZlYzIoMC4wLCAwLjApKTtcXG5cIiArXG5cIiAgICAgICAgICAgICAgICBjb25zdCBmbG9hdCBwb3B1cF9mYWRlX2lubmVyID0gMC41O1xcblwiICtcblwiICAgICAgICAgICAgICAgIGNvbnN0IGZsb2F0IHBvcHVwX2ZhZGVfb3V0ZXIgPSAwLjc1O1xcblwiICtcblwiICAgICAgICAgICAgICAgIGlmIChjZCA+IHBvcHVwX2ZhZGVfaW5uZXIpIHtcXG5cIiArXG5cIiAgICAgICAgICAgICAgICAgICAgdnBvc2l0aW9uLnogKj0gMS4wIC0gc21vb3Roc3RlcChwb3B1cF9mYWRlX2lubmVyLCBwb3B1cF9mYWRlX291dGVyLCBjZCk7XFxuXCIgK1xuXCIgICAgICAgICAgICAgICAgfVxcblwiICtcblwiICAgICAgICAgICAgICAgIGNvbnN0IGZsb2F0IHpvb21fYm9vc3Rfc3RhcnQgPSAxNS4wO1xcblwiICtcblwiICAgICAgICAgICAgICAgIGNvbnN0IGZsb2F0IHpvb21fYm9vc3RfZW5kID0gMTcuMDtcXG5cIiArXG5cIiAgICAgICAgICAgICAgICBjb25zdCBmbG9hdCB6b29tX2Jvb3N0X21hZ25pdHVkZSA9IDAuNzU7XFxuXCIgK1xuXCIgICAgICAgICAgICAgICAgdnBvc2l0aW9uLnogKj0gMS4wICsgKDEuMCAtIHNtb290aHN0ZXAoem9vbV9ib29zdF9zdGFydCwgem9vbV9ib29zdF9lbmQsIG1hcF96b29tKSkgKiB6b29tX2Jvb3N0X21hZ25pdHVkZTtcXG5cIiArXG5cIiAgICAgICAgICAgIH1cXG5cIiArXG5cIiAgICAgICAgI2VuZGlmXFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAgICAgLy8gSXNvbWV0cmljLXN0eWxlIHByb2plY3Rpb25cXG5cIiArXG5cIiAgICAgICAgdnBvc2l0aW9uLnkgKz0gdnBvc2l0aW9uLnogLyBtZXRlcl96b29tLnk7IC8vIHogY29vcmRpbmF0ZSBpcyBhIHNpbXBsZSB0cmFuc2xhdGlvbiB1cCBhbG9uZyB5IGF4aXMsIGFsYSBpc29tZXRyaWNcXG5cIiArXG5cIiAgICAgICAgLy8gdnBvc2l0aW9uLnkgKz0gdnBvc2l0aW9uLnogKiAwLjU7IC8vIGNsb3NlciB0byBVbHRpbWEgNy1zdHlsZSBheG9ub21ldHJpY1xcblwiICtcblwiICAgICAgICAvLyB2cG9zaXRpb24ueCAtPSB2cG9zaXRpb24ueiAqIDAuNTtcXG5cIiArXG5cIiAgICAjZW5kaWZcXG5cIiArXG5cIlxcblwiICtcblwiICAgIC8vIFJvdGF0aW9uIHRlc3RcXG5cIiArXG5cIiAgICAvLyBmbG9hdCB0aGV0YSA9IDA7XFxuXCIgK1xuXCIgICAgLy8gY29uc3QgZmxvYXQgcGkgPSAzLjE0MTU5MjY7XFxuXCIgK1xuXCIgICAgLy8gdmVjMiBwcjtcXG5cIiArXG5cIiAgICAvLyBwci54ID0gdnBvc2l0aW9uLnggKiBjb3ModGhldGEgKiBwaSAvIDE4MC4wKSArIHZwb3NpdGlvbi55ICogLXNpbih0aGV0YSAqIHBpIC8gMTgwLjApO1xcblwiICtcblwiICAgIC8vIHByLnkgPSB2cG9zaXRpb24ueCAqIHNpbih0aGV0YSAqIHBpIC8gMTgwLjApICsgdnBvc2l0aW9uLnkgKiBjb3ModGhldGEgKiBwaSAvIDE4MC4wKTtcXG5cIiArXG5cIiAgICAvLyB2cG9zaXRpb24ueHkgPSBwcjtcXG5cIiArXG5cIlxcblwiICtcblwiICAgIC8vIHZwb3NpdGlvbi55ICo9IG1heChhYnMoc2luKHZwb3NpdGlvbi54KSksIDAuMSk7IC8vIGhvdXJnbGFzcyBlZmZlY3RcXG5cIiArXG5cIiAgICAvLyB2cG9zaXRpb24ueSAqPSBhYnMobWF4KHNpbih2cG9zaXRpb24ueCksIDAuMSkpOyAvLyBmdW5uZWwgZWZmZWN0XFxuXCIgK1xuXCJcXG5cIiArXG5cIiAgICAvLyBSZXZlcnNlIGFuZCBzY2FsZSB0byAwLTEgZm9yIEdMIGRlcHRoIGJ1ZmZlclxcblwiICtcblwiICAgIC8vIExheWVycyBhcmUgZm9yY2Utb3JkZXJlZCAoaGlnaGVyIGxheWVycyBndWFyYW50ZWVkIHRvIHJlbmRlciBvbiB0b3Agb2YgbG93ZXIpLCB0aGVuIGJ5IGhlaWdodC9kZXB0aFxcblwiICtcblwiICAgIGZsb2F0IHpfbGF5ZXJfc2NhbGUgPSA0MDk2LjtcXG5cIiArXG5cIiAgICBmbG9hdCB6X2xheWVyX3JhbmdlID0gKG51bV9sYXllcnMgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiICAgIGZsb2F0IHpfbGF5ZXIgPSAobGF5ZXIgKyAxLikgKiB6X2xheWVyX3NjYWxlO1xcblwiICtcblwiXFxuXCIgK1xuXCIgICAgdnBvc2l0aW9uLnogPSB6X2xheWVyICsgY2xhbXAodnBvc2l0aW9uLnosIDEuLCB6X2xheWVyX3NjYWxlKTtcXG5cIiArXG5cIiAgICB2cG9zaXRpb24ueiA9ICh6X2xheWVyX3JhbmdlIC0gdnBvc2l0aW9uLnopIC8gel9sYXllcl9yYW5nZTtcXG5cIiArXG5cIlxcblwiICtcblwiICAgIGdsX1Bvc2l0aW9uID0gdmVjNCh2cG9zaXRpb24sIDEuMCk7XFxuXCIgK1xuXCJ9XFxuXCIgK1xuXCJcIjtcblxuaWYgKG1vZHVsZS5leHBvcnRzICE9PSB1bmRlZmluZWQpIHsgbW9kdWxlLmV4cG9ydHMgPSBzaGFkZXJfc291cmNlczsgfVxuXG4iLCJ2YXIgVmVjdG9yUmVuZGVyZXIgPSByZXF1aXJlKCcuL3ZlY3Rvcl9yZW5kZXJlci5qcycpO1xuXG52YXIgTGVhZmxldExheWVyID0gTC5HcmlkTGF5ZXIuZXh0ZW5kKHtcblxuICAgIG9wdGlvbnM6IHtcbiAgICAgICAgdmVjdG9yUmVuZGVyZXI6ICdjYW52YXMnXG4gICAgfSxcblxuICAgIGluaXRpYWxpemU6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICAgIEwuc2V0T3B0aW9ucyh0aGlzLCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyID0gdGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyIHx8ICdHTFJlbmRlcmVyJztcbiAgICAgICAgdGhpcy5fcmVuZGVyZXIgPSBWZWN0b3JSZW5kZXJlci5jcmVhdGUodGhpcy5vcHRpb25zLnZlY3RvclJlbmRlcmVyLCB0aGlzLm9wdGlvbnMudmVjdG9yVGlsZVNvdXJjZSwgdGhpcy5vcHRpb25zLnZlY3RvckxheWVycywgdGhpcy5vcHRpb25zLnZlY3RvclN0eWxlcywgeyBudW1fd29ya2VyczogdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgfSk7XG4gICAgICAgIHRoaXMuX3JlbmRlcmVyLmRlYnVnID0gdGhpcy5vcHRpb25zLmRlYnVnO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5jb250aW51b3VzX2FuaW1hdGlvbiA9IGZhbHNlOyAvLyBzZXQgdG8gdHJ1ZSBmb3IgYW5pbWF0aW5vcywgZXRjLiAoZXZlbnR1YWxseSB3aWxsIGJlIGF1dG9tYXRlZClcbiAgICB9LFxuXG4gICAgLy8gRmluaXNoIGluaXRpYWxpemluZyByZW5kZXJlciBhbmQgc2V0dXAgZXZlbnRzIHdoZW4gbGF5ZXIgaXMgYWRkZWQgdG8gbWFwXG4gICAgb25BZGQ6IGZ1bmN0aW9uIChtYXApIHtcbiAgICAgICAgdmFyIGxheWVyID0gdGhpcztcblxuICAgICAgICBsYXllci5vbigndGlsZXVubG9hZCcsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICAgICAgdmFyIHRpbGUgPSBldmVudC50aWxlO1xuICAgICAgICAgICAgdmFyIGtleSA9IHRpbGUuZ2V0QXR0cmlidXRlKCdkYXRhLXRpbGUta2V5Jyk7XG4gICAgICAgICAgICBsYXllci5fcmVuZGVyZXIucmVtb3ZlVGlsZShrZXkpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgc2l6ZSA9IGxheWVyLl9tYXAuZ2V0U2l6ZSgpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnJlc2l6ZU1hcChzaXplLngsIHNpemUueSk7XG4gICAgICAgICAgICBsYXllci51cGRhdGVCb3VuZHMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgbGF5ZXIuX21hcC5vbignbW92ZScsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBjZW50ZXIgPSBsYXllci5fbWFwLmdldENlbnRlcigpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldENlbnRlcihjZW50ZXIubG5nLCBjZW50ZXIubGF0KTtcbiAgICAgICAgICAgIGxheWVyLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9KTtcblxuICAgICAgICBsYXllci5fbWFwLm9uKCd6b29tc3RhcnQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tc3RhcnQgXCIgKyBsYXllci5fbWFwLmdldFpvb20oKSk7XG4gICAgICAgICAgICBsYXllci5fcmVuZGVyZXIuc3RhcnRab29tKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGxheWVyLl9tYXAub24oJ3pvb21lbmQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhcIm1hcC56b29tZW5kIFwiICsgbGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldFpvb20obGF5ZXIuX21hcC5nZXRab29tKCkpO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBDYW52YXMgZWxlbWVudCB3aWxsIGJlIGluc2VydGVkIGFmdGVyIG1hcCBjb250YWluZXIgKGxlYWZsZXQgdHJhbnNmb3JtcyBzaG91bGRuJ3QgYmUgYXBwbGllZCB0byB0aGUgR0wgY2FudmFzKVxuICAgICAgICAvLyBUT0RPOiBmaW5kIGEgYmV0dGVyIHdheSB0byBkZWFsIHdpdGggdGhpcz8gcmlnaHQgbm93IEdMIG1hcCBvbmx5IHJlbmRlcnMgY29ycmVjdGx5IGFzIHRoZSBib3R0b20gbGF5ZXJcbiAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLmNvbnRhaW5lciA9IGxheWVyLl9tYXAuZ2V0Q29udGFpbmVyKCk7XG5cbiAgICAgICAgdmFyIGNlbnRlciA9IGxheWVyLl9tYXAuZ2V0Q2VudGVyKCk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5zZXRDZW50ZXIoY2VudGVyLmxuZywgY2VudGVyLmxhdCk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5zZXRab29tKGxheWVyLl9tYXAuZ2V0Wm9vbSgpKTtcbiAgICAgICAgbGF5ZXIudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgTC5HcmlkTGF5ZXIucHJvdG90eXBlLm9uQWRkLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICAgIGxheWVyLl9yZW5kZXJlci5pbml0KCk7XG4gICAgfSxcblxuICAgIG9uUmVtb3ZlOiBmdW5jdGlvbiAobWFwKSB7XG4gICAgICAgIEwuR3JpZExheWVyLnByb3RvdHlwZS5vblJlbW92ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgICAvLyBUT0RPOiByZW1vdmUgZXZlbnQgaGFuZGxlcnMsIGRlc3Ryb3kgbWFwXG4gICAgfSxcblxuICAgIGNyZWF0ZVRpbGU6IGZ1bmN0aW9uIChjb29yZHMsIGRvbmUpIHtcbiAgICAgICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5sb2FkVGlsZShjb29yZHMsIGRpdiwgZG9uZSk7XG4gICAgICAgIHJldHVybiBkaXY7XG4gICAgfSxcblxuICAgIHVwZGF0ZUJvdW5kczogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgbGF5ZXIgPSB0aGlzO1xuICAgICAgICB2YXIgYm91bmRzID0gbGF5ZXIuX21hcC5nZXRCb3VuZHMoKTtcbiAgICAgICAgbGF5ZXIuX3JlbmRlcmVyLnNldEJvdW5kcyhib3VuZHMuZ2V0U291dGhXZXN0KCksIGJvdW5kcy5nZXROb3J0aEVhc3QoKSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9yZW5kZXJlci5yZW5kZXIoKTtcbiAgICB9XG5cbn0pO1xuXG52YXIgbGVhZmxldExheWVyID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICByZXR1cm4gbmV3IExlYWZsZXRMYXllcihvcHRpb25zKTtcbn07XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXRMYXllcixcbiAgICAgICAgbGVhZmxldExheWVyOiBsZWFmbGV0TGF5ZXJcbiAgICB9O1xufVxuIiwiLy8gTW9kdWxlcyBhbmQgZGVwZW5kZW5jaWVzIHRvIGV4cG9zZSBpbiB0aGUgcHVibGljIFRhbmdyYW0gbW9kdWxlXG5cbi8vIFRoZSBsZWFmbGV0IGxheWVyIHBsdWdpbiBpcyBjdXJyZW50bHkgdGhlIHByaW1hcnkgbWVhbnMgb2YgdXNpbmcgdGhlIGxpYnJhcnlcbnZhciBMZWFmbGV0ID0gcmVxdWlyZSgnLi9sZWFmbGV0X2xheWVyLmpzJyk7XG5cbi8vIFJlbmRlcmVyIG1vZHVsZXMgbmVlZCB0byBiZSBleHBsaWNpdGx5IGluY2x1ZGVkIHNpbmNlIHRoZXkgYXJlIG5vdCBvdGhlcndpc2UgcmVmZXJlbmNlZFxucmVxdWlyZSgnLi9nbC9nbF9yZW5kZXJlci5qcycpO1xucmVxdWlyZSgnLi9jYW52YXMvY2FudmFzX3JlbmRlcmVyLmpzJyk7XG5cbi8vIEdMIGZ1bmN0aW9ucyBpbmNsdWRlZCBmb3IgZWFzaWVyIGRlYnVnZ2luZyAvIGRpcmVjdCBhY2Nlc3MgdG8gc2V0dGluZyBnbG9iYWwgZGVmaW5lcywgcmVsb2FkaW5nIHByb2dyYW1zLCBldGMuXG52YXIgR0wgPSByZXF1aXJlKCcuL2dsL2dsLmpzJyk7XG5cbmlmIChtb2R1bGUgIT09IHVuZGVmaW5lZCkge1xuICAgIG1vZHVsZS5leHBvcnRzID0ge1xuICAgICAgICBMZWFmbGV0TGF5ZXI6IExlYWZsZXQuTGVhZmxldExheWVyLFxuICAgICAgICBsZWFmbGV0TGF5ZXI6IExlYWZsZXQubGVhZmxldExheWVyLFxuICAgICAgICBHTDogR0xcbiAgICB9O1xufVxuIiwiLy8gUG9pbnRcbmZ1bmN0aW9uIFBvaW50ICh4LCB5KVxue1xuICAgIHJldHVybiB7IHg6IHgsIHk6IHkgfTtcbn1cblxuUG9pbnQuY29weSA9IGZ1bmN0aW9uIChwKVxue1xuICAgIGlmIChwID09IG51bGwpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIHJldHVybiB7IHg6IHAueCwgeTogcC55IH07XG59O1xuXG5pZiAobW9kdWxlICE9PSB1bmRlZmluZWQpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IFBvaW50O1xufVxuIiwiLyoqKiBTdHlsZSBoZWxwZXJzICoqKi9cblxudmFyIFN0eWxlID0ge307XG5cblN0eWxlLmNvbG9yID0ge1xuICAgIHBzZXVkb1JhbmRvbUdyYXlzY2FsZTogZnVuY3Rpb24gKGYpIHsgdmFyIGMgPSBNYXRoLm1heCgocGFyc2VJbnQoZi5pZCwgMTYpICUgMTAwKSAvIDEwMCwgMC40KTsgcmV0dXJuIFswLjcgKiBjLCAwLjcgKiBjLCAwLjcgKiBjXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBncmF5c2NhbGUgYnkgZ2VvbWV0cnkgaWRcbiAgICBwc2V1ZG9SYW5kb21Db2xvcjogZnVuY3Rpb24gKGYpIHsgcmV0dXJuIFswLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwICUgMSksIDAuNyAqIChwYXJzZUludChmLmlkLCAxNikgLyAxMDAwMCAlIDEpLCAwLjcgKiAocGFyc2VJbnQoZi5pZCwgMTYpIC8gMTAwMDAwMCAlIDEpXTsgfSwgLy8gcHNldWRvLXJhbmRvbSBjb2xvciBieSBnZW9tZXRyeSBpZFxuICAgIHJhbmRvbUNvbG9yOiBmdW5jdGlvbiAoZikgeyByZXR1cm4gWzAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCksIDAuNyAqIE1hdGgucmFuZG9tKCldOyB9IC8vIHJhbmRvbSBjb2xvclxufTtcblxuU3R5bGUud2lkdGggPSB7XG4gICAgcGl4ZWxzOiBmdW5jdGlvbiAocCkgeyByZXR1cm4gZnVuY3Rpb24gKGYsIHQpIHsgcmV0dXJuICh0eXBlb2YgcCA9PSAnZnVuY3Rpb24nID8gcChmLCB0KSA6IHApICogdC51bml0c19wZXJfcGl4ZWw7IH07IH0sIC8vIGxvY2FsIHRpbGUgdW5pdHMgZm9yIGEgZ2l2ZW4gcGl4ZWwgd2lkdGhcbiAgICBtZXRlcnM6IGZ1bmN0aW9uIChwKSB7IHJldHVybiBmdW5jdGlvbiAoZiwgdCkgeyByZXR1cm4gKHR5cGVvZiBwID09ICdmdW5jdGlvbicgPyBwKGYsIHQpIDogcCkgKiB0LnVuaXRzX3Blcl9tZXRlcjsgfTsgfSAgLy8gbG9jYWwgdGlsZSB1bml0cyBmb3IgYSBnaXZlbiBtZXRlciB3aWR0aFxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBTdHlsZTtcbn1cbiIsIi8qKiogVmVjdG9yIGZ1bmN0aW9ucyAtIHZlY3RvcnMgcHJvdmlkZWQgYXMgW3gsIHksIHpdIGFycmF5cyAqKiovXG5cbnZhciBWZWN0b3IgPSB7fTtcblxuLy8gVmVjdG9yIGxlbmd0aCBzcXVhcmVkXG5WZWN0b3IubGVuZ3RoU3EgPSBmdW5jdGlvbiAodilcbntcbiAgICBpZiAodi5sZW5ndGggPT0gMikge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gKHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXSk7XG4gICAgfVxufTtcblxuLy8gVmVjdG9yIGxlbmd0aFxuVmVjdG9yLmxlbmd0aCA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHJldHVybiBNYXRoLnNxcnQoVmVjdG9yLmxlbmd0aFNxKHYpKTtcbn07XG5cbi8vIE5vcm1hbGl6ZSBhIHZlY3RvclxuVmVjdG9yLm5vcm1hbGl6ZSA9IGZ1bmN0aW9uICh2KVxue1xuICAgIHZhciBkO1xuICAgIGlmICh2Lmxlbmd0aCA9PSAyKSB7XG4gICAgICAgIGQgPSB2WzBdKnZbMF0gKyB2WzFdKnZbMV07XG4gICAgICAgIGQgPSBNYXRoLnNxcnQoZCk7XG5cbiAgICAgICAgaWYgKGQgIT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFt2WzBdIC8gZCwgdlsxXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB2YXIgZCA9IHZbMF0qdlswXSArIHZbMV0qdlsxXSArIHZbMl0qdlsyXTtcbiAgICAgICAgZCA9IE1hdGguc3FydChkKTtcblxuICAgICAgICBpZiAoZCAhPSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gW3ZbMF0gLyBkLCB2WzFdIC8gZCwgdlsyXSAvIGRdO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbMCwgMCwgMF07XG4gICAgfVxufTtcblxuLy8gQ3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjdG9yc1xuVmVjdG9yLmNyb3NzICA9IGZ1bmN0aW9uICh2MSwgdjIpXG57XG4gICAgcmV0dXJuIFtcbiAgICAgICAgKHYxWzFdICogdjJbMl0pIC0gKHYxWzJdICogdjJbMV0pLFxuICAgICAgICAodjFbMl0gKiB2MlswXSkgLSAodjFbMF0gKiB2MlsyXSksXG4gICAgICAgICh2MVswXSAqIHYyWzFdKSAtICh2MVsxXSAqIHYyWzBdKVxuICAgIF07XG59O1xuXG4vLyBGaW5kIHRoZSBpbnRlcnNlY3Rpb24gb2YgdHdvIGxpbmVzIHNwZWNpZmllZCBhcyBzZWdtZW50cyBmcm9tIHBvaW50cyAocDEsIHAyKSBhbmQgKHAzLCBwNClcbi8vIGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGluZS1saW5lX2ludGVyc2VjdGlvblxuLy8gaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9DcmFtZXInc19ydWxlXG5WZWN0b3IubGluZUludGVyc2VjdGlvbiA9IGZ1bmN0aW9uIChwMSwgcDIsIHAzLCBwNCwgcGFyYWxsZWxfdG9sZXJhbmNlKVxue1xuICAgIHZhciBwYXJhbGxlbF90b2xlcmFuY2UgPSBwYXJhbGxlbF90b2xlcmFuY2UgfHwgMC4wMTtcblxuICAgIC8vIGExKnggKyBiMSp5ID0gYzEgZm9yIGxpbmUgKHgxLCB5MSkgdG8gKHgyLCB5MilcbiAgICAvLyBhMip4ICsgYjIqeSA9IGMyIGZvciBsaW5lICh4MywgeTMpIHRvICh4NCwgeTQpXG4gICAgdmFyIGExID0gcDFbMV0gLSBwMlsxXTsgLy8geTEgLSB5MlxuICAgIHZhciBiMSA9IHAxWzBdIC0gcDJbMF07IC8vIHgxIC0geDJcbiAgICB2YXIgYTIgPSBwM1sxXSAtIHA0WzFdOyAvLyB5MyAtIHk0XG4gICAgdmFyIGIyID0gcDNbMF0gLSBwNFswXTsgLy8geDMgLSB4NFxuICAgIHZhciBjMSA9IChwMVswXSAqIHAyWzFdKSAtIChwMVsxXSAqIHAyWzBdKTsgLy8geDEqeTIgLSB5MSp4MlxuICAgIHZhciBjMiA9IChwM1swXSAqIHA0WzFdKSAtIChwM1sxXSAqIHA0WzBdKTsgLy8geDMqeTQgLSB5Myp4NFxuICAgIHZhciBkZW5vbSA9IChiMSAqIGEyKSAtIChhMSAqIGIyKTtcblxuICAgIGlmIChNYXRoLmFicyhkZW5vbSkgPiBwYXJhbGxlbF90b2xlcmFuY2UpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICgoYzEgKiBiMikgLSAoYjEgKiBjMikpIC8gZGVub20sXG4gICAgICAgICAgICAoKGMxICogYTIpIC0gKGExICogYzIpKSAvIGRlbm9tXG4gICAgICAgIF07XG4gICAgfVxuICAgIHJldHVybiBudWxsOyAvLyByZXR1cm4gbnVsbCBpZiBsaW5lcyBhcmUgKGNsb3NlIHRvKSBwYXJhbGxlbFxufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWN0b3I7XG59XG4iLCJ2YXIgUG9pbnQgPSByZXF1aXJlKCcuL3BvaW50LmpzJyk7XG52YXIgR2VvID0gcmVxdWlyZSgnLi9nZW8uanMnKTtcbnZhciBTdHlsZSA9IHJlcXVpcmUoJy4vc3R5bGUuanMnKTtcblxuLy8gR2V0IGJhc2UgVVJMIGZyb20gd2hpY2ggdGhlIGxpYnJhcnkgd2FzIGxvYWRlZFxuLy8gVXNlZCB0byBsb2FkIGFkZGl0aW9uYWwgcmVzb3VyY2VzIGxpa2Ugc2hhZGVycywgdGV4dHVyZXMsIGV0Yy4gaW4gY2FzZXMgd2hlcmUgbGlicmFyeSB3YXMgbG9hZGVkIGZyb20gYSByZWxhdGl2ZSBwYXRoXG4oZnVuY3Rpb24oKSB7XG4gICAgdHJ5IHtcbiAgICAgICAgVmVjdG9yUmVuZGVyZXIubGlicmFyeV9iYXNlX3VybCA9ICcnO1xuICAgICAgICB2YXIgc2NyaXB0cyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdzY3JpcHQnKTsgLy8gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnc2NyaXB0W3NyYyo9XCIuanNcIl0nKTtcbiAgICAgICAgZm9yICh2YXIgcz0wOyBzIDwgc2NyaXB0cy5sZW5ndGg7IHMrKykge1xuICAgICAgICAgICAgLy8gdmFyIGJhc2VfbWF0Y2ggPSBzY3JpcHRzW3NdLnNyYy5tYXRjaCgvKC4qKXZlY3Rvci1tYXAuKGRlYnVnfG1pbikuanMvKTsgLy8gc2hvdWxkIG1hdGNoIGRlYnVnIG9yIG1pbmlmaWVkIHZlcnNpb25zXG4gICAgICAgICAgICAvLyBpZiAoYmFzZV9tYXRjaCAhPSBudWxsICYmIGJhc2VfbWF0Y2gubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgLy8gICAgIFZlY3RvclJlbmRlcmVyLmxpYnJhcnlfYmFzZV91cmwgPSBiYXNlX21hdGNoWzFdO1xuICAgICAgICAgICAgLy8gICAgIGJyZWFrO1xuICAgICAgICAgICAgLy8gfVxuICAgICAgICAgICAgdmFyIG1hdGNoID0gc2NyaXB0c1tzXS5zcmMuaW5kZXhPZigndmVjdG9yLW1hcC5kZWJ1Zy5qcycpO1xuICAgICAgICAgICAgaWYgKG1hdGNoID09IC0xKSB7XG4gICAgICAgICAgICAgICAgbWF0Y2ggPSBzY3JpcHRzW3NdLnNyYy5pbmRleE9mKCd2ZWN0b3ItbWFwLm1pbi5qcycpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKG1hdGNoID49IDApIHtcbiAgICAgICAgICAgICAgICBWZWN0b3JSZW5kZXJlci5saWJyYXJ5X2Jhc2VfdXJsID0gc2NyaXB0c1tzXS5zcmMuc3Vic3RyKDAsIG1hdGNoKTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjYXRjaCAoZSkge1xuICAgICAgICAvLyBza2lwIGluIHdlYiB3b3JrZXJcbiAgICB9XG59KCkpO1xuXG5WZWN0b3JSZW5kZXJlci50aWxlX3NjYWxlID0gNDA5NjsgLy8gY29vcmRpbmF0ZXMgYXJlIGxvY2FsbHkgc2NhbGVkIHRvIHRoZSByYW5nZSBbMCwgdGlsZV9zY2FsZV1cblZlY3RvclJlbmRlcmVyLnVuaXRzX3Blcl9tZXRlciA9IFtdO1xuVmVjdG9yUmVuZGVyZXIudW5pdHNfcGVyX3BpeGVsID0gW107XG4oZnVuY3Rpb24oKSB7XG4gICAgZm9yICh2YXIgej0wOyB6IDw9IEdlby5tYXhfem9vbTsgeisrKSB7XG4gICAgICAgIFZlY3RvclJlbmRlcmVyLnVuaXRzX3Blcl9tZXRlclt6XSA9IFZlY3RvclJlbmRlcmVyLnRpbGVfc2NhbGUgLyAoR2VvLnRpbGVfc2l6ZSAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW3pdKTtcbiAgICAgICAgVmVjdG9yUmVuZGVyZXIudW5pdHNfcGVyX3BpeGVsW3pdID0gVmVjdG9yUmVuZGVyZXIudGlsZV9zY2FsZSAvIEdlby50aWxlX3NpemU7XG4gICAgfVxufSgpKTtcblxuLy8gTGF5ZXJzICYgc3R5bGVzOiBwYXNzIGFuIG9iamVjdCBkaXJlY3RseSwgb3IgYSBVUkwgYXMgc3RyaW5nIHRvIGxvYWQgcmVtb3RlbHlcbmZ1bmN0aW9uIFZlY3RvclJlbmRlcmVyICh0eXBlLCB0aWxlX3NvdXJjZSwgbGF5ZXJzLCBzdHlsZXMsIG9wdGlvbnMpXG57XG4gICAgdmFyIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy50aWxlX3NvdXJjZSA9IHRpbGVfc291cmNlO1xuICAgIHRoaXMudGlsZXMgPSB7fTtcbiAgICB0aGlzLm51bV93b3JrZXJzID0gb3B0aW9ucy5udW1fd29ya2VycyB8fCAxO1xuXG4gICAgdGhpcy5sYXllcl9zb3VyY2UgPSBWZWN0b3JSZW5kZXJlci51cmxGb3JQYXRoKGxheWVycyk7IC8vIFRPRE86IGZpeCB0aGlzIGZvciBsYXllcnMgcHJvdmlkZWQgYXMgb2JqZWN0cywgdGhpcyBhc3N1bWVzIGEgVVJMIGlzIHBhc3NlZFxuICAgIGlmICh0eXBlb2YobGF5ZXJzKSA9PSAnc3RyaW5nJykge1xuICAgICAgICB0aGlzLmxheWVycyA9IFZlY3RvclJlbmRlcmVyLmxvYWRMYXllcnMobGF5ZXJzKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHRoaXMubGF5ZXJzID0gbGF5ZXJzO1xuICAgIH1cblxuICAgIHRoaXMuc3R5bGVfc291cmNlID0gVmVjdG9yUmVuZGVyZXIudXJsRm9yUGF0aChzdHlsZXMpOyAvLyBUT0RPOiBmaXggdGhpcyBmb3Igc3R5bGVzIHByb3ZpZGVkIGFzIG9iamVjdHMsIHRoaXMgYXNzdW1lcyBhIFVSTCBpcyBwYXNzZWRcbiAgICBpZiAodHlwZW9mKHN0eWxlcykgPT0gJ3N0cmluZycpIHtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSBWZWN0b3JSZW5kZXJlci5sb2FkU3R5bGVzKHN0eWxlcyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICB0aGlzLnN0eWxlcyA9IHN0eWxlcztcbiAgICB9XG5cbiAgICB0aGlzLmNyZWF0ZVdvcmtlcnMoKTtcblxuICAgIHRoaXMuem9vbSA9IG51bGw7XG4gICAgdGhpcy5jZW50ZXIgPSBudWxsO1xuICAgIHRoaXMuZGV2aWNlX3BpeGVsX3JhdGlvID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTsgLy8gcmVxdWVzdCBhIHJlZHJhd1xuICAgIHRoaXMuaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbn1cblxuVmVjdG9yUmVuZGVyZXIuY3JlYXRlID0gZnVuY3Rpb24gKHR5cGUsIHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucylcbntcbiAgICByZXR1cm4gbmV3IFZlY3RvclJlbmRlcmVyW3R5cGVdKHRpbGVfc291cmNlLCBsYXllcnMsIHN0eWxlcywgb3B0aW9ucyk7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpXG57XG4gICAgLy8gQ2hpbGQgY2xhc3Mtc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24gKGUuZy4gR0wgY29udGV4dCBjcmVhdGlvbilcbiAgICBpZiAodHlwZW9mKHRoaXMuX2luaXQpID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgdGhpcy5faW5pdC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH1cblxuICAgIHZhciByZW5kZXJlciA9IHRoaXM7XG4gICAgdGhpcy53b3JrZXJzLmZvckVhY2goZnVuY3Rpb24od29ya2VyKSB7XG4gICAgICAgIHdvcmtlci5hZGRFdmVudExpc3RlbmVyKCdtZXNzYWdlJywgcmVuZGVyZXIudGlsZVdvcmtlckNvbXBsZXRlZC5iaW5kKHJlbmRlcmVyKSk7XG4gICAgfSk7XG5cbiAgICB0aGlzLmluaXRpYWxpemVkID0gdHJ1ZTtcbn07XG5cbi8vIFdlYiB3b3JrZXJzIGhhbmRsZSBoZWF2eSBkdXR5IGdlb21ldHJ5IHByb2Nlc3NpbmdcblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5jcmVhdGVXb3JrZXJzID0gZnVuY3Rpb24gKClcbntcbiAgICB2YXIgcmVuZGVyZXIgPSB0aGlzO1xuICAgIHZhciB1cmwgPSBWZWN0b3JSZW5kZXJlci5saWJyYXJ5X2Jhc2VfdXJsICsgJ3ZlY3Rvci1tYXAtd29ya2VyLm1pbi5qcyc7XG5cbiAgICAvLyBUbyBhbGxvdyB3b3JrZXJzIHRvIGJlIGxvYWRlZCBjcm9zcy1kb21haW4sIGZpcnN0IGxvYWQgd29ya2VyIHNvdXJjZSB2aWEgWEhSLCB0aGVuIGNyZWF0ZSBhIGxvY2FsIFVSTCB2aWEgYSBibG9iXG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB3b3JrZXJfbG9jYWxfdXJsID0gd2luZG93LlVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoW3JlcS5yZXNwb25zZV0sIHsgdHlwZTogJ2FwcGxpY2F0aW9uL2phdmFzY3JpcHQnIH0pKTtcblxuICAgICAgICByZW5kZXJlci53b3JrZXJzID0gW107XG4gICAgICAgIGZvciAodmFyIHc9MDsgdyA8IHJlbmRlcmVyLm51bV93b3JrZXJzOyB3KyspIHtcbiAgICAgICAgICAgIHJlbmRlcmVyLndvcmtlcnMucHVzaChuZXcgV29ya2VyKHdvcmtlcl9sb2NhbF91cmwpKTtcbiAgICAgICAgfVxuICAgIH07XG4gICAgcmVxLm9wZW4oJ0dFVCcsIHVybCwgZmFsc2UgLyogYXN5bmMgZmxhZyAqLyk7XG4gICAgcmVxLnNlbmQoKTtcblxuICAgIC8vIEFsdGVybmF0ZSBmb3IgZGVidWdnaW5nIC0gdHJhZHRpb25hbCBtZXRob2Qgb2YgbG9hZGluZyBmcm9tIHJlbW90ZSBVUkwgaW5zdGVhZCBvZiBYSFItdG8tbG9jYWwtYmxvYlxuICAgIC8vIHJlbmRlcmVyLndvcmtlcnMgPSBbXTtcbiAgICAvLyBmb3IgKHZhciB3PTA7IHcgPCByZW5kZXJlci5udW1fd29ya2VyczsgdysrKSB7XG4gICAgLy8gICAgIHJlbmRlcmVyLndvcmtlcnMucHVzaChuZXcgV29ya2VyKHVybCkpO1xuICAgIC8vIH1cblxuICAgIHRoaXMubmV4dF93b3JrZXIgPSAwO1xufTtcblxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnNldENlbnRlciA9IGZ1bmN0aW9uIChsbmcsIGxhdClcbntcbiAgICB0aGlzLmNlbnRlciA9IHsgbG5nOiBsbmcsIGxhdDogbGF0IH07XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUuc2V0Wm9vbSA9IGZ1bmN0aW9uICh6b29tKVxue1xuICAgIHRoaXMubWFwX2xhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLnpvb20gPSB6b29tO1xuICAgIHRoaXMubWFwX3pvb21pbmcgPSBmYWxzZTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5zdGFydFpvb20gPSBmdW5jdGlvbiAoKVxue1xuICAgIHRoaXMubWFwX2xhc3Rfem9vbSA9IHRoaXMuem9vbTtcbiAgICB0aGlzLm1hcF96b29taW5nID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5zZXRCb3VuZHMgPSBmdW5jdGlvbiAoc3csIG5lKVxue1xuICAgIHRoaXMuYm91bmRzID0ge1xuICAgICAgICBzdzogeyBsbmc6IHN3LmxuZywgbGF0OiBzdy5sYXQgfSxcbiAgICAgICAgbmU6IHsgbG5nOiBuZS5sbmcsIGxhdDogbmUubGF0IH1cbiAgICB9O1xuXG4gICAgdmFyIGJ1ZmZlciA9IDIwMCAqIEdlby5tZXRlcnNfcGVyX3BpeGVsW35+dGhpcy56b29tXTsgLy8gcGl4ZWxzIC0+IG1ldGVyc1xuICAgIHRoaXMuYnVmZmVyZWRfbWV0ZXJfYm91bmRzID0ge1xuICAgICAgICBzdzogR2VvLmxhdExuZ1RvTWV0ZXJzKFBvaW50KHRoaXMuYm91bmRzLnN3LmxuZywgdGhpcy5ib3VuZHMuc3cubGF0KSksXG4gICAgICAgIG5lOiBHZW8ubGF0TG5nVG9NZXRlcnMoUG9pbnQodGhpcy5ib3VuZHMubmUubG5nLCB0aGlzLmJvdW5kcy5uZS5sYXQpKVxuICAgIH07XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueCAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMuc3cueSAtPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueCArPSBidWZmZXI7XG4gICAgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMubmUueSArPSBidWZmZXI7XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInNldCByZW5kZXJlciBib3VuZHMgdG8gXCIgKyBKU09OLnN0cmluZ2lmeSh0aGlzLmJvdW5kcykpO1xuXG4gICAgLy8gTWFyayB0aWxlcyBhcyB2aXNpYmxlL2ludmlzaWJsZVxuICAgIGZvciAodmFyIHQgaW4gdGhpcy50aWxlcykge1xuICAgICAgICB0aGlzLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlKHRoaXMudGlsZXNbdF0pO1xuICAgIH1cblxuICAgIHRoaXMuZGlydHkgPSB0cnVlO1xufTtcblxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnVwZGF0ZVZpc2liaWxpdHlGb3JUaWxlID0gZnVuY3Rpb24gKHRpbGUpXG57XG4gICAgdGlsZS52aXNpYmxlID0gR2VvLmJveEludGVyc2VjdCh0aWxlLmJvdW5kcywgdGhpcy5idWZmZXJlZF9tZXRlcl9ib3VuZHMpO1xuICAgIHJldHVybiB0aWxlLnZpc2libGU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucmVzaXplTWFwID0gZnVuY3Rpb24gKHdpZHRoLCBoZWlnaHQpXG57XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucmVxdWVzdFJlZHJhdyA9IGZ1bmN0aW9uICgpXG57XG4gICAgdGhpcy5kaXJ0eSA9IHRydWU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gKClcbntcbiAgICBpZiAodGhpcy5kaXJ0eSA9PSBmYWxzZSB8fCB0aGlzLmluaXRpYWxpemVkID09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdGhpcy5kaXJ0eSA9IGZhbHNlOyAvLyBzdWJjbGFzc2VzIGNhbiBzZXQgdGhpcyBiYWNrIHRvIHRydWUgd2hlbiBhbmltYXRpb24gaXMgbmVlZGVkXG5cbiAgICAvLyBDaGlsZCBjbGFzcy1zcGVjaWZpYyByZW5kZXJpbmcgKGUuZy4gR0wgZHJhdyBjYWxscylcbiAgICBpZiAodHlwZW9mKHRoaXMuX3JlbmRlcikgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl9yZW5kZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9XG5cbiAgICAvLyBjb25zb2xlLmxvZyhcInJlbmRlciBtYXBcIik7XG4gICAgcmV0dXJuIHRydWU7XG59O1xuXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUubG9hZFRpbGUgPSBmdW5jdGlvbiAoY29vcmRzLCBkaXYsIGNhbGxiYWNrKVxue1xuICAgIC8vIE92ZXJ6b29tP1xuICAgIGlmIChjb29yZHMueiA+IHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb20pIHtcbiAgICAgICAgdmFyIHpnYXAgPSBjb29yZHMueiAtIHRoaXMudGlsZV9zb3VyY2UubWF4X3pvb207XG4gICAgICAgIC8vIHZhciBvcmlnaW5hbF90aWxlID0gW2Nvb3Jkcy54LCBjb29yZHMueSwgY29vcmRzLnpdLmpvaW4oJy8nKTtcbiAgICAgICAgY29vcmRzLnggPSB+fihjb29yZHMueCAvIE1hdGgucG93KDIsIHpnYXApKTtcbiAgICAgICAgY29vcmRzLnkgPSB+fihjb29yZHMueSAvIE1hdGgucG93KDIsIHpnYXApKTtcbiAgICAgICAgY29vcmRzLmRpc3BsYXlfeiA9IGNvb3Jkcy56OyAvLyB6IHdpdGhvdXQgb3Zlcnpvb21cbiAgICAgICAgY29vcmRzLnogLT0gemdhcDtcbiAgICAgICAgLy8gY29uc29sZS5sb2coXCJhZGp1c3RlZCBmb3Igb3Zlcnpvb20sIHRpbGUgXCIgKyBvcmlnaW5hbF90aWxlICsgXCIgLT4gXCIgKyBbY29vcmRzLngsIGNvb3Jkcy55LCBjb29yZHMuel0uam9pbignLycpKTtcbiAgICB9XG5cbiAgICAvLyBTdGFydCB0cmFja2luZyBuZXcgdGlsZSBzZXQgaWYgbm8gb3RoZXIgdGlsZXMgYWxyZWFkeSBsb2FkaW5nXG4gICAgaWYgKHRoaXMudGlsZV9zZXRfbG9hZGluZyA9PSBudWxsKSB7XG4gICAgICAgIHRoaXMudGlsZV9zZXRfbG9hZGluZyA9ICtuZXcgRGF0ZSgpO1xuICAgICAgICBjb25zb2xlLmxvZyhcInRpbGUgc2V0IGxvYWQgU1RBUlRcIik7XG4gICAgfVxuXG4gICAgdmFyIGtleSA9IFtjb29yZHMueCwgY29vcmRzLnksIGNvb3Jkcy56XS5qb2luKCcvJyk7XG5cbiAgICAvLyBBbHJlYWR5IGxvYWRpbmcvbG9hZGVkP1xuICAgIGlmICh0aGlzLnRpbGVzW2tleV0pIHtcbiAgICAgICAgLy8gaWYgKHRoaXMudGlsZXNba2V5XS5sb2FkZWQgPT0gdHJ1ZSkge1xuICAgICAgICAvLyAgICAgY29uc29sZS5sb2coXCJ1c2UgbG9hZGVkIHRpbGUgXCIgKyBrZXkgKyBcIiBmcm9tIGNhY2hlXCIpO1xuICAgICAgICAvLyB9XG4gICAgICAgIC8vIGlmICh0aGlzLnRpbGVzW2tleV0ubG9hZGluZyA9PSB0cnVlKSB7XG4gICAgICAgIC8vICAgICBjb25zb2xlLmxvZyhcImFscmVhZHkgbG9hZGluZyB0aWxlIFwiICsga2V5ICsgXCIsIHNraXBcIik7XG4gICAgICAgIC8vIH1cblxuICAgICAgICBpZiAoY2FsbGJhY2spIHtcbiAgICAgICAgICAgIGNhbGxiYWNrKG51bGwsIGRpdik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gdGhpcy50aWxlc1trZXldID0ge307XG4gICAgdGlsZS5rZXkgPSBrZXk7XG4gICAgdGlsZS5jb29yZHMgPSBjb29yZHM7XG4gICAgdGlsZS5taW4gPSBHZW8ubWV0ZXJzRm9yVGlsZSh0aWxlLmNvb3Jkcyk7XG4gICAgdGlsZS5tYXggPSBHZW8ubWV0ZXJzRm9yVGlsZSh7IHg6IHRpbGUuY29vcmRzLnggKyAxLCB5OiB0aWxlLmNvb3Jkcy55ICsgMSwgejogdGlsZS5jb29yZHMueiB9KTtcbiAgICB0aWxlLmJvdW5kcyA9IHsgc3c6IHsgeDogdGlsZS5taW4ueCwgeTogdGlsZS5tYXgueSB9LCBuZTogeyB4OiB0aWxlLm1heC54LCB5OiB0aWxlLm1pbi55IH0gfTtcbiAgICB0aWxlLnVuaXRzX3Blcl9tZXRlciA9IFZlY3RvclJlbmRlcmVyLnVuaXRzX3Blcl9tZXRlclt0aWxlLmNvb3Jkcy56XTtcbiAgICB0aWxlLnVuaXRzX3Blcl9waXhlbCA9IFZlY3RvclJlbmRlcmVyLnVuaXRzX3Blcl9waXhlbFt0aWxlLmNvb3Jkcy56XTtcbiAgICB0aWxlLmRlYnVnID0ge307XG4gICAgdGlsZS5sb2FkaW5nID0gdHJ1ZTtcbiAgICB0aWxlLmxvYWRlZCA9IGZhbHNlO1xuICAgIHRoaXMudXBkYXRlVmlzaWJpbGl0eUZvclRpbGUodGlsZSk7XG5cbiAgICB0aGlzLndvcmtlcnNbdGhpcy5uZXh0X3dvcmtlcl0ucG9zdE1lc3NhZ2Uoe1xuICAgICAgICB0eXBlOiAnbG9hZFRpbGUnLFxuICAgICAgICB0aWxlOiB0aWxlLFxuICAgICAgICByZW5kZXJlcl90eXBlOiB0aGlzLnR5cGUsXG4gICAgICAgIHRpbGVfc291cmNlOiB0aGlzLnRpbGVfc291cmNlLFxuICAgICAgICBsYXllcl9zb3VyY2U6IHRoaXMubGF5ZXJfc291cmNlLFxuICAgICAgICBzdHlsZV9zb3VyY2U6IHRoaXMuc3R5bGVfc291cmNlXG4gICAgfSk7XG4gICAgdGlsZS53b3JrZXIgPSB0aGlzLndvcmtlcnNbdGhpcy5uZXh0X3dvcmtlcl07XG4gICAgdGhpcy5uZXh0X3dvcmtlciA9ICh0aGlzLm5leHRfd29ya2VyICsgMSkgJSB0aGlzLndvcmtlcnMubGVuZ3RoO1xuXG4gICAgLy8gRGVidWcgaW5mb1xuICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ2RhdGEtdGlsZS1rZXknLCB0aWxlLmtleSk7XG4gICAgZGl2LnN0eWxlLndpZHRoID0gJzI1NnB4JztcbiAgICBkaXYuc3R5bGUuaGVpZ2h0ID0gJzI1NnB4JztcblxuICAgIGlmICh0aGlzLmRlYnVnKSB7XG4gICAgICAgIHZhciBkZWJ1Z19vdmVybGF5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGRlYnVnX292ZXJsYXkudGV4dENvbnRlbnQgPSB0aWxlLmtleTtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5wb3NpdGlvbiA9ICdhYnNvbHV0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUubGVmdCA9IDA7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUudG9wID0gMDtcbiAgICAgICAgZGVidWdfb3ZlcmxheS5zdHlsZS5jb2xvciA9ICd3aGl0ZSc7XG4gICAgICAgIGRlYnVnX292ZXJsYXkuc3R5bGUuZm9udFNpemUgPSAnMTZweCc7XG4gICAgICAgIC8vIGRlYnVnX292ZXJsYXkuc3R5bGUudGV4dE91dGxpbmUgPSAnMXB4ICMwMDAwMDAnO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQoZGVidWdfb3ZlcmxheSk7XG5cbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlckNvbG9yID0gJ3doaXRlJztcbiAgICAgICAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCc7XG4gICAgfVxuXG4gICAgaWYgKGNhbGxiYWNrKSB7XG4gICAgICAgIGNhbGxiYWNrKG51bGwsIGRpdik7XG4gICAgfVxufTtcblxuLy8gQ2FsbGVkIG9uIG1haW4gdGhyZWFkIHdoZW4gYSB3ZWIgd29ya2VyIGNvbXBsZXRlcyBwcm9jZXNzaW5nIGZvciBhIHNpbmdsZSB0aWxlXG5WZWN0b3JSZW5kZXJlci5wcm90b3R5cGUudGlsZVdvcmtlckNvbXBsZXRlZCA9IGZ1bmN0aW9uIChldmVudClcbntcbiAgICBpZiAoZXZlbnQuZGF0YS50eXBlICE9ICdsb2FkVGlsZUNvbXBsZXRlZCcpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciB0aWxlID0gZXZlbnQuZGF0YS50aWxlO1xuXG4gICAgLy8gUmVtb3ZlZCB0aGlzIHRpbGUgZHVyaW5nIGxvYWQ/XG4gICAgaWYgKHRoaXMudGlsZXNbdGlsZS5rZXldID09IG51bGwpIHtcbiAgICAgICAgY29uc29sZS5sb2coXCJkaXNjYXJkZWQgdGlsZSBcIiArIHRpbGUua2V5ICsgXCIgaW4gVmVjdG9yUmVuZGVyZXIudGlsZVdvcmtlckNvbXBsZXRlZCBiZWNhdXNlIHByZXZpb3VzbHkgcmVtb3ZlZFwiKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHRoaXMudGlsZXNbdGlsZS5rZXldID0gdGlsZTsgLy8gVE9ETzogT0sgdG8ganVzdCB3aXBlIG91dCB0aGUgdGlsZSBoZXJlPyBvciBjb3VsZCBwYXNzIGJhY2sgYSBsaXN0IG9mIHByb3BlcnRpZXMgdG8gcmVwbGFjZT8gZmVlbGluZyB0aGUgbGFjayBvZiB1bmRlcnNjb3JlIGhlcmUuLi5cblxuICAgIC8vIENoaWxkIGNsYXNzLXNwZWNpZmljIHRpbGUgcHJvY2Vzc2luZ1xuICAgIGlmICh0eXBlb2YodGhpcy5fdGlsZVdvcmtlckNvbXBsZXRlZCkgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICB0aGlzLl90aWxlV29ya2VyQ29tcGxldGVkKHRpbGUpO1xuICAgIH1cblxuICAgIGRlbGV0ZSB0aWxlLmxheWVyczsgLy8gZGVsZXRlIHRoZSBzb3VyY2UgZGF0YSBpbiB0aGUgdGlsZSB0byBzYXZlIG1lbW9yeVxuXG4gICAgLy8gTm8gbW9yZSB0aWxlcyBhY3RpdmVseSBsb2FkaW5nP1xuICAgIGlmICh0aGlzLnRpbGVfc2V0X2xvYWRpbmcgIT0gbnVsbCkge1xuICAgICAgICB2YXIgZW5kX3RpbGVfc2V0ID0gdHJ1ZTtcbiAgICAgICAgZm9yICh2YXIgdCBpbiB0aGlzLnRpbGVzKSB7XG4gICAgICAgICAgICBpZiAodGhpcy50aWxlc1t0XS5sb2FkaW5nID09IHRydWUpIHtcbiAgICAgICAgICAgICAgICBlbmRfdGlsZV9zZXQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChlbmRfdGlsZV9zZXQgPT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5sYXN0X3RpbGVfc2V0X2xvYWQgPSAoK25ldyBEYXRlKCkpIC0gdGhpcy50aWxlX3NldF9sb2FkaW5nO1xuICAgICAgICAgICAgdGhpcy50aWxlX3NldF9sb2FkaW5nID0gbnVsbDtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKFwidGlsZSBzZXQgbG9hZCBGSU5JU0hFRCBpbjogXCIgKyB0aGlzLmxhc3RfdGlsZV9zZXRfbG9hZCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbiAgICB0aGlzLnByaW50RGVidWdGb3JUaWxlKHRpbGUpO1xufTtcblxuVmVjdG9yUmVuZGVyZXIucHJvdG90eXBlLnJlbW92ZVRpbGUgPSBmdW5jdGlvbiAoa2V5KVxue1xuICAgIGNvbnNvbGUubG9nKFwidGlsZSB1bmxvYWQgZm9yIFwiICsga2V5KTtcbiAgICB2YXIgdGlsZSA9IHRoaXMudGlsZXNba2V5XTtcbiAgICBpZiAodGlsZSAhPSBudWxsICYmIHRpbGUubG9hZGluZyA9PSB0cnVlKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiY2FuY2VsIHRpbGUgbG9hZCBmb3IgXCIgKyBrZXkpO1xuXG4gICAgICAgIC8vIFdlYiB3b3JrZXIgd2lsbCBjYW5jZWwgWEhSIHJlcXVlc3RzXG4gICAgICAgIGlmICh0aWxlLndvcmtlciAhPSBudWxsKSB7XG4gICAgICAgICAgICB0aWxlLndvcmtlci5wb3N0TWVzc2FnZSh7XG4gICAgICAgICAgICAgICAgdHlwZTogJ3JlbW92ZVRpbGUnLFxuICAgICAgICAgICAgICAgIGtleTogdGlsZS5rZXlcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgZGVsZXRlIHRoaXMudGlsZXNba2V5XTtcbiAgICB0aGlzLmRpcnR5ID0gdHJ1ZTtcbn07XG5cblZlY3RvclJlbmRlcmVyLnByb3RvdHlwZS5wcmludERlYnVnRm9yVGlsZSA9IGZ1bmN0aW9uICh0aWxlKVxue1xuICAgIGNvbnNvbGUubG9nKFxuICAgICAgICBcImRlYnVnIGZvciBcIiArIHRpbGUua2V5ICsgJzogWyAnICtcbiAgICAgICAgT2JqZWN0LmtleXModGlsZS5kZWJ1ZykubWFwKGZ1bmN0aW9uICh0KSB7IHJldHVybiB0ICsgJzogJyArIHRpbGUuZGVidWdbdF07IH0pLmpvaW4oJywgJykgKyAnIF0nXG4gICAgKTtcbn07XG5cblxuLyoqKiBDbGFzcyBtZXRob2RzIChzdGF0ZWxlc3MpICoqKi9cblxuLy8gU2ltcGxpc3RpYyBkZXRlY3Rpb24gb2YgcmVsYXRpdmUgcGF0aHMsIGFwcGVuZCBiYXNlIGlmIG5lY2Vzc2FyeVxuVmVjdG9yUmVuZGVyZXIudXJsRm9yUGF0aCA9IGZ1bmN0aW9uIChwYXRoKSB7XG4gICAgdmFyIHByb3RvY29sID0gcGF0aC50b0xvd2VyQ2FzZSgpLnN1YnN0cigwLCA0KTtcbiAgICBpZiAoIShwcm90b2NvbCA9PSAnaHR0cCcgfHwgcHJvdG9jb2wgPT0gJ2ZpbGUnKSkge1xuICAgICAgICBwYXRoID0gd2luZG93LmxvY2F0aW9uLm9yaWdpbiArIHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSArIHBhdGg7XG4gICAgfVxuICAgIHJldHVybiBwYXRoO1xufTtcblxuVmVjdG9yUmVuZGVyZXIubG9hZExheWVycyA9IGZ1bmN0aW9uICh1cmwpXG57XG4gICAgdmFyIGxheWVycztcbiAgICB2YXIgcmVxID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgcmVxLm9ubG9hZCA9IGZ1bmN0aW9uICgpIHsgZXZhbCgnbGF5ZXJzID0gJyArIHJlcS5yZXNwb25zZSk7IH07IC8vIFRPRE86IHNlY3VyaXR5IVxuICAgIHJlcS5vcGVuKCdHRVQnLCB1cmwsIGZhbHNlIC8qIGFzeW5jIGZsYWcgKi8pO1xuICAgIHJlcS5zZW5kKCk7XG4gICAgcmV0dXJuIGxheWVycztcbn07XG5cblZlY3RvclJlbmRlcmVyLmxvYWRTdHlsZXMgPSBmdW5jdGlvbiAodXJsKVxue1xuICAgIHZhciBzdHlsZXM7XG4gICAgdmFyIHJlcSA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHJlcS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7IGV2YWwoJ3N0eWxlcyA9ICcgKyByZXEucmVzcG9uc2UpOyB9OyAvLyBUT0RPOiBzZWN1cml0eSFcbiAgICByZXEub3BlbignR0VUJywgdXJsLCBmYWxzZSAvKiBhc3luYyBmbGFnICovKTtcbiAgICByZXEuc2VuZCgpO1xuICAgIHJldHVybiBzdHlsZXM7XG59O1xuXG4vLyBQcm9jZXNzZXMgdGhlIHRpbGUgcmVzcG9uc2UgdG8gY3JlYXRlIGxheWVycyBhcyBkZWZpbmVkIGJ5IHRoaXMgcmVuZGVyZXJcbi8vIENhbiBpbmNsdWRlIHBvc3QtcHJvY2Vzc2luZyB0byBwYXJ0aWFsbHkgZmlsdGVyIG9yIHJlLWFycmFuZ2UgZGF0YSwgZS5nLiBvbmx5IGluY2x1ZGluZyBQT0lzIHRoYXQgaGF2ZSBuYW1lc1xuVmVjdG9yUmVuZGVyZXIucHJvY2Vzc0xheWVyc0ZvclRpbGUgPSBmdW5jdGlvbiAobGF5ZXJzLCB0aWxlKVxue1xuICAgIHZhciB0aWxlX2xheWVycyA9IHt9O1xuICAgIGZvciAodmFyIHQ9MDsgdCA8IGxheWVycy5sZW5ndGg7IHQrKykge1xuICAgICAgICBsYXllcnNbdF0ubnVtYmVyID0gdDtcblxuICAgICAgICBpZiAobGF5ZXJzW3RdICE9IG51bGwpIHtcbiAgICAgICAgICAgIC8vIEp1c3QgcGFzcyB0aHJvdWdoIGRhdGEgdW50b3VjaGVkIGlmIG5vIGRhdGEgdHJhbnNmb3JtIGZ1bmN0aW9uIGRlZmluZWRcbiAgICAgICAgICAgIGlmIChsYXllcnNbdF0uZGF0YSA9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLm5hbWVdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gUGFzcyB0aHJvdWdoIGRhdGEgYnV0IHdpdGggZGlmZmVyZW50IGxheWVyIG5hbWUgaW4gdGlsZSBzb3VyY2UgZGF0YVxuICAgICAgICAgICAgZWxzZSBpZiAodHlwZW9mIGxheWVyc1t0XS5kYXRhID09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgdGlsZV9sYXllcnNbbGF5ZXJzW3RdLm5hbWVdID0gdGlsZS5sYXllcnNbbGF5ZXJzW3RdLmRhdGFdO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gQXBwbHkgdGhlIHRyYW5zZm9ybSBmdW5jdGlvbiBmb3IgcG9zdC1wcm9jZXNzaW5nXG4gICAgICAgICAgICBlbHNlIGlmICh0eXBlb2YgbGF5ZXJzW3RdLmRhdGEgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IGxheWVyc1t0XS5kYXRhKHRpbGUubGF5ZXJzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEhhbmRsZSBjYXNlcyB3aGVyZSBubyBkYXRhIHdhcyBmb3VuZCBpbiB0aWxlIG9yIHJldHVybmVkIGJ5IHBvc3QtcHJvY2Vzc29yXG4gICAgICAgIHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSA9IHRpbGVfbGF5ZXJzW2xheWVyc1t0XS5uYW1lXSB8fCB7IHR5cGU6ICdGZWF0dXJlQ29sbGVjdGlvbicsIGZlYXR1cmVzOiBbXSB9O1xuICAgIH1cbiAgICB0aWxlLmxheWVycyA9IHRpbGVfbGF5ZXJzO1xuICAgIHJldHVybiB0aWxlX2xheWVycztcbn07XG5cblxuLyoqKiBTdHlsZSBwYXJzaW5nICYgZGVmYXVsdHMgKioqL1xuXG4vLyBEZXRlcm1pbmUgZmluYWwgc3R5bGUgcHJvcGVydGllcyAoY29sb3IsIHdpZHRoLCBldGMuKVxuVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMgPSB7XG4gICAgY29sb3I6IFsxLjAsIDAsIDBdLFxuICAgIHdpZHRoOiBTdHlsZS53aWR0aC5waXhlbHMoNSksXG4gICAgc2l6ZTogU3R5bGUud2lkdGgucGl4ZWxzKDUpLFxuICAgIGV4dHJ1ZGU6IGZhbHNlLFxuICAgIGhlaWdodDogMjAsXG4gICAgbWluX2hlaWdodDogMCxcbiAgICBvdXRsaW5lOiB7XG4gICAgICAgIC8vIGNvbG9yOiBbMS4wLCAwLCAwXSxcbiAgICAgICAgLy8gd2lkdGg6IDEsXG4gICAgICAgIC8vIGRhc2g6IG51bGxcbiAgICB9LFxuICAgIC8vIHJlbmRlcl9tb2RlOiB7XG4gICAgLy8gICAgIG5hbWU6ICdwb2x5Z29ucydcbiAgICAvLyB9XG4gICAgcmVuZGVyX21vZGU6ICdwb2x5Z29ucydcbn07XG5cblZlY3RvclJlbmRlcmVyLnBhcnNlU3R5bGVGb3JGZWF0dXJlID0gZnVuY3Rpb24gKGZlYXR1cmUsIGxheWVyX3N0eWxlLCB0aWxlKVxue1xuICAgIHZhciBsYXllcl9zdHlsZSA9IGxheWVyX3N0eWxlIHx8IHt9O1xuICAgIHZhciBzdHlsZSA9IHt9O1xuXG4gICAgLy8gVGVzdCB3aGV0aGVyIGZlYXR1cmVzIHNob3VsZCBiZSByZW5kZXJlZCBhdCBhbGxcbiAgICBpZiAodHlwZW9mIGxheWVyX3N0eWxlLmZpbHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIGlmIChsYXllcl9zdHlsZS5maWx0ZXIoZmVhdHVyZSwgdGlsZSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gUGFyc2Ugc3R5bGVzXG4gICAgc3R5bGUuY29sb3IgPSAobGF5ZXJfc3R5bGUuY29sb3IgJiYgKGxheWVyX3N0eWxlLmNvbG9yW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5jb2xvci5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMuY29sb3I7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5jb2xvciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLmNvbG9yID0gc3R5bGUuY29sb3IoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUud2lkdGggPSAobGF5ZXJfc3R5bGUud2lkdGggJiYgKGxheWVyX3N0eWxlLndpZHRoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS53aWR0aC5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS53aWR0aCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gc3R5bGUud2lkdGgoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUuc2l6ZSA9IChsYXllcl9zdHlsZS5zaXplICYmIChsYXllcl9zdHlsZS5zaXplW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5zaXplLmRlZmF1bHQpKSB8fCBWZWN0b3JSZW5kZXJlci5zdHlsZV9kZWZhdWx0cy5zaXplO1xuICAgIGlmICh0eXBlb2Ygc3R5bGUuc2l6ZSA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLnNpemUgPSBzdHlsZS5zaXplKGZlYXR1cmUsIHRpbGUpO1xuICAgIH1cblxuICAgIHN0eWxlLmV4dHJ1ZGUgPSAobGF5ZXJfc3R5bGUuZXh0cnVkZSAmJiAobGF5ZXJfc3R5bGUuZXh0cnVkZVtmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUuZXh0cnVkZS5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMuZXh0cnVkZTtcbiAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5leHRydWRlID0gc3R5bGUuZXh0cnVkZShmZWF0dXJlLCB0aWxlKTsgLy8gcmV0dXJuaW5nIGEgYm9vbGVhbiB3aWxsIGV4dHJ1ZGUgd2l0aCB0aGUgZmVhdHVyZSdzIGhlaWdodCwgYSBudW1iZXIgd2lsbCBvdmVycmlkZSB0aGUgZmVhdHVyZSBoZWlnaHQgKHNlZSBiZWxvdylcbiAgICB9XG5cbiAgICBzdHlsZS5oZWlnaHQgPSAoZmVhdHVyZS5wcm9wZXJ0aWVzICYmIGZlYXR1cmUucHJvcGVydGllcy5oZWlnaHQpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLmhlaWdodDtcbiAgICBzdHlsZS5taW5faGVpZ2h0ID0gKGZlYXR1cmUucHJvcGVydGllcyAmJiBmZWF0dXJlLnByb3BlcnRpZXMubWluX2hlaWdodCkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMubWluX2hlaWdodDtcblxuICAgIC8vIGhlaWdodCBkZWZhdWx0cyB0byBmZWF0dXJlIGhlaWdodCwgYnV0IGV4dHJ1ZGUgc3R5bGUgY2FuIGR5bmFtaWNhbGx5IGFkanVzdCBoZWlnaHQgYnkgcmV0dXJuaW5nIGEgbnVtYmVyIG9yIGFycmF5IChpbnN0ZWFkIG9mIGEgYm9vbGVhbilcbiAgICBpZiAoc3R5bGUuZXh0cnVkZSkge1xuICAgICAgICBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHN0eWxlLmhlaWdodCA9IHN0eWxlLmV4dHJ1ZGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodHlwZW9mIHN0eWxlLmV4dHJ1ZGUgPT0gJ29iamVjdCcgJiYgc3R5bGUuZXh0cnVkZS5sZW5ndGggPj0gMikge1xuICAgICAgICAgICAgc3R5bGUubWluX2hlaWdodCA9IHN0eWxlLmV4dHJ1ZGVbMF07XG4gICAgICAgICAgICBzdHlsZS5oZWlnaHQgPSBzdHlsZS5leHRydWRlWzFdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZSA9IHt9O1xuICAgIGxheWVyX3N0eWxlLm91dGxpbmUgPSBsYXllcl9zdHlsZS5vdXRsaW5lIHx8IHt9O1xuICAgIHN0eWxlLm91dGxpbmUuY29sb3IgPSAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvciAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvcltmZWF0dXJlLnByb3BlcnRpZXMua2luZF0gfHwgbGF5ZXJfc3R5bGUub3V0bGluZS5jb2xvci5kZWZhdWx0KSkgfHwgVmVjdG9yUmVuZGVyZXIuc3R5bGVfZGVmYXVsdHMub3V0bGluZS5jb2xvcjtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuY29sb3IgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBzdHlsZS5vdXRsaW5lLmNvbG9yID0gc3R5bGUub3V0bGluZS5jb2xvcihmZWF0dXJlLCB0aWxlKTtcbiAgICB9XG5cbiAgICBzdHlsZS5vdXRsaW5lLndpZHRoID0gKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGggJiYgKGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGhbZmVhdHVyZS5wcm9wZXJ0aWVzLmtpbmRdIHx8IGxheWVyX3N0eWxlLm91dGxpbmUud2lkdGguZGVmYXVsdCkpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLm91dGxpbmUud2lkdGg7XG4gICAgaWYgKHR5cGVvZiBzdHlsZS5vdXRsaW5lLndpZHRoID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgc3R5bGUub3V0bGluZS53aWR0aCA9IHN0eWxlLm91dGxpbmUud2lkdGgoZmVhdHVyZSwgdGlsZSk7XG4gICAgfVxuXG4gICAgc3R5bGUub3V0bGluZS5kYXNoID0gKGxheWVyX3N0eWxlLm91dGxpbmUuZGFzaCAmJiAobGF5ZXJfc3R5bGUub3V0bGluZS5kYXNoW2ZlYXR1cmUucHJvcGVydGllcy5raW5kXSB8fCBsYXllcl9zdHlsZS5vdXRsaW5lLmRhc2guZGVmYXVsdCkpIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLm91dGxpbmUuZGFzaDtcbiAgICBpZiAodHlwZW9mIHN0eWxlLm91dGxpbmUuZGFzaCA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgIHN0eWxlLm91dGxpbmUuZGFzaCA9IHN0eWxlLm91dGxpbmUuZGFzaChmZWF0dXJlLCB0aWxlKTtcbiAgICB9XG5cbiAgICBzdHlsZS5yZW5kZXJfbW9kZSA9IGxheWVyX3N0eWxlLnJlbmRlcl9tb2RlIHx8IFZlY3RvclJlbmRlcmVyLnN0eWxlX2RlZmF1bHRzLnJlbmRlcl9tb2RlO1xuICAgIC8vIHN0eWxlLnJlbmRlcl9tb2RlID0ge307XG4gICAgLy8gc3R5bGUucmVuZGVyX21vZGUubmFtZSA9IChsYXllcl9zdHlsZS5yZW5kZXJfbW9kZSAmJiBsYXllcl9zdHlsZS5yZW5kZXJfbW9kZS5uYW1lKSB8fCBWZWN0b3JSZW5kZXJlci5zdHlsZV9kZWZhdWx0cy5yZW5kZXJfbW9kZS5uYW1lO1xuXG4gICAgcmV0dXJuIHN0eWxlO1xufTtcblxuaWYgKG1vZHVsZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBWZWN0b3JSZW5kZXJlcjtcbn1cbiJdfQ==
(9)
});
