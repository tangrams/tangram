// Fragment shader for feature selection passes
// Renders in silhouette according to selection (picking) color, or black if none defined

#ifdef TANGRAM_FEATURE_SELECTION
    varying vec4 v_selection_color;
#endif

void main (void) {
    #ifdef TANGRAM_FEATURE_SELECTION
        gl_FragColor = v_selection_color;
    #else
        gl_FragColor = vec4(0., 0., 0., 1.);
    #endif
}
