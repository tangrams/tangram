// Vertex attribute + varying for feature selection
#if defined(TANGRAM_FEATURE_SELECTABLE) && defined(TANGRAM_VERTEX_SHADER)
    attribute vec4 a_selection_color;
    attribute vec4 a_selection_group;
#endif

#if defined(TANGRAM_FEATURE_SELECTABLE)
    varying vec4 v_selection_color;
    varying vec4 v_selection_group;
#endif
