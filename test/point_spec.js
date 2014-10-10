import chai from 'chai';
let assert = chai.assert;

import Point from '../src/point';


describe('Point', () => {
    describe('.constructor()', () => {
        let subject;
        beforeEach(() => {
            subject = new Point(10, 10);
        });

        it('returns a instanceof', () => {
            assert.instanceOf(subject, Point);
        });
    });

    describe('Point.copy()', () => {
        it('');
    });
});
