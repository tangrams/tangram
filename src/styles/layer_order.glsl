// Apply layer ordering to avoid z-fighting
void applyLayerOrder (float layer, inout vec4 position) {
    position.z -= layer * TANGRAM_LAYER_DELTA * position.w;
}
