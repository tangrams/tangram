// Vertex attribute + varying for feature selection
#if defined(FEATURE_SELECTION) && defined(TANGRAM_VERTEX_SHADER)
    attribute vec4 a_selection_color;
    varying vec4 v_selection_color;
#endif
