import chai from 'chai';
let assert = chai.assert;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('LayerLeaf', () => {
    const {LayerLeaf} = require('../src/styles/layer');

    it('returns an new instanceof', () => {
        let subject = new LayerLeaf({name: 'test'});
        assert.instanceOf(subject, LayerLeaf);
        assert.propertyVal(subject, 'name', 'test');
    });

});

describe('LayerTree', () => {
    const {LayerTree} = require('../src/styles/layer');

    it('returns an new instanceof', () => {
        let subject = new LayerTree({name: 'test'});
        assert.instanceOf(subject, LayerTree);
        assert.propertyVal(subject, 'name', 'test');
    });
});

describe('.mergeTrees()', () => {
    let subject = [
        [ { group: { a: 0.001 } }, { group: { a: 1, b: 2 } }, { group: { b: 4, c: 3 } }, { group: { d: 4 } } ],
        [ { group: { x: 3.14 } }, { group: { y: 3 } }, { group: { x: 10, z: 1 } }, { group: { w: 2 } } ],
        [ { group: { e: 'y' } }, { group: { f: 'x' } }, { group:{ g: 0.0003 } }, { group: { h: 10 } } ],
        [ { group: { s: 3.14 } }, { group: { t: 2.71828 } }, { group:{ u: 0.0001 } }, { group: { v: 'x' } } ]
    ];

    const {mergeTrees} = require('../src/styles/layer');

    describe('when given an array of arrays to merged', () => {

        it('returns a single object', () => {
            let result = mergeTrees(subject, 'group', {});
            let compare = {
                visible: true,
                a: 1, b: 4, c: 3, d: 4,
                x: 10, y: 3, z: 1, w: 2,
                e: 'y', f: 'x', g: 0.0003, h: 10,
                s: 3.14, t: 2.71828, u: 0.0001, v: 'x'
            };
            assert.deepEqual(result, compare);
        });
    });

    describe('when given a array that is similar to real data', () => {
        const parent = {
            group: {
                "width": 10,
                "order": 1,
                "color": [1, 2, 3],
                "a": "x"
            }
        };

        const subject = [
            [
                parent,
                {
                    group: {
                        "order": 3,
                        "a": "y"
                    }
                }
            ],
            [
                parent,
                {
                    group: {
                        "b": "z",
                        "color": [7, 8, 9]
                    }
                }
            ]
        ];

        it('returns the correct object', () => {
            let result = mergeTrees(subject, 'group');
            let compare = {
                visible: true,
                width: 10,
                order: 3,
                a: 'y',
                b: 'z',
                color: [7, 8, 9]
            };
            assert.deepEqual(result, compare);
        });

    });

    describe('when given layers with ambiguous properties', () => {

        const subject = [
            [ { group: { a: 1, layer_name: 'x' } } ],
            [ { group: { a: 2, layer_name: 'z' } } ],
            [ { group: { a: 3, layer_name: 'y' } } ]
        ];

        it('the lexically sorted highest layer wins', () => {
            let result = mergeTrees(subject, 'group');
            let compare = {
                a: 2,
                visible: true
            };
            assert.deepEqual(result, compare);
        });

    });

});

describe('.parseLayer(layers)', () => {

    const {parseLayers}= require('../src/styles/layer');
    const LayerTree   = require('./fixtures/sample-style');

    describe('when given a raw LayerTree', () => {

        it('returns a LayerTree', () => {
            assert.instanceOf(parseLayers(LayerTree), Object);
        });

        it('returns the correct number of children layers', () => {
            let tree = parseLayers(LayerTree).root;
            let children = 0;

            function walkDown (layer) {
                if (layer.layers) {
                    layer.layers.forEach((r) => {
                        walkDown(r);
                    });
                }
                children++;
            }
            walkDown(tree);

            assert.equal(children, 4);
        });
    });
});


describe('.groupProps()', () => {
    let {groupProps} = require('../src/styles/layer');

    describe('given an object ', () => {
        let subject = {
            draw: { group: { a: 1 } },
            filter: 'I am a filter',
            a: 'b',
            b: 'c'
        };

        it('groups the properties by white listing', () => {
            assert.deepEqual(groupProps(subject),
                [
                    {
                        draw: { group: { a: 1 } },
                        filter: 'I am a filter'
                    },
                    {
                        a: 'b',
                        b: 'c'
                    }
                ]);
        });
    });
});

describe('.calculateDraw()', () => {
    const {calculateDraw} = require('../src/styles/layer');


    let b = {
        calculatedDraw: [
            { group: { a: true } },
            { group: { b: true } }
        ]
    };

    let c = {
        parent: b,
        draw: {
            group: {
                c: true
            }
        }
    };

    it('calculates a layers inherited draw group', () => {
        assert.deepEqual(
            calculateDraw(c),
            [{ group: { a: true } }, { group: { b: true } }, { group: { c: true } }]
        );
    });
});


describe('LayerTree.buildDrawGroups(context)', () => {
    let subject;
    const {parseLayers} = require('../src/styles/layer');
    const {LayerTree}   = require('../src/styles/layer');

    beforeEach(() => {
        subject = parseLayers(
            {
                root: {
                    filter: {
                        kind: 'highway'
                    },
                    draw: {
                        group: {
                            width: 10,
                            color: [1, 2, 3]
                        }
                    },
                    fillA: {
                        filter: {
                            name: 'FDR'
                        },
                        draw: {
                            group: {
                                order: 1,
                                color: [3.14, 3.14, 3.14]
                            }
                        },
                        a: {
                            filter: {
                                name: 'FDR'
                            },
                            draw: {
                                group: {
                                    width: 20,
                                    color: [2.71828, 2.71828, 2.71828]
                                }
                            }
                        }
                    },
                    roads: {
                        filter: {
                            '$zoom': { min: 3}
                        },
                        draw: {
                            group: {
                                width: 10,
                                color: [7, 8, 9]
                            }
                        },
                        fillB: {
                            filter: {
                                id: 10
                             },
                            draw: {
                                group: {
                                    color: [10, 11, 12]
                                }
                            },
                            b: {
                                filter: {
                                    id: 10
                                },
                                draw: {
                                    group: {
                                        color: [1, 2, 3]
                                    }
                                }
                            }

                        },
                    }

                }
            }
        );
    });

    afterEach(() => {
        subject = null;
    });

    describe('when the context matches and we ask to merge the sibling layers', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'highway',
                    name: 'FDR',
                    id: 10
                }
            },
            zoom: 3
        };

        it('returns a single object', () => {
            let layer = subject.root.buildDrawGroups(context);
            assert.equal(Object.keys(layer).length, 1);
            assert.deepEqual(layer.group.color, [1, 2, 3]);
            assert.equal(layer.group.width, 20);
            assert.equal(layer.group.order, 1);
        });
    });

    describe('when the feature is a highway and is named FDR', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'highway',
                    name: 'FDR',
                    id: 10
                }
            },
            zoom: 3
        };

        it('returns the correct number of matching layers', () => {
            let layer = subject.root.buildDrawGroups(context);
            assert.equal(Object.keys(layer).length, 1);
            assert.deepEqual(layer.group.color, [1, 2, 3]);
            assert.equal(layer.group.width, 20);
            assert.equal(layer.group.order, 1);
        });
    });

    describe('when the feature is not a road', () => {
        let context = {
            feature: {
                properties: {
                    kind: 'aeroway'
                }
            }
        };

        it('returns undefined', () => {
            const layer = subject.root.buildDrawGroups(context);
            assert.isUndefined(layer);
        });
    });


    describe('parseLayers', () => {

        it('returns a tree', () => {
            let subject = parseLayers({
                root: {
                    filter: {
                        id: 10
                    },
                    draw: {
                        group: {
                            color: [3.14, 3.14, 3.14]
                        }
                    }
                }
            });
            assert.instanceOf(subject.root, LayerTree);
        });

        describe('when there no draw groups on the parent', () => {
            let subject = parseLayers({
                root: {
                    filter: {
                        name: 'ivan'
                    },
                    a: {
                        filter: {
                            id: 10
                        },
                        draw: {
                            group: {
                                color: [1, 2, 3]
                            }
                        }
                    }
                }
            });
            let context = {
                feature: {
                    properties: {
                        name: 'ivan',
                        id: 10
                    }
                }
            };

            it('returns only the child\'s draw', () => {
                let layer = subject.root.buildDrawGroups(context);
                assert.equal(Object.keys(layer).length, 1);
                assert.deepEqual(layer.group.color, [1, 2, 3]);
            });

        });

    });

});
