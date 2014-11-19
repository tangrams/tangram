import chai from 'chai';
//let assert = chai.assert;
import {parseStylizers} from '../src/rules';
import sampleStyle from './fixtures/sample-style.json';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe.only('Rules', () => {

    describe('Rule', () => {

        it('does something', () => {
            var rules = parseStylizers(sampleStyle.stylizers);
            console.log(JSON.stringify(rules));
        });

    });

});
