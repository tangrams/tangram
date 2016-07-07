
export class RenderState {
	constructor (value, setup) {
        setup(value);
        this.value = value;
        this.setup = setup;
    }

    set (value) {
    	// if the states are different, call the GL context for a state change
    	if (JSON.stringify(this.value) !== JSON.stringify(value)) {
    		this.setup(value);
    		this.value = value;
    	}
    }
}

export default class RenderStateManager {

    constructor (gl) {
        this.defaults = {};

        // Culling
        this.defaults.culling = true;
        this.defaults.culling_face = gl.BACK;

        // Blending
        this.defaults.blending = false;
        this.defaults.blending_src = gl.ONE_MINUS_SRC_ALPHA;
        this.defaults.blending_dst = gl.ONE_MINUS_SRC_ALPHA;
        this.defaults.blending_src_alpha = gl.ONE;
        this.defaults.blending_dst_alpha = gl.ONE_MINUS_SRC_ALPHA;

        // Depth test/write
        this.defaults.depth_write = true;
        this.defaults.depth_test = true;
        gl.depthFunc(gl.LESS); // depth function only needs to be set once

    	// Culling
        this.culling = new RenderState(
            { cull: this.defaults.culling, face: this.defaults.culling_face },
    		(value) => {
    			if (value.cull) {
    				gl.enable(gl.CULL_FACE);
            		gl.cullFace(value.face);
    			} else {
    				gl.disable(gl.CULL_FACE);
    			}
    		}
    	);

    	// Blending mode
        this.blending = new RenderState({
                blend: this.defaults.blending,
                src: this.defaults.blending_src,
                dst: this.defaults.blending_dst,
                src_alpha: this.defaults.blending_src_alpha,
                dst_alpha: this.defaults.blending_dst_alpha
            },
            (value) => {
    			if (value.blend) {
            		gl.enable(gl.BLEND);

                    if (value.src_alpha && value.dst_alpha) {
                        gl.blendFuncSeparate(value.src, value.dst, value.src_alpha, value.dst_alpha);
                    }
                    else {
                        gl.blendFunc(value.src, value.dst);
                    }
    			} else {
    				gl.disable(gl.BLEND);
    			}
    		}
    	);

    	// Depth write
        this.depth_write = new RenderState(
            { depth_write: this.defaults.depth_write },
    		(value) => {
        		gl.depthMask(value.depth_write);
    		}
    	);

    	// Depth test
        this.depth_test = new RenderState(
            { depth_test: this.defaults.depth_test },
            (value) => {
    			if (value.depth_test) {
            		gl.enable(gl.DEPTH_TEST);
    			} else {
            		gl.disable(gl.DEPTH_TEST);
    			}
    		}
    	);

    }

}
