import chai from 'chai';
let assert = chai.assert;
import {parseRules, matchFeature, groupProperties} from '../src/rule';
import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe.only('Rules', () => {

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



    describe('Rule', () => {
        let matchedRules = [];
        let ruleGroups = parseRules(sampleStyle);

        afterEach(() => {
            matchedRules = [];
        });


        describe('when given a features that is a road and a highway', () => {
            let feature = { layer: 'roads', kind: 'highway' };
            it('returns 3 rule objects', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 2);
                assert.deepEqual(matchedRules[0], { 'type': 'polygon', 'width': 10, 'color': [1, 1, 0] });
            });
        });


        describe('when given a feature that is not a road', () => {
            let feature = { layer: 'earth' };
            it('returns an empty array of rules', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 0);
            });
        });

        describe('when there is only one matching filter', () => {
            let feature = { layer: 'roads', kind: 'not-highway' };

            it('returns an array with a single rule', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 1);
                assert.deepEqual(matchedRules[0], { 'type': 'polygon', 'color': [1, 1, 1], 'width': 5 });
            });
        });

        describe('when given a feature that is a road and a bridge', () => {
            let feature = { layer: 'roads', bridge: true, name: 'Brooklyn', kind: 'highway' };

            it('returns an array of three rules', () => {
                matchFeature(feature, ruleGroups.roads.rules, matchedRules);
                assert.lengthOf(matchedRules, 3);
                assert.deepEqual(matchedRules[0], {'type':'polygon', 'color':[1,1,0], 'width':10 });
            });

        });
    });


});
