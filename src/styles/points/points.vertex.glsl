uniform mat4 u_modelView;

attribute vec3 a_position;
attribute vec2 a_texcoord;
attribute vec4 a_color;

varying vec4 v_color;
varying vec2 v_texcoord;

#if defined(FEATURE_SELECTION)
    attribute vec4 a_selection_color;
    varying vec4 v_selection_color;
#endif

#pragma tangram: globals
#pragma tangram: camera

void main() {
    #if defined(FEATURE_SELECTION)
        if (a_selection_color.rgb == vec3(0.)) {
            // Discard by forcing invalid triangle if we're in the feature
            // selection pass but have no selection info
            // TODO: in some cases we may actually want non-selectable features to occlude selectable ones?
            gl_Position = vec4(0., 0., 0., 1.);
            return;
        }
        v_selection_color = a_selection_color;
    #endif

    vec4 position = u_modelView * vec4(a_position, 1.);

    #pragma tangram: position

    v_color = a_color;
    v_texcoord = a_texcoord;

    cameraProjection(position);

    gl_Position = position;
}
