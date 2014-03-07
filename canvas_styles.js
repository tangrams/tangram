{
    default: [200/255, 200/255, 200/255], // background
    water: {
        color: {
            default: [25/255, 150/255, 220/255]
        }
    },
    land_unlabeled: {
        color: {
            default: [32/255, 200/255, 125/255]
        }
    },
    land_labeled: {
        color: {
            default: [2/255, 170/255, 95/255]
        }
    },
    buildings_unlabeled: {
        color: {
            default: [150/255, 150/255, 150/255]
        },
        outline: {
            color: {
                default: [75/255, 75/255, 75/255]
            },
            width: {
                default: 1
            }
        }
    },
    buildings_labeled: {
        color: {
            default: [200/255, 150/255, 150/255]
        },
        outline: {
            color: {
                default: [75/255, 75/255, 75/255]
            },
            width: {
                default: 1
            }
        }
    },
    roads: {
        color: {
            'highway': [0, 0, 0],
            'major_road': [100/255, 100/255, 100/255],
            'minor_road': [150/255, 150/255, 150/255],
            'path': [255/255, 255/255, 255/255],
            'rail': [0, 0, 0]
        },
        width: {
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
        width: {
            default: 15
        }
    },
    pois: {
        color: {
            default: [240/255, 0, 0]
        },
        size: {
            default: 5
        },
        outline: {
            color: {
                default: [240/255, 240/255, 240/255]
            },
            width: {
                default: 2
            }
        }
    }
}
