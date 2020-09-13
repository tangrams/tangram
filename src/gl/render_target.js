import Texture from './texture';
import ShaderProgram from './shader_program';

let id = 0;

export default class RenderTarget {

    constructor (gl, { size, depth = true, stencil = true } = {}) {
        this.id = id++;
        this.gl = gl;
        this.depth = depth;
        this.stencil = stencil;
        this.resize(size);
    }

    initialized () {
        return this.fbo != null;
    }

    init () {
        if (this.initialized()) {
            return; // already initialized
        }

        // Frame buffer
        this.fbo = this.gl.createFramebuffer();
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);

        // Texture for the FBO color attachment
        this.fbo_texture = Texture.create(this.gl, `__render_target_fbo_${this.id}`, { filtering: 'nearest' });
        this.fbo_texture.setData(this.size.width, this.size.height, null, { filtering: 'nearest' });
        this.gl.framebufferTexture2D(this.gl.FRAMEBUFFER, this.gl.COLOR_ATTACHMENT0, this.gl.TEXTURE_2D, this.fbo_texture.texture, 0);

        // Renderbuffer for the FBO depth/stencil attachment
        if (this.depth) {
            this.fbo_depth_rb = this.gl.createRenderbuffer();
            this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);

            if (this.stencil) { // NOTE: stencil buffer requires shared depth buffer
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_STENCIL, this.size.width, this.size.height);
                this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_STENCIL_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);
            }
            else {
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, this.gl.DEPTH_COMPONENT16, this.size.width, this.size.height);
                this.gl.framebufferRenderbuffer(this.gl.FRAMEBUFFER, this.gl.DEPTH_ATTACHMENT, this.gl.RENDERBUFFER, this.fbo_depth_rb);
            }
        }

        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);

        this.initBlit();
    }

    initBlit () {
        this.blit_program = new ShaderProgram(
            this.gl,
            // vertex shader
            `
                attribute vec3 a_position;

                void main() {
                    gl_Position = vec4(a_position, 1.0);
                }
            `,
            // fragment shader
            `
                uniform sampler2D u_texture;
                uniform vec2 u_resolution;

                void main() {
                    vec2 position = gl_FragCoord.xy / u_resolution; // scale coords to [0.0, 1.0]
                    gl_FragColor = texture2D(u_texture, position);
                }
            `
        );
        this.blit_program.compile();
        this.blit_buffer = createQuadBuffer(this.gl);

        const vertex_position = this.gl.getAttribLocation(this.blit_program.program, 'a_position');
        this.gl.enableVertexAttribArray(vertex_position);
        this.gl.vertexAttribPointer(vertex_position, 2, this.gl.FLOAT, false, 0, 0);
    }

    destroy () {
        if (!this.gl) {
            return;
        }

        if (this.fbo) {
            this.gl.deleteFramebuffer(this.fbo);
            this.fbo = null;
            this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, null);
        }

        if (this.fbo_texture) {
            this.fbo_texture.destroy();
            this.fbo_texture = null;
        }

        if (this.fbo_depth_rb) {
            this.gl.createRenderbuffer(this.fbo_depth_rb);
            this.fbo_depth_rb = null;
        }
    }

    complete() {
        return this.gl.checkFramebufferStatus(this.gl.FRAMEBUFFER) === this.gl.FRAMEBUFFER_COMPLETE;
    }

    resize (size = {}) {
        if (this.size?.width === size.width && this.size.height === size.height) {
            return;
        }

        if (size.width == null || size.height == null || size.width === 0 || size.height === 0) {
            return;
        }

        this.size = { width: size.width, height: size.height };

        if (!this.initialized()) {
            this.init();
        }
        else {
            if (this.fbo_texture) {
                this.fbo_texture.setData(this.size.width, this.size.height, null, { filtering: 'nearest' });
            }

            if (this.fbo_depth_rb) {
                const format = this.stencil ? this.gl.DEPTH_STENCIL : this.gl.DEPTH_COMPONENT16;
                this.gl.bindRenderbuffer(this.gl.RENDERBUFFER, this.fbo_depth_rb);
                this.gl.renderbufferStorage(this.gl.RENDERBUFFER, format, this.size.width, this.size.height);
            }
        }
    }

    bind () {
        if (!this.initialized()) {
            return;
        }

        // Switch to FBO
        this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, this.fbo);
        this.gl.viewport(0, 0, this.size.width, this.size.height);
    }

    blit () {
        if (!this.fbo) {
            return;
        }

        this.blit_program.use();
        this.fbo_texture.bind(0);

        const gl = this.gl;
        gl.uniform2f(gl.getUniformLocation(this.blit_program.program, 'u_resolution'), this.size.width, this.size.height);
        gl.uniform1i(gl.getUniformLocation(this.blit_program.program, 'u_texture'), 0);

        // TODO: set blending options here (composite w/underlying buffer, or overwrite)
        gl.bindBuffer(gl.ARRAY_BUFFER, this.blit_buffer);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}

function createQuadBuffer (gl) {
    // Create vertex buffer (2 triangles covering whole viewport)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER,
        new Float32Array([
            -1.0, -1.0,
            1.0, -1.0,
            -1.0, 1.0,
            1.0, -1.0,
            1.0, 1.0,
            -1.0, 1.0
        ]),
        gl.STATIC_DRAW
    );
    return buffer;
}
