// Style helpers
var Style = {};

Style.color = {
    pseudoRandomGrayscale: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
    pseudoRandomColor: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
    randomColor: function (f) { return [0.7 * Math.random(), 0.7 * Math.random(), 0.7 * Math.random()]; } // pseudo-random color by geometry id
};

Style.width = {
    pixels: function (p, t) { return p * VectorRenderer.units_per_pixel[t.coords.z]; },
    meters: function (p, t) { return p * VectorRenderer.units_per_meter[t.coords.z]; }
};

// Makeshift style-sheet
var gl_styles = {
    water_ocean: {
        color: {
            default: [0.5, 0.5, 0.875]
        }
    },
    land_areas: {
        color: {
            default: [0.175, 0.175, 0.175]
        }
    },
    land_usages: {
        color: {
            default: [0.5, 0.875, 0.5],
            'pitch': [0.3, 0.675, 0.3]
        }
    },
    water_areas: {
        color: {
            default: [0.5, 0.5, 0.875]
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
            // default: function (f, t) { return Style.width.pixels(5, t); }
            default: function (f, t) { return 2 * Math.log(t.coords.z) * VectorRenderer.units_per_meter[t.coords.z]; },
            'highway': function (f, t) { return 3 * Math.log(t.coords.z) * VectorRenderer.units_per_meter[t.coords.z]; },
            'major_road': function (f, t) { return 2.5 * Math.log(t.coords.z) * VectorRenderer.units_per_meter[t.coords.z]; },
            'minor_road': function (f, t) { return 2 * Math.log(t.coords.z) * VectorRenderer.units_per_meter[t.coords.z]; },
            'path': function (f, t) { return 1 * Math.log(t.coords.z) * VectorRenderer.units_per_meter[t.coords.z]; },
            'debug': function (f, t) { return 5 * VectorRenderer.units_per_meter[t.coords.z]; }
        }
    },
    buildings: {
        color: {
            // default: function(f) { var h = f.properties.height || 20; h = Math.min((h + 50) / 250, 1.0); return [h, h, h]; } //Style.color.pseudoRandomColor
            // default: Style.color.pseudoRandomColor
            default: function (f) { return (f.properties.name || f.properties.kind) ? [(f.properties.name && 0.6) || 0.2, 0.2, (f.properties.kind && 0.6) || 0.2] : [0.6, 0.6, 0.6]; }
        },
        extrude: {
            default: function (f, t) { return ((t.coords.z >= 15 && f.properties.height > 20) || t.coords.z >= 16) }
        }
    }
};

var canvas_styles = {
    default: [200, 200, 200], // background
    water: {
        color: {
            default: [25, 150, 220]
        }
    },
    land_unlabeled: {
        color: {
            default: [32, 200, 125]
        }
    },
    land_labeled: {
        color: {
            default: [2, 170, 95]
        }
    },
    buildings_unlabeled: {
        color: {
            default: [150, 150, 150]
        },
        border: {
            color: {
                default: [75, 75, 75]
            },
            size: {
                default: 1
            }
        }
    },
    buildings_labeled: {
        color: {
            default: [200, 150, 150]
        },
        border: {
            color: {
                default: [75, 75, 75]
            },
            size: {
                default: 1
            }
        }
    },
    roads: {
        color: {
            'highway': [0, 0, 0],
            'major_road': [100, 100, 100],
            'minor_road': [150, 150, 150],
            'path': [255, 255, 255],
            'rail': [0, 0, 0]
        },
        size: {
            'highway': 5,
            'major_road': 2.5,
            'minor_road': 1.5,
            'path': 0.5,
            'rail': 0.5
        },
        dash: {
            // 'rail': [4, 2]
        }
    },
    road_labels: {
        size: {
            default: 15
        }
    },
    pois: {
        color: {
            default: [240, 0, 0]
        },
        size: {
            default: 5
        },
        border: {
            color: {
                default: [240, 240, 240]
            },
            size: {
                default: 2
            }
        }
    }
};
