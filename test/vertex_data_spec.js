import chai from 'chai';
let assert = chai.assert;
import VertexLayout from '../src/gl/vertex_layout';
import VertexData from '../src/gl/vertex_data';
import gl from '../src/gl/constants';

describe('VertexData', () => {

    // Note: a_color is intentionally not a multiple of 4, to test padding
    let attribs =  [
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: gl.UNSIGNED_BYTE, normalized: true }, // should be padded to 4 bytes
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ];

    describe('.constructor(vertex_layout)', () => {
        let subject;
        let layout;

        beforeEach(() => {
            layout = new VertexLayout(attribs);
            subject = new VertexData(layout);
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, VertexData);
        });
        it('sets up buffer views', () => {
            assert.instanceOf(subject.buffer_views[gl.FLOAT], Float32Array);
            assert.instanceOf(subject.buffer_views[gl.UNSIGNED_BYTE], Uint8Array);
        });
    });

    describe('.addVertex(vertex)', () => {
        let subject;
        let layout;
        let vertex = [
            25, 50, 100,    // position
            255, 0, 0,      // color
            2               // layer
        ];

        beforeEach(() => {
            layout = new VertexLayout(attribs);
            subject = layout.createVertexData();
            subject.addVertex(vertex);
        });

        it('advances the buffer offset', () => {
            assert.equal(subject.buffer_offset, layout.stride);
        });
        it('sets a vertex attribute value in the buffer', () => {
            assert.equal(subject.buffer_views[gl.FLOAT][0], vertex[0]);
            assert.equal(subject.buffer_views[gl.FLOAT][1], vertex[1]);
            assert.equal(subject.buffer_views[gl.FLOAT][2], vertex[2]);
        });
    });

});
