
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
        RenderState.defaults = {};
        // Culling
        RenderState.defaults.culling = true;
        RenderState.defaults.culling_face = gl.BACK;

        // Blending
        RenderState.defaults.blending = false;
        RenderState.defaults.blending_src = gl.ONE_MINUS_SRC_ALPHA;
        RenderState.defaults.blending_dst = gl.ONE_MINUS_SRC_ALPHA;
        RenderState.defaults.blending_src_alpha = gl.ONE;
        RenderState.defaults.blending_dst_alpha = gl.ONE_MINUS_SRC_ALPHA;

        // Depth test/write
        RenderState.defaults.depth_write = true;
        RenderState.defaults.depth_test = true;
        gl.depthFunc(gl.LESS); // depth function only needs to be set once

    	// Culling
    	RenderState.culling = new RenderState(
    		{ cull: RenderState.defaults.culling, face: RenderState.defaults.culling_face },
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
    	RenderState.blending = new RenderState({
                blend: RenderState.defaults.blending,
                src: RenderState.defaults.blending_src,
                dst: RenderState.defaults.blending_dst,
                src_alpha: RenderState.defaults.blending_src_alpha,
                dst_alpha: RenderState.defaults.blending_dst_alpha
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
    	RenderState.depth_write = new RenderState(
    		{ depth_write: RenderState.defaults.depth_write },
    		(value) => {
        		gl.depthMask(value.depth_write);
    		}
    	);

    	// Depth test
    	RenderState.depth_test = new RenderState(
            { depth_test: RenderState.defaults.depth_test },
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
