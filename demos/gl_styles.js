{
    modes: {
        'water': {
            extends: 'polygons',
            animated: true,
            shaders:{
                defines: {
                    EFFECT_NOISE_ANIMATED: true
                },
                transforms: {
                    globals: { url: 'demos/shaders/glsl-noise-periodic-3d.glsl' },
                    fragment: { url: 'demos/shaders/noise.glsl' }
                }
            }
        },
        'formica': {
            extends: 'polygons',
            shaders: {
                transforms: {
                    globals: { url: 'demos/shaders/glsl-noise-periodic-3d.glsl' },
                    fragment: { url: 'demos/shaders/noise.glsl' }
                }
            }
        },
        'popup': {
            extends: 'polygons',
            animated: true,
            shaders: {
                transforms: {
                    globals: { url: 'src/gl/shaders/modules/popup.glsl' },
                    vertex: [
                        { url: 'demos/shaders/elevator.glsl' },
                        { url: 'demos/shaders/popup.glsl' }
                    ],
                    fragment: { url: 'demos/shaders/color_bleed.glsl' }
                }
            }
        },
        'elevator': {
            extends: 'polygons',
            animated: true,
            shaders: {
                transforms: {
                    vertex: { url: 'demos/shaders/elevator.glsl' }
                }
            }
        },
        'explode': {
            extends: 'polygons',
            animated: true,
            shaders: {
                // defines: {
                //     EXPLODE_SCALE: 10
                // },
                uniforms: {
                    u_scale: 10
                },
                transforms: {
                    globals: 'uniform float u_scale;',
                    vertex: 'position.xy += a_normal.xy * u_scale * smoothstep(0.25, 1., abs(sin(u_time)));'
                    // vertex: { url: 'demos/shaders/explode.glsl' }
                }
            }
        },
        'dots': {
            extends: 'polygons',
            shaders: {
                uniforms: {
                    u_dot_grid_scale: 0.1 / 5,
                    u_dot_scale: 0.07,
                    u_dot_background_color: [.5, .2, .2],
                    u_dot_color: [1, 1, 1]
                },
                transforms: {
                    globals: { url: 'demos/shaders/dots.glsl' },
                    fragment: 'color *= dots(v_world_position.xyz);'
                    // fragment: 'vec3 n = abs(v_normal); if (n.z > n.x && n.z > n.y) { color *= dots(v_world_position.xyz); }' // apply only to up-facing surfaces
                }
            }
        },
        'wood': {
            extends: 'polygons',
            shaders: {
                uniforms: {
                    u_wood_color1: [.9, .5, .5],
                    u_wood_color2: [.3, .6, .8],
                    u_wood_eccentricity: .1,
                    u_wood_twist: .00002,
                    u_wood_scale: 50,
                    u_wood_spacing: 1
                },
                transforms: {
                    globals: { url: 'demos/shaders/wood.glsl' },
                    fragment: 'color = wood(v_world_position.xyz);'
                    // fragment: 'vec3 n = abs(v_normal); if (n.z > n.x && n.z > n.y) { color *= dots(v_world_position.xyz); }' // apply only to up-facing surfaces
                }
            }
        },
        'points': {
            shaders: {
                transforms: {
                    fragment: { url: 'demos/shaders/color_bleed.glsl' }
                }
            }
        },
        // 'polygons': {
        //     shaders: {
        //         vertex_url: 'src/gl/shaders/compiled/simple_polygon_vertex.glsl',
        //         fragment_url: 'src/gl/shaders/compiled/simple_polygon_fragment.glsl'
        //     }
        // }
    },
    layers: {
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
        water: {
            mode: {
                name: 'water'
            },
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
            mode: {
                // name: 'popup'
                // name: 'explode'
                // name: 'formica'
                // name: 'dots'
                // name: 'wood'
            },
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
            mode: {
                name: 'points'
                // name: 'formica'
            },
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
}
