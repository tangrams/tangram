uniform vec2 u_map_center;
uniform float u_map_zoom;
uniform vec2 u_meter_zoom;
uniform vec2 u_tile_min;
uniform vec2 u_tile_max;
uniform float u_num_layers;
// uniform float u_time;

attribute vec3 a_position;
// attribute vec3 a_normal;
attribute vec2 a_texcoord;
attribute vec3 a_color;
attribute float a_layer;

varying vec3 v_color;
varying vec2 v_texcoord;

// vec3 light = normalize(vec3(0.2, 0.7, -0.5)); // vec3(0.1, 0.2, -0.4)
// const float ambient = 0.45;

void main() {
    vec3 vposition = a_position;
    // vec3 vnormal = a_normal;
    // vec2 vtexcoord = a_texcoord;

    // Calc position of vertex in meters, relative to center of screen
    vposition.y *= -1.0; // adjust for flipped y-coords
    vposition.xy *= (u_tile_max - u_tile_min) / TILE_SCALE; // adjust for vertex location within tile (scaled from local coords to meters)
    vposition.xy += u_tile_min.xy - u_map_center; // adjust for corner of tile relative to map center
    vposition.xy /= u_meter_zoom; // adjust for zoom in meters to get clip space coords

    // Shading & texture
    v_color = a_color;
    v_texcoord = a_texcoord;

    // Reverse and scale to 0-1 for GL depth buffer
    // Layers are force-ordered (higher layers guaranteed to render on top of lower), then by height/depth
    float z_layer_scale = 4096.;
    float z_layer_range = (u_num_layers + 1.) * z_layer_scale;
    float z_layer = (a_layer + 1.) * z_layer_scale;
    // float z_layer = (a_layer + 1.);

    vposition.z = z_layer + clamp(vposition.z, 1., z_layer_scale);
    vposition.z = (z_layer_range - vposition.z) / z_layer_range;

    gl_Position = vec4(vposition, 1.0);
}
