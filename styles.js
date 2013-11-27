// Makeshift style-sheet
var gl_styles = {
    water_ocean: {
        color: {
            default: [0.5, 0.5, 0.875]
        }
    },
    land: {
        color: {
            default: [0.5, 0.875, 0.5]
        }
    },
    water_areas: {
        color: {
            default: [0.5, 0.5, 0.875]
        }
    },
    roads: {
        color: {
            default: [0.4, 0.4, 0.4],
            'highway': [1.0, 1.0, 1.0],
            'major_road': [0.6, 0.6, 0.6],
            // 'minor_road': [1.0, 0, 0],
            'path': [0.8, 0.8, 0.8],
            'rail': [0.5, 0.0, 0.0]
        }
    },
    buildings: {
        color: {
            // default: [0.6, 0.6, 0.6]
            // default: function (f) { var c = Math.max((parseInt(f.id, 16) % 100) / 100, 0.4); return [0.7 * c, 0.7 * c, 0.7 * c]; }, // pseudo-random grayscale by geometry id
            default: function (f) { return [0.7 * (parseInt(f.id, 16) / 100 % 1), 0.7 * (parseInt(f.id, 16) / 10000 % 1), 0.7 * (parseInt(f.id, 16) / 1000000 % 1)]; }, // pseudo-random color by geometry id
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
        // border: {
        //     color: {
        //         default: [255, 255, 255]
        //     },
        //     size: {
        //         default: 1
        //     }
        // }
    },
    buildings: {
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
