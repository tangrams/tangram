let debugSettings;

export default debugSettings = {
    // draws a blue rectangle border around the collision box of a label
    draw_label_collision_boxes: false,

    // draws a green rectangle border within the texture box of a label
    draw_label_texture_boxes: false,

    // suppreses fade-in of labels
    suppress_label_fade_in: false,

    // suppress animaton of label snap to pixel grid
    suppress_label_snap_animation: false,

    // show hidden labels for debugging
    show_hidden_labels: false,

    // collect feature/geometry stats on styling layers
    layer_stats: false
};

export function mergeDebugSettings (settings) {
    Object.assign(debugSettings, settings);
}
