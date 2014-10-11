import chai from 'chai';
import {SceneWorker} from '../src/scene_worker';
let assert = chai.assert;

describe.skip('SceneWorker', () => {
    describe('.init(event)', () => {
        it('it is a object', () => {
            assert.isObject(SceneWorker);
        });
    });
    describe('.buildTile(event)', () => {});
    describe('.removeTile(event)', () => {});
    describe('.getFeatureSelection(event)', () => {});
    describe('.prepareForRebuild', () => {});
});
