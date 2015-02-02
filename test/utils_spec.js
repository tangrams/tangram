import chai from 'chai';
let assert = chai.assert;
import Utils from '../src/utils/utils';
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

describe('Utils', () => {

    describe('io', () => {
        let subject = Utils.io,
            xhr,
            request;
        beforeEach(() => {
            xhr = sinon.useFakeXMLHttpRequest();
            xhr.onCreate = (x) => {
                request = x;
            };
        });
        afterEach(() => {
            xhr.restore();
        });
        describe('when there is not an error', () => {
            it('calls back with an event', (done) => {
                assert.isFulfilled(subject('http://url')).notify(done);
                request.respond(200);
            });
            it('calls back with the response', (done) => {
                assert.eventually.equal(subject('http://url'), 'response body').notify(done);
                request.respond(200, {}, 'response body');
            });
        });
        describe('when there is an error', () => {
            it('calls the reject method', (done) => {
                assert.isRejected(subject('http://url'), Error).notify(done);
                request.respond(404);
            });
        });
    });

    // describe('.serializeWithFunctions(obj)', () => {});
    // describe('.deserializeWithFunctions(serialized)', () => {});
    // describe('.stringsToFunctions(obj)', () => {});

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
