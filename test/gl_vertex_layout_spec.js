import chai from 'chai';
let assert = chai.assert;
import GLVertexLayout from '../src/gl/gl_vertex_layout';
import {GLVertexData} from '../src/gl/gl_vertex_layout';
import gl from '../src/gl/gl_constants';

describe('GLVertexLayout', () => {

    // Note: a_color is intentionally not a multiple of 4, to test padding
    let attribs =  [
        { name: 'a_position', size: 3, type: gl.FLOAT, normalized: false },
        { name: 'a_color', size: 3, type: gl.UNSIGNED_BYTE, normalized: true }, // should be padded to 4 bytes
        { name: 'a_layer', size: 1, type: gl.FLOAT, normalized: false }
    ];

    describe('.constructor(attribs)', () => {
        let subject;
        beforeEach(() => {
            subject = new GLVertexLayout(attribs);
        });

        it('returns a new instance', () => {
            assert.instanceOf(subject, GLVertexLayout);
        });
        it('calculates the right vertex stride', () => {
            assert.equal(subject.stride, 20);
        });
    });

    describe('.createVertexData()', () => {
        let subject;
        let vertex_data;

        beforeEach(() => {
            subject = new GLVertexLayout(attribs);
            vertex_data = subject.createVertexData();
        });

        it('creates a vertex data buffer', () => {
            assert.instanceOf(vertex_data, GLVertexData);
        });
    });

    // describe('.enable(gl, program)', () => {
    //     // TODO: what is the right way to test GL context creation and programs?

    //     it('enables the expected GL program attributes', () => {
    //         assert.instanceOf(subject, GLVertexLayout);
    //     });

    // });

});
