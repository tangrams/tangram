import chai from 'chai';
let assert = chai.assert;
import VertexLayout from '../src/gl/vertex_layout';
import VertexData from '../src/gl/vertex_data';
import gl from '../src/gl/constants';

describe('VertexLayout', () => {

    // Note: a_color is intentionally not a multiple of 4, to test padding
    let attribs =  [
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: gl.UNSIGNED_BYTE, normalized: true }, // should be padded to 4 bytes
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ];

    describe('.constructor(attribs)', () => {
        let subject;
        beforeEach(() => {
            subject = new VertexLayout(attribs);
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, VertexLayout);
        });
        it('calculates the right vertex stride', () => {
            assert.equal(subject.stride, 20);
        });
    });

    describe('.createVertexData()', () => {
        let subject;
        let vertex_data;

        beforeEach(() => {
            subject = new VertexLayout(attribs);
            vertex_data = subject.createVertexData();
        });

        it('creates a vertex data buffer', () => {
            assert.instanceOf(vertex_data, VertexData);
        });
    });

    // describe('.enable(gl, program)', () => {
    //     // TODO: what is the right way to test GL context creation and programs?

    //     it('enables the expected GL program attributes', () => {
    //         assert.instanceOf(subject, VertexLayout);
    //     });

    // });

});
