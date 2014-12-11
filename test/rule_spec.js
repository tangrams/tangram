import chai from 'chai';
let assert = chai.assert;
import {parseRules, matchFeature, groupProperties, cloneStyle} from '../src/rule';
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
            it('returns 3 rule objects', () => {

                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 3);
            });
        });

        describe.skip('when given a feature that is not a road', () => {
            let feature = { layer: 'earth' };
            it('returns an empty array of rules', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                //assert.lengthOf(matchedRules, 0);
            });
        });

        describe.skip('when there is only one matching filter', () => {
            let feature = { layer: 'roads', kind: 'not-highway' };
            it('returns an array with a single rule', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 1);
                //assert.deepEqual(matchedRules[0], { 'type': 'polygon', 'color': [1, 1, 1], 'width': 5 });
            });
        });

        describe.skip('when given a feature that is a road and a bridge', () => {
            let feature = { layer: 'roads', bridge: true, name: 'Brooklyn', kind: 'highway' };
            it('returns an array of three rules', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 3);
                //assert.deepEqual(matchedRules[0], {'type':'polygon', 'color':[1,1,0], 'width':10 });
            });
        });
    });


});
