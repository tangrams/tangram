
export default class RenderState {
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

    static initialize (gl) {
    	// Culling
    	RenderState.culling = new RenderState(
    		{ cull: true, face: gl.BACK },
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
    	RenderState.blending = new RenderState(
            { blend: false, src: gl.SRC_ALPHA, dst: gl.ONE_MINUS_SRC_ALPHA, src_alpha: gl.ONE, dst_alpha: gl.ONE_MINUS_SRC_ALPHA },
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
    	RenderState.depth_write = new RenderState(
    		{ depth_write: true },
    		(value) => {
        		gl.depthMask(value.depth_write);
    		}
    	);

    	// Depth test
    	RenderState.depth_test = new RenderState(
    		{ depth_test: true, depth_func: gl.LEQUAL },
    		(value) => {
    			if (value.depth_test) {
            		gl.enable(gl.DEPTH_TEST);
        			gl.depthFunc(value.depth_func);
    			} else {
            		gl.disable(gl.DEPTH_TEST);
    			}
    		}
    	);
    }
}
