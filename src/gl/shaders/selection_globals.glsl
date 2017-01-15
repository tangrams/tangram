// Vertex attribute + varying for feature selection
#if defined(TANGRAM_FEATURE_SELECTABLE) && defined(TANGRAM_VERTEX_SHADER)
    attribute vec4 a_selection_color;
    attribute vec4 a_selection_group;
#endif

#if defined(TANGRAM_FEATURE_SELECTABLE)
    varying vec4 v_selection_color;
    varying float v_selection_state;

    uniform vec4 u_selection_hover_group;
    uniform vec4 u_selection_click_group;
    uniform vec4 u_selection_hover_color;
    uniform vec4 u_selection_click_color;

    bool isFeatureHover (void) {
        return v_selection_state == 1.;
    }

    bool isFeatureClick (void) {
        return v_selection_state == 2.;
    }
#endif
