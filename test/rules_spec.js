import chai from 'chai';
//let assert = chai.assert;
import {parseLayers, walkRuleTree} from '../src/rules';
import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe.only('Rules', () => {

    describe('Rule', () => {

        it('does something', () => {

            var styles = parseLayers(sampleStyle);

            walkRuleTree(styles.roads.rules, (rule) => {
                console.log(JSON.stringify(rule));
            });


        });

    });

});
