#if defined(FEATURE_SELECTION)
    varying vec4 v_selection_color;
#endif

void main (void) {
    #if defined(FEATURE_SELECTION)
        gl_FragColor = v_selection_color;
    #else
        gl_FragColor = vec4(0., 0., 0., 1.);
    #endif
}
