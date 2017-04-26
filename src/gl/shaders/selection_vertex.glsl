// Selection pass-specific rendering
#if defined(TANGRAM_VERTEX_SHADER) && defined(TANGRAM_FEATURE_SELECTABLE)
    #if defined(TANGRAM_FEATURE_SELECTION_PASS)
    if (a_selection_color.rgb == vec3(0.)) {
        // Discard by forcing invalid triangle if we're in the feature
        // selection pass but have no selection info
        // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
        gl_Position = vec4(0., 0., 0., 1.);
        return;
    }
    #endif

    v_selection_color = a_selection_color;
    v_selection_state = 0.;

    float hover_active = 1. - float(any(notEqual(u_selection_hover_group - a_selection_group, vec4(0.))));
    v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_HOVER, hover_active);
    v_color = mix(v_color, a_selection_hover_color, hover_active * float(any(notEqual(a_selection_hover_color, vec4(0.)))));

    float click_active = 1. - float(any(notEqual(u_selection_click_group - a_selection_group, vec4(0.))));
    v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_CLICK, click_active);
    v_color = mix(v_color, a_selection_click_color, click_active * float(any(notEqual(a_selection_click_color, vec4(0.)))));
#endif
