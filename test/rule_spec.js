import chai from 'chai';
let assert = chai.assert;
import {
    parseRules,
    matchFeature,
    groupProperties,
    mergeStyles,
    calculateStyle,
    cloneStyle
} from '../src/rule';

import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('Rules', () => {

    describe('groupProperties({})', () => {
        let style = { filter: 'is()', style: {}, fill: {}, outline: {} };
        describe('given a object of white listed and none white listed values', () => {
            it('returns the white listed properties', () => {
                let [whiteListed, notWhiteListed] = groupProperties(style);
                assert.deepEqual(whiteListed, { filter: 'is()', style: {} });
                assert.deepEqual(notWhiteListed, [ 'fill', 'outline' ]);
            });
        });
    });

    describe('.cloneStyle()', () => {
        let styles = [
            {
                'key': { 'thing': 'value3' }
            },

            {
                'key': {
                    'key2': {
                        'key3': 'value1'
                    }
                }
            },

            {
                'key': {
                    'key2': {
                        'key4': 'value2'
                    }
                }
            }

        ];

        it('when given an object with nested properties', () => {
            assert.deepEqual(
                cloneStyle({}, styles),
                {
                    'key': {
                        'thing': 'value3',
                        'key2': {
                            'key3': 'value1',
                            'key4': 'value2'
                        }
                    }
                }
            );
        });

    });

    describe('.mergeStyles()', () => {

        let subject;

        beforeEach(() => {
            subject = mergeStyles([
                {
                    order: 1,
                    color: 'red'
                },
                undefined,
                {
                    order: 2,
                    color: 'blue'
                },
                null,
                false,
                '',
                {
                    order: 3,
                    width: 10
                }
            ]);
        });

        afterEach(() => {
            subject = undefined;
        });

        describe('when given a array of rules', () => {
            it('filters styles that are falsely', () => {
                assert.deepEqual(subject, {
                    order: 6,
                    width: 10,
                    visible: true,
                    color: 'blue'
                });
            });
        });
    });

    describe('.calculateStyle(rule, styles = [])', () => {
        let subject;
        let a = {
            name: 'a',
            style: {'a': 1, 'b': 2, 'c': 3},
            properties: {'1': 'a', '3': 'z'}
        };

        let b = {
            parent: a,
            name: 'b',
            style: {'a': 4, 'b': 5, 'c': 6},
            properties: {'2': 'c', '1': 'b'}
        };

        let c = {
            parent: b,
            name: 'c',
            style: {'a': 7, 'b': 8, 'c': 9},
            properties: {'1': 'd', '2': 'e'}
        };

        beforeEach(() => {
            subject = calculateStyle(c);
        });
        afterEach(() => {
            subject = undefined;
        });

        it('returns an array with a length of 3', () => {
            assert.lengthOf(subject, 3);
        });

        it('returns the first rule, which is a', () => {
            assert.propertyVal(subject[0], 'name', 'a');
        });

        it('returns the last rule, which is c', () => {
            assert.propertyVal(subject[2], 'name', 'c');
        });
    });

    describe('.matchFeature(feature)', () => {
        let matchedRules = [];

        let ruleGroups = parseRules(sampleStyle);

        afterEach(() => {
            matchedRules = [];
        });

        describe('when given a features that is a road and a highway', () => {
            let feature = { properties: { layer: 'roads', kind: 'highway' } };
            let context = { feature };
            it('returns 3 rule objects', () => {
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 3);
            });
        });

        describe('when given a feature that is not a road', () => {
            let feature = { properties: { layer: 'earth' } };
            let context = { feature };
            it('returns an empty array of rules', () => {
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 0);
            });
        });

        describe('when there is only one matching filter', () => {
            let feature = { properties: { layer: 'roads', kind: 'not-highway' } };
            let context = { feature };
            it('returns an array with a single rule', () => {
                let rule;
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                rule = matchedRules[0];
                assert.lengthOf(matchedRules, 1);
                assert.propertyVal(rule, 'name', 'more-roads');
                assert.propertyVal(rule, 'type', 'polygon');
                assert.propertyVal(rule, 'visible', true);
                assert.propertyVal(rule, 'order', 0);
                assert.propertyVal(rule, 'width', 5);

            });
        });

        describe('when given a feature that is a road and a bridge', () => {
            let feature = { properties: { layer: 'roads', bridge: true, name: 'Brooklyn', kind: 'highway' } };
            let context = { feature };
            it('returns an array of three rules', () => {
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                let first = matchedRules[0];
                assert.lengthOf(matchedRules, 3);
                assert.propertyVal(first, 'name', 'fill');
                assert.propertyVal(first, 'type', 'polygon');
                assert.propertyVal(first, 'width', 10);

                let last = matchedRules[2];
                assert.propertyVal(last, 'type', 'polygon');
                assert.propertyVal(last, 'name', 'more-roads');
            });
        });
    });


});
