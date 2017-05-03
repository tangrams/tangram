// Vertex attribute + varying for feature selection
#if defined(TANGRAM_FEATURE_SELECTABLE) && defined(TANGRAM_VERTEX_SHADER)
    attribute vec4 a_selection_color;
    attribute vec4 a_selection_group;
    attribute vec4 a_selection_hover_color;
    attribute vec4 a_selection_click_color;
#endif

#if defined(TANGRAM_FEATURE_SELECTABLE)
    #define TANGRAM_SELECTION_STATE_HOVER 1.
    #define TANGRAM_SELECTION_STATE_CLICK 2.

    varying vec4 v_selection_color;
    varying float v_selection_state;

    uniform vec4 u_selection_hover_group;
    uniform vec4 u_selection_click_group;

    // uniform vec4 u_selection_hover_color;
    // uniform vec4 u_selection_click_color;

    // uniform bool u_selection_has_hover_color;
    // uniform bool u_selection_has_click_color;

    uniform bool u_selection_has_group;
    uniform bool u_selection_has_instances;

    float isFeatureHover (void) {
        return 1. - step(TANGRAM_EPSILON, abs(TANGRAM_SELECTION_STATE_HOVER - v_selection_state));
    }

    float isFeatureClick (void) {
        return 1. - step(TANGRAM_EPSILON, abs(TANGRAM_SELECTION_STATE_CLICK - v_selection_state));
    }
#endif
