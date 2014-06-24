// #define PROJECTION_PERSPECTIVE
// #define PROJECTION_ISOMETRIC
// #define PROJECTION_POPUP

// #define LIGHTING_POINT
// #define LIGHTING_DIRECTION

// #define ANIMATION_ELEVATOR
// #define ANIMATION_WAVE

uniform vec2 resolution;
uniform vec2 map_center;
uniform float map_zoom;
uniform vec2 meter_zoom;
uniform vec2 tile_min;
uniform vec2 tile_max;
uniform float num_layers;
uniform float time;
uniform float u_heightVar;
uniform float u_layerVar;
uniform vec3 testUniformColor0;
uniform vec3 testUniformColor1;
uniform vec3 testUniformColor2;
uniform vec3 testUniformColor3;
uniform vec3 testUniformColor4;
uniform vec3 testUniformColor5;
uniform vec3 testUniformColor6;
uniform vec3 testUniformColor7;
uniform vec3 testUniformColor8;
uniform vec3 testUniformColor9;

attribute vec3 position;
attribute vec3 normal;
attribute vec3 color;
attribute float layer;

varying vec3 fcolor;

#if defined(EFFECT_NOISE_TEXTURE)
    varying vec3 fposition;
#endif

vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)
const float ambient = 0.45;

// Project lat-lng to mercator
// vec2 latLngToMeters (vec2 coordinate) {
//     const float pi = 3.1415926;
//     const float half_circumference_meters = 20037508.342789244;
//     vec2 projected;

//     // Latitude
//     projected.y = log(tan((coordinate.y + 90.0) * pi / 360.0)) / (pi / 180.0);
//     projected.y = projected.y * half_circumference_meters / 180.0;

//     // Longitude
//     projected.x = coordinate.x * half_circumference_meters / 180.0;

//     return projected;
// }

void main() {
    vec3 vposition = position;
    vec3 vnormal = normal;

    // Calc position of vertex in meters, relative to center of screen
    vposition.y *= -1.0; // adjust for flipped y-coords
    // vposition.y += TILE_SCALE; // alternate, to also adjust for force-positive y coords in tile
    vposition.xy *= (tile_max - tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)

    // vposition.z *= testUniform;

    // Vertex displacement + procedural effects
    #if defined(ANIMATION_ELEVATOR) || defined(ANIMATION_WAVE) || defined(EFFECT_NOISE_TEXTURE)
        vec3 vposition_world = vposition + vec3(tile_min, 0.); // need vertex in world coords (before map center transform), hack to get around precision issues (see below)

        #if defined(EFFECT_NOISE_TEXTURE)
            fposition = vposition_world;
        #endif

        if (vposition_world.z > 1.0) {
            // vposition.x += sin(vposition_world.z + time) * 10.0 * sin(position.x); // swaying buildings
            // vposition.y += cos(vposition_world.z + time) * 10.0;

            #if defined(ANIMATION_ELEVATOR)
                // vposition.z *= (sin(vposition_world.z / 25.0 * time) + 1.0) / 2.0 + 0.1; // evelator buildings
                vposition.z *= max((sin(vposition_world.z + time) + 1.0) / 2.0, 0.05); // evelator buildings
            #elif defined(ANIMATION_WAVE)
                vposition.z *= max((sin(vposition_world.x / 100.0 + time) + 1.0) / 2.0, 0.05); // wave
            #endif
        }
    #endif

    // NOTE: due to unresolved floating point precision issues, tile and map center adjustment need to happen in ONE operation, or artifcats are introduced
    vposition.xy += tile_min.xy - map_center; // adjust for corner of tile relative to map center
    vposition.xy /= meter_zoom; // adjust for zoom in meters to get clip space coords

    // Shading
    fcolor = color;
    // if (color[0] == 0.5) {
    //     fcolor = testUniformColor1;
    // } 
    // if (color[0] == 0.6) {
    //     fcolor = testUniformColor2;
    // } 
    if (layer == 0.0) {
        fcolor = testUniformColor0;
    } 
    if (layer == 1.0) {
        fcolor = testUniformColor1;
    } 
    if (layer == 2.0) {
        fcolor = testUniformColor2;
    } 
    if (layer == 3.0) {
        fcolor = testUniformColor3;
    } 
    if (layer == 4.0) {
        fcolor = testUniformColor4;
    } 
    if (layer == 5.0) {
        fcolor = testUniformColor5;
    } 
    if (layer == 6.0) {
        fcolor = testUniformColor6;
    } 
    if (layer == 7.0) {
        fcolor = testUniformColor7;
    } 
    if (layer == 8.0) {
        fcolor = testUniformColor8;
    } 
    // if (layer == u_layerVar) {
    //     fcolor = testUniformColor1;
    // } 

    // fcolor += vec3(sin(position.z + time), 0.0, 0.0); // color change on height + time
    // fcolor += vec3(position.z) * vec3(testUniform); // color change on height + time

    #if defined(LIGHTING_POINT) || defined(LIGHTING_NIGHT)
        // Gouraud shading
        light = vec3(-0.25, -0.25, 0.50); // vec3(0.1, 0.1, 0.35); // point light location
        // light = vec3(-0.25, -0.25, 0.50+ testUniform); // vec3(0.1, 0.1, 0.35); // point light location

        #if defined(LIGHTING_NIGHT)
            // "Night" effect by flipping vertex z
            light = normalize(vec3(vposition.x, vposition.y, vposition.z) - light); // light angle from light point to vertex
            fcolor *= dot(vnormal, light * -1.0); // + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);
        #else
            // Point light-based gradient
            light = normalize(vec3(vposition.x, vposition.y, -vposition.z) - light); // light angle from light point to vertex
            fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * 2.0 / meter_zoom.x, 0.0, 0.25);
            // fcolor *= dot(vnormal, light * -1.0) + ambient + clamp(vposition.z * testUniform / meter_zoom.x, 0.0, 0.25);
        #endif

    #elif defined(LIGHTING_DIRECTION)
        // Flat shading
        light = normalize(vec3(0.2, 0.7, -0.5));
        // light = normalize(vec3(-1., 0.7, -.0));
        // light = normalize(vec3(-1., 0.7, -.75));
        // fcolor *= max(dot(vnormal, light * -1.0), 0.1) + ambient;
        fcolor *= dot(vnormal, light * -1.0) + ambient;
    #endif

    #if defined(PROJECTION_PERSPECTIVE)
        // // Perspective-style projection
        vec2 perspective_offset = vec2(-0.5, -0.5);
        // vec2 perspective_offset = vec2(0.0,0.0);
        // vec2 perspective_offset = vec2(-0.25, -0.25) + vec2(testUniform);
        // vec2 perspective_factor = vec2(0.8, 0.8); // vec2(-0.25, 0.75);
        vec2 perspective_factor = vec2(0.8, 0.8) * vec2(u_heightVar); // vec2(-0.25, 0.75);
        vposition.xy += vposition.z * perspective_factor * (vposition.xy - perspective_offset) / meter_zoom.xy; // perspective from offset center screen
        // vposition.xy += vec2(vposition.z * testUniform/1000.0);
    #elif defined(PROJECTION_ISOMETRIC) || defined(PROJECTION_POPUP)
        // Pop-up effect - 3d in center of viewport, fading to 2d at edges
        #if defined(PROJECTION_POPUP)
            if (vposition.z > 1.0) {
                float cd = distance(vposition.xy * (resolution.xy / resolution.yy), vec2(0.0, 0.0));
                const float popup_fade_inner = 0.05;
                const float popup_fade_outer = 0.75;
                if (cd > popup_fade_inner) {
                    vposition.z *= 1.0 - smoothstep(popup_fade_inner, popup_fade_outer, cd);
                }
                const float zoom_boost_start = 15.0;
                const float zoom_boost_end = 17.0;
                const float zoom_boost_magnitude = 0.75;
                vposition.z *= 1.0 + (1.0 - smoothstep(zoom_boost_start, zoom_boost_end, map_zoom)) * zoom_boost_magnitude;
            }
        #endif

        // Isometric-style projection
        vposition.y += vposition.z * u_heightVar / meter_zoom.y; // z coordinate is a simple translation up along y axis, ala isometric
        // vposition.y += vposition.z * 0.5; // closer to Ultima 7-style axonometric
        // vposition.x -= vposition.z * 0.5;
    #endif

    // Rotation test
    // float theta = 0;
    // const float pi = 3.1415926;
    // vec2 pr;
    // pr.x = vposition.x * cos(theta * pi / 180.0) + vposition.y * -sin(theta * pi / 180.0);
    // pr.y = vposition.x * sin(theta * pi / 180.0) + vposition.y * cos(theta * pi / 180.0);
    // vposition.xy = pr;

    // vposition.y *= max(abs(sin(vposition.x)), 0.1); // hourglass effect
    // vposition.y *= abs(max(sin(vposition.x), 0.1)); // funnel effect

    // Reverse and scale to 0-1 for GL depth buffer
    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth
    float z_layer_scale = 4096.;
    float z_layer_range = (num_layers + 1.) * z_layer_scale;
    float z_layer = (layer + 1.) * z_layer_scale;

    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);
    vposition.z = (z_layer_range - vposition.z) / z_layer_range;

    gl_Position = vec4(vposition, 1.0);
}
