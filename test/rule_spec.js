import chai from 'chai';
//let assert = chai.assert;
import {parseRules, matchFeature} from '../src/rule';
import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('Rules', () => {

    describe('Rule', () => {

        it('does something', () => {

            var ruleGroups = parseRules(sampleStyle);
            var feature = { layer: 'roads', 'kind': 'highway'};

            var matchedStyles = [];

            Object.keys(ruleGroups).forEach((_name) => {
                var ruleGroup = ruleGroups[_name];
                matchFeature(feature, ruleGroup.rules, matchedStyles);
            });

            console.log(matchedStyles.length);

        });

    });

});
