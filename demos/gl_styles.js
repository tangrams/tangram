{
    water_ocean: {
        render_mode: 'polygons_noise',
        color: {
            default: [0.5, 0.5, 0.875]
        }
    },
    earth: {
        color: {
            default: [0.175, 0.175, 0.175]
        }
    },
    landuse: {
        color: {
            default: [0.5, 0.875, 0.5],
            'pitch': [0.3, 0.675, 0.3]
        }
        // outline: {
        //     color: {
        //         default: [1, 1, 1]
        //     },
        //     width: {
        //         default: 1
        //     }
        // }
    },
    water_areas: {
        render_mode: 'polygons_noise',
        color: {
            default: [0.5, 0.5, 0.875]
        },
        outline: {
            color: {
                default: [0.6, 0.6, 0.975]
            },
            width: {
                default: function (f, t) {
                    return (
                        t.coords.z >= 16 &&
                        (f.properties.kind != 'ocean' && f.properties.kind != 'riverbank') &&
                        (2.5 * Math.log(t.coords.z))
                    );
                }
            }
        }
    },
    roads: {
        color: {
            // default: Style.color.randomColor
            default: [0.4, 0.4, 0.4],
            'highway': [1.0, 1.0, 1.0],
            'major_road': [0.5, 0.5, 0.5],
            'minor_road': [0.65, 0.65, 0.65],
            'path': [0.8, 0.8, 0.8],
            'rail': [0.5, 0.0, 0.0],
            'debug': [1, 0, 0]
        },
        width: {
            // default: Style.pixels(5),
            default: function (f, t) { return 2 * Math.log(t.coords.z); },
            'highway': function (f, t) { return 3 * Math.log(t.coords.z); },
            'major_road': function (f, t) { return 2.5 * Math.log(t.coords.z); },
            'minor_road': function (f, t) { return 2 * Math.log(t.coords.z); },
            'path': function (f, t) { return 1 * Math.log(t.coords.z); },
            'debug': function (f, t) { return 5; }
        },
        // z: {
        //     'path': 25
        // },
        outline: {
            color: {
                default: [0.1, 0.7, 0.7]
            },
            width: {
                default: function (f, t) { return (t.coords.z >= 18 ? (2/8 * Math.log(t.coords.z)) : null); },
                'highway': function (f, t) { return (t.coords.z >= 18 ? (3/8 * Math.log(t.coords.z)) : null); },
                'major_road': function (f, t) { return (t.coords.z >= 18 ? (2.5/8 * Math.log(t.coords.z)) : null); },
                'minor_road': function (f, t) { return (t.coords.z >= 18 ? (2/8 * Math.log(t.coords.z)) : null); },
                'path': function (f, t) { return (t.coords.z >= 18 ? (2/8 * Math.log(t.coords.z)) : null); },
                'debug': function (f, t) { return (t.coords.z >= 18 ? (2/8 * Math.log(t.coords.z)) : null); }
            }
        }
    },
    buildings: {
        // filter: function (f) { return f.properties.name != null; },
        // filter: function (f) { return Math.random() < 0.25; },
        // filter: function (f) { return true; },
        color: {
            // default: function(f) { var h = f.properties.height || 20; h = Math.min((h + 50) / 250, 1.0); return [h, h, h]; } // shade based on height
            // default: Style.color.pseudoRandomColor
            // default: Style.color.pseudoRandomGrayscale
            default: function (f) { return (f.properties.name || f.properties.kind) ? [(f.properties.name && 0.6) || 0.2, 0.2, (f.properties.kind && 0.6) || 0.2] : [0.6, 0.6, 0.6]; }
            // default: function (f) { return [0.6, 0.6, 0.6]; }
        },
        extrude: {
            default: function (f, t) { return ((t.coords.z >= 15 && f.properties.height > 20) || t.coords.z >= 16) }
        }
    },
    pois: {
        render_mode: 'points',
        // visible: false,
        color: {
            default: [1.0, 1.0, 0]
        },
        size: {
            // default: 5
            default: Style.pixels(5)
            // default: Style.pixels(function(f, t, h) { return 2 * Math.pow(h.zoom, 0.5); })
            // default: function(f, t, h) { return 2 * h.zoom; }
        }
    }
    // places: {
    //     filter: function(f, t) { return (t.coords.z >= 13); },
    //     color: {
    //         // default: [0.0, 1.0, 1.0]
    //         default: function(f) { return f.properties.kind == 'administrative' ? [1, 0, 1] : [1, 1, 0]; }
    //     },
    //     size: {
    //         default: Style.pixels(5),
    //     }
    // }
}
