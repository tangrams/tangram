import chai from 'chai';
let assert = chai.assert;
import {parseLayers, matchFeature} from '../src/rule';
import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe.only('Rules', () => {

    describe('Rule', () => {

        it('does something', () => {

            var ruleGroups = parseLayers(sampleStyle);
            var rule = ruleGroups.earth.rules[0];

            var feature = { layer: 'roads', 'kind': 'highway'};

            var matchedStyles = [];

            Object.keys(ruleGroups).forEach((_name) => {
                var ruleGroup = ruleGroups[_name];
                matchFeature(feature, ruleGroup.rules, 0, matchedStyles);
            });

            console.log(matchedStyles);
            assert.isFunction(rule.filter);
            console.log(ruleGroups, rule);

        });

    });

});
