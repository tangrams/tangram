// Interleave z coords:
// Force-order layers (higher layers guaranteed to render on top of lower), then sort by height/depth
// Flip and scale z to 0-1 for GL depth buffer

float calculateZ (float z, float layer, const float num_layers, const float z_layer_scale) {
    float z_layer_range = (num_layers + 1.) * z_layer_scale;
    float z_layer = (layer + 1.) * z_layer_scale;

    z = z_layer + clamp(z, 0., z_layer_scale);
    z = (z_layer_range - z) / z_layer_range;

    return z;
}

#pragma glslify: export(calculateZ)
