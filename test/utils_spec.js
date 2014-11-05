import chai from 'chai';
let assert = chai.assert;

import Utils from '../src/utils';

describe('Utils', () => {
    describe('.serializeWithFunctions(obj)', () => {});
    describe('.deserializeWithFunctions(serialized)', () => {});
    describe('.stringsToFunctions(obj)', () => {});
    describe('.inMainThread(block)', () => {});
    describe('.inWorkerThread(block, err)', () => {});

    describe('.isPowerOf2(value)', () => {
        let subject = Utils.isPowerOf2;
        describe('when given a value of that is a power of 2', () => {
            it('returns true', () => {
                assert.isTrue(subject(2));
            });
        });

        describe('when given a value that is not a power of 2', () => {
            it('returns false', () => {
                assert.isFalse(subject(3));
            });
        });
    });
});
