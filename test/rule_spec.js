import chai from 'chai';
let assert = chai.assert;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('RuleLeaf', () => {
    const {RuleLeaf} = require('../src/styles/rule');

    it('returns an new instanceof', () => {
        let subject = new RuleLeaf({name: 'test'});
        assert.instanceOf(subject, RuleLeaf);
        assert.propertyVal(subject, 'name', 'test');
    });

});

describe('RuleGroup', () => {
    const {RuleTree} = require('../src/styles/rule');

    it('returns an new instanceof', () => {
        let subject = new RuleTree({name: 'test'});
        assert.instanceOf(subject, RuleTree);
        assert.propertyVal(subject, 'name', 'test');
    });
});

describe('.mergeTrees()', () => {
    let subject = [
        [ { a: 0.001 }, { b: 2 }, { c: 3 }, { d: 4 } ],
        [ { a: 3.14 }, { d: 3 }, { a: 1 }, { b: 2 }],
        [ { b: 'y' }, { a: 'x' }, { b: 0.0003 }, { c: 10 }],
        [ { b: 3.14 }, { a: 2.71828 }, { b: 0.0001 }, { d: 'x' }]
    ];

    const {mergeTrees} = require('../src/styles/rule');

    describe('when given an array of arrays to merged', () => {

        it('returns a single object', () => {
            let result = mergeTrees(subject);
            assert.deepEqual(result, {
                visible: true,
                a: 1,
                b: 2,
                c: 10,
                d: 'x'
            });
        });
    });

    describe('when given a array that is similar to real data', () => {
        const parent = {
            "width": 10,
            "order": 1,
            "color": [1, 2, 3],
            "a": "x"
        };

        const subject = [
            [
                parent,
                {
                    "order": 3,
                    "a": "y"
                }
            ],
            [
                parent,
                {
                    "order": 1,
                    "b": "z",
                    "color": [7, 8, 9]
                }
            ]
        ];

        it('returns the correct object', () => {
            assert.deepEqual(mergeTrees(subject), {
                visible: true,
                width: 10,
                order: 5,
                a: 'y',
                b: 'z',
                color: [7, 8, 9]
            });
        });

    });

});

describe('.parseRules(rules)', () => {

    const {parseRules, walkDown}= require('../src/styles/rule');
    const ruleTree   = require('./fixtures/sample-style');

    describe('when given a raw ruleTree', () => {

        it('returns a RuleGroup', () => {
            assert.instanceOf(parseRules(ruleTree), Object);
        });

        it('returns the correct number of children rules', () => {
            let tree = parseRules(ruleTree).root;
            let number = 0;

            walkDown(tree, (rule) => {
                number += 1;
            });
            assert.equal(number, 4);
        });
    });
});


describe('.groupProps()', () => {
    let {groupProps} = require('../src/styles/rule');

    describe('given an object ', () => {
        let subject = {
            style: { a: 1 },
            filter: 'I am a filter',
            a: 'b',
            b: 'c'
        };

        it('groups the properties by white listing', () => {
            assert.deepEqual(groupProps(subject),
                [
                    {
                        style: { a: 1 },
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

describe('.calculateStyle()', () => {
    const {calculateStyle} = require('../src/styles/rule');


    let b = {
        calculatedStyle: [
            { a: true },
            { b: true }
        ]
    };

    let c = {
        parent: b,
        style: {
            c: true
        }
    };

    it('calculates a rules inherited style', () => {
        assert.deepEqual(
            calculateStyle(c),
            [{ a: true }, { b: true }, { c: true }]
        );
    });
});


describe('RuleTree.findMatchingRules(context)', () => {
    let subject;
    const {parseRules} = require('../src/styles/rule');
    const {RuleTree}   = require('../src/styles/rule');

    beforeEach(() => {
        subject = parseRules(
            {
                root: {
                    filter: {
                        kind: 'highway'
                    },
                    style: {
                        width: 10,
                        color: [1, 2, 3]
                    },
                    fillA: {
                        filter: {
                            name: 'FDR'
                        },
                        style: {
                            order: 1,
                            color: [3.14, 3.14, 3.14]
                        },
                        a: {
                            filter: {
                                name: 'FDR'
                            },
                            style: {
                                width: 20,
                                color: [2.71828, 2.71828, 2.71828]
                            }
                        }
                    },
                    roads: {
                        filter: {
                            '$zoom': { min: 3}
                        },
                        style: {
                            width: 10,
                            color: [7, 8, 9]
                        },
                        fillB: {
                            filter: {
                                id: 10
                             },
                            style: {
                                color: [10, 11, 12]
                            },
                            b: {
                                filter: {
                                    id: 10
                                },
                                style: {
                                    color: [1, 2, 3]
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

    describe('when the context matches and we ask to merge the sibling rules', () => {
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
            let rule = subject.root.findMatchingRules(context);
            assert.deepEqual(
                rule,
                {
                    color: [1, 2, 3],
                    visible: true,
                    width: 20,
                    order: 1,
                }
            );
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

        it('returns the correct number of matching rules', () => {
            let rule = subject.root.findMatchingRules(context);
            assert.deepEqual(rule, {
                color: [1, 2, 3],
                order: 1,
                visible: true,
                width: 20
            });
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
            const rule = subject.root.findMatchingRules(context);
            assert.isUndefined(rule);
        });
    });


    describe('parseRules', () => {

        it('returns a tree', () => {
            let subject = parseRules({
                root: {
                    filter: {
                        id: 10
                    },
                    style: {
                        color: [3.14, 3.14, 3.14]
                    }
                }
            });
            assert.instanceOf(subject.root, RuleTree);
        });

        describe('when there no style on the parent', () => {
            let subject = parseRules({
                root: {
                    filter: {
                        name: 'ivan'
                    },
                    a: {
                        filter: {
                            id: 10
                        },
                        style: {
                            color: [1, 2, 3]
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

            it('returns only the child\'s style', () => {
                let results = subject.root.findMatchingRules(context);

                assert.deepEqual(results, {
                    color: [1, 2, 3],
                    visible: true
                });

            });

        });

    });

});


