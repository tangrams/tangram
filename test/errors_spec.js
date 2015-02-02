import chai from 'chai';
let assert = chai.assert;

import {MethodNotImplemented} from '../src/utils/errors';

describe('Errors', () => {

    describe('NotImplemented', () => {
        let subject;
        beforeEach(() => {
            subject = new MethodNotImplemented();
        });

        describe('.constructor()', () => {

            it('returns a new instance of a NotImplemented', () => {
                assert.instanceOf(subject, MethodNotImplemented);
            });

            it('returns a new instance of an Error', () => {
                assert.instanceOf(subject, Error);
            });
        });
    });
});
