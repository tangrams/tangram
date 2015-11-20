import chai from 'chai';
let assert = chai.assert;
import chaiAsPromised from 'chai-as-promised';
chai.use(chaiAsPromised);

import mergeObjects from '../src/utils/merge';

describe('mergeObjects', () => {

    let dest;

    beforeEach(() => {
        dest = {
            a: 5,
            b: 10,
            c: {
                x: 1, y: 2, z: 3
            },
            d: {
                e: {
                    x: 4, y: 5, z: 6
                }
            }
        };
    });

    describe('non-null source property', () => {

        let source = { a: 7 };

        it('overwrites previous destination property', () => {
            mergeObjects(dest, source);
            assert.equal(dest.a, 7);
        });

    });

    describe('null source property', () => {

        let source = { a: null };

        it('overwrites previous destination property', () => {
            mergeObjects(dest, source);
            assert.isNull(dest.a);
        });

    });

    describe('undefined source property', () => {

        let source = { a: undefined };

        it('does NOT overwrite previous destination property', () => {
            mergeObjects(dest, source);
            assert.equal(dest.a, 5);
        });

    });

    describe('array source property', () => {

        let source = { b: [1, 2, 3] };

        it('overwrites previous destination property', () => {
            mergeObjects(dest, source);
            assert.deepEqual(dest.b, [1, 2, 3]);
        });

    });

    describe('object source property', () => {

        let source = {
            c: { w: 4 }
        };

        it('merge with previous destination property', () => {
            mergeObjects(dest, source);
            assert.deepEqual(dest.c, { x: 1, y: 2, z: 3, w: 4});
        });

    });

    describe('nested source property', () => {

        let source = {
            d: {
                e: { w: 7 }, // new property second nested level
                f: 'x' // new property first nested level
            }
        };

        it('deep merges with previous destination property', () => {
            mergeObjects(dest, source);
            assert.deepEqual(dest.d, {
                e: { x: 4, y: 5, z: 6, w: 7 },
                f: 'x'
            });
        });

    });

    describe('multiple source objects', () => {

        let source1 = { a: 7, b: 3 };
        let source2 = { a: 10 };

        it('last source takes precedence', () => {
            mergeObjects(dest, source1, source2);
            assert.equal(dest.a, 10);   // from source2
            assert.equal(dest.b, 3);    // from source1
            assert.deepEqual(dest.c, { x: 1, y: 2, z: 3 }); // unmodified
        });

    });

});
