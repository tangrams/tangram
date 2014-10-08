import chai from 'chai';
let assert = chai.assert;

import {NotImplemented} from '../src/errors';

describe('Errors', () => {

    describe('NotImplemented', () => {
        let subject;
        beforeEach(() => {
            subject = new NotImplemented();
        });

        describe('.constructor()', () => {

            it('returns a new instance of a NotImplemented', () => {
                assert.instanceOf(subject, NotImplemented);
            });

            it('returns a new instance of an Error', () => {
                assert.instanceOf(subject, Error);
            });
        });
    });
});
