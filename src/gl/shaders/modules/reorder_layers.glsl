// Re-orders depth so that higher numbered layers are "force"-drawn over lower ones

void reorderLayers (float layer, float num_layers, inout vec4 position) {
    float layer_order = (layer / num_layers) + 1.;
    position.z /= layer_order;
    position.xyw *= layer_order;
}

#pragma glslify: export(reorderLayers)
