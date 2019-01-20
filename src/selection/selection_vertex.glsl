// Selection pass-specific rendering
#if defined(TANGRAM_FEATURE_SELECTION) && defined(TANGRAM_VERTEX_SHADER)
    if (a_selection_color.rgb == vec3(0.)) {
        // Discard by forcing invalid triangle if we're in the feature
        // selection pass but have no selection info
        // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
        gl_Position = vec4(0., 0., 0., 1.);
        return;
    }
    v_selection_color = a_selection_color;
#endif
