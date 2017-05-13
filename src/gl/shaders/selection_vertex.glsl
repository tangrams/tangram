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

    // float hover_active = 1. - float(any(notEqual(u_selection_hover_group - a_selection_group, vec4(0.))));
    // v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_HOVER, hover_active);
    // v_color = mix(v_color, a_selection_hover_color, hover_active * float(any(notEqual(a_selection_hover_color, vec4(0.)))));

    // float click_active = 1. - float(any(notEqual(u_selection_click_group - a_selection_group, vec4(0.))));
    // v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_CLICK, click_active);
    // v_color = mix(v_color, a_selection_click_color, click_active * float(any(notEqual(a_selection_click_color, vec4(0.)))));

    if (u_selection_has_group == true) {
        float hover_active = 1. - float(any(notEqual(u_selection_hover_group.rgb - a_selection_group.rgb, vec3(0.))));
        v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_HOVER, hover_active);

        float click_active = 1. - float(any(notEqual(u_selection_click_group.rgb - a_selection_group.rgb, vec3(0.))));
        v_selection_state = mix(v_selection_state, TANGRAM_SELECTION_STATE_CLICK, click_active);

        // if (a_selection_group.a < 255.) {
        if (u_selection_has_instances == true && a_selection_group.a < 255.) {
            // Bitfields
            // 0 (1):  default instance
            // 1 (2):  hover instance
            // 2 (4):  click instance
            // 3 (8):  has hover instance
            // 4 (16): has click instance

            // float is_default = mod(a_selection_group.a, 2.);
            // float is_hover = float(mod(a_selection_group.a, 4.) >= 2.);
            // float is_click = float(mod(a_selection_group.a, 8.) >= 4.);
            // float has_hover = float(mod(a_selection_group.a, 16.) >= 8.);
            // float has_click = float(mod(a_selection_group.a, 32.) >= 16.);

            // if ((((hover_active * has_hover) + (click_active * has_click)) * is_default > 0.) ||
            //     (((1.-hover_active) + (click_active * has_click)) * is_hover > 0.) ||
            //     ((1.-click_active) * is_click > 0.)) {
            //     gl_Position = vec4(0., 0., 0., 1.);
            //     return;
            // }

            float instance_type = mod(a_selection_group.a, 8.);
            float has_hover = float(mod(a_selection_group.a, 16.) >= 8.);
            float has_click = float(mod(a_selection_group.a, 32.) >= 16.);

            if (((hover_active * has_hover) + (click_active * has_click) > 0. && instance_type == TANGRAM_SELECTION_STATE_NONE) ||
                ((1.-hover_active) + (click_active * has_click) > 0. && instance_type == TANGRAM_SELECTION_STATE_HOVER) ||
                (click_active == 0. && instance_type == TANGRAM_SELECTION_STATE_CLICK)) {
                gl_Position = vec4(0., 0., 0., 1.);
                return;
            }

            // if ((((hover_active == 1. && has_hover == 1.) || (click_active == 1. && has_click == 1.)) && is_default == 1.) ||
            //     ((hover_active == 0. || (click_active == 1. && has_click == 1.)) && is_hover == 1.) ||
            //     (click_active == 0. && is_click == 1.)) {
            //     gl_Position = vec4(0., 0., 0., 1.);
            //     return;
            // }

            // float has_hover = mod(a_selection_group.a, 2.);
            // // float has_click = floor(mod(a_selection_group.a, 4.) * .5);
            // float has_click = float(mod(a_selection_group.a, 4.) >= 2.);
            // float instance_type = floor(a_selection_group.a * .25);

            // // if ((((hover_active == 1. && has_hover == 1.) || (click_active == 1. && has_click == 1.)) && instance_type == 0.) ||
            // //     ((hover_active == 0. || (click_active == 1. && has_click == 1.)) && instance_type == 1.) ||
            // //     (click_active == 0. && instance_type == 2.)) {

            //     gl_Position = vec4(0., 0., 0., 1.);
            //     return;
            // }
        }
    }

#endif
