import chai from 'chai';
let assert = chai.assert;
import {parseRules, matchFeature, groupProperties, cloneStyle} from '../src/styles/rule';
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
        let target = {};
        let sample = [
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
                cloneStyle(target, sample),
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
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 1);
                assert.deepEqual(matchedRules[0], {
                    'type': 'polygon',
                    'visible': true,
                    'order': 0,
                    'color': [1, 0, 1],
                    'width': 5,
                    'outline': {
                        'color': [0.7, 0.7, 0.7],
                        'width': 10
                    }
                });
            });
        });

        describe('when given a feature that is a road and a bridge', () => {
            let feature = { properties: { layer: 'roads', bridge: true, name: 'Brooklyn', kind: 'highway' } };
            let context = { feature };
            it('returns an array of three rules', () => {
                matchFeature(context, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 3);
                // NOTE: don't think it's safe to assume the first matching rule will match the first
                // one top-to-bottom in the stylesheet - in practice it often is, but order isn't guaranteed
                assert.deepEqual(matchedRules[0], {
                    'type': 'polygon',
                    'visible': true,
                    'order': 0,
                    'color': [1, 1, 1],
                    'width': 10,
                    'outline': {
                        'color': [0.7, 0.7, 0.7],
                        'width': 10
                    }
                });
            });
        });
    });


});
