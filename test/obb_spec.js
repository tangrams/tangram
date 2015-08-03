import chai from 'chai';
let assert = chai.assert;
import OBB from '../src/utils/obb.js';

describe('OBB', () => {

    describe('.intersect(obb) (aligned)', () => {
    	let obb1 = new OBB(1.0, 1.0, 0.0, 2.0, 2.0);
    	let obb2 = new OBB(2.0, 2.0, 0.0, 1.0, 1.0);
    	let obb3 = new OBB(2.5, 2.5, 0.0, 0.4, 0.4);

        it('test collision between oriented bounding boxes', () => {
            assert.isTrue(OBB.intersect(obb1, obb2));
            assert.isTrue(OBB.intersect(obb3, obb2));
            assert.isFalse(OBB.intersect(obb1, obb3));
        });
    });

    describe('.intersect(obb) (non-aligned)', () => {
    	let obb1 = new OBB(2.0, 2.0, Math.PI / 2.0, 1.0, 1.0);
    	let obb2 = new OBB(2.0, 2.0, 0.0, 2.0, 2.0);
    	let obb3 = new OBB(3.0, 3.0, Math.PI / 4.0, 3.0, 1.0);
    	let obb4 = new OBB(0.0, 0.0, Math.PI / 4.0, 0.5, 0.5);

        it('test collision between oriented bounding boxes', () => {
            assert.isTrue(OBB.intersect(obb1, obb2));
            assert.isTrue(OBB.intersect(obb3, obb2));
            assert.isTrue(OBB.intersect(obb4, obb3));
            assert.isFalse(OBB.intersect(obb4, obb1));
            assert.isFalse(OBB.intersect(obb4, obb2));
        });
    });

});
