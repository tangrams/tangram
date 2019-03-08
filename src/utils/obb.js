import Vector from './vector';

// single-allocation, reusable objects
const ZERO_AXES = [[1, 0], [0, 1]];
const proj_a = [], proj_b = [];
let d0, d1, d2, d3;

export default class OBB {

    constructor (x, y, a, w, h) {
        this.dimension = [w / 2, h / 2]; // store half-dimension as that's what's needed in calculations below
        this.angle = a;
        this.centroid = [x, y];
        this.quad = null;
        this.axis_0 = null;
        this.axis_1 = null;

        this.update();
    }

    toJSON () {
        return {
            x: this.centroid[0],
            y: this.centroid[1],
            a: this.angle,
            w: this.dimension[0],
            h: this.dimension[1]
        };
    }

    getExtent () {
        // special handling to skip calculations for 0-angle
        if (this.angle === 0) {
            return [this.quad[0], this.quad[1], this.quad[4], this.quad[5]];
        }

        let aabb = [
            Math.min(this.quad[0], this.quad[2], this.quad[4], this.quad[6]),
            Math.min(this.quad[1], this.quad[3], this.quad[5], this.quad[7]),
            Math.max(this.quad[0], this.quad[2], this.quad[4], this.quad[6]),
            Math.max(this.quad[1], this.quad[3], this.quad[5], this.quad[7])
        ];

        return aabb;
    }

    perpAxes () {
        this.axis_0 = Vector.normalize([this.quad[4] - this.quad[6], this.quad[5] - this.quad[7]]);
        this.axis_1 = Vector.normalize([this.quad[4] - this.quad[2], this.quad[5] - this.quad[3]]);
    }

    update () {
        // special handling to skip calculations for 0-angle
        if (this.angle === 0) {
            const c = this.centroid;
            const w2 = this.dimension[0];
            const h2 = this.dimension[1];

            this.quad = [
                c[0] - w2, c[1] - h2, // lower-left
                c[0] + w2, c[1] - h2, // lower-right
                c[0] + w2, c[1] + h2, // upper-right
                c[0] - w2, c[1] + h2  // upper-left
            ];

            this.axis_0 = ZERO_AXES[0];
            this.axis_1 = ZERO_AXES[1];
        }
        // calculate axes and enclosing quad
        else {
            let x0 = Math.cos(this.angle) * this.dimension[0];
            let x1 = Math.sin(this.angle) * this.dimension[0];

            let y0 = -Math.sin(this.angle) * this.dimension[1];
            let y1 = Math.cos(this.angle) * this.dimension[1];

            const c = this.centroid;
            this.quad = [
                c[0] - x0 - y0, c[1] - x1 - y1, // lower-left
                c[0] + x0 - y0, c[1] + x1 - y1, // lower-right
                c[0] + x0 + y0, c[1] + x1 + y1, // upper-right
                c[0] - x0 + y0, c[1] - x1 + y1  // upper-left
            ];

            this.perpAxes();
        }
    }

    static projectToAxis (obb, axis, proj) {
        // for each axis, project obb quad to it and find min and max values
        let quad = obb.quad;
        d0 = quad[0] * axis[0] + quad[1] * axis[1];
        d1 = quad[2] * axis[0] + quad[3] * axis[1];
        d2 = quad[4] * axis[0] + quad[5] * axis[1];
        d3 = quad[6] * axis[0] + quad[7] * axis[1];

        proj[0] = Math.min(d0, d1, d2, d3);
        proj[1] = Math.max(d0, d1, d2, d3);
        return proj;
    }

    static axisCollide(obb_a, obb_b, axis_0, axis_1) {
        OBB.projectToAxis(obb_a, axis_0, proj_a);
        OBB.projectToAxis(obb_b, axis_0, proj_b);
        if (proj_b[0] > proj_a[1] || proj_b[1] < proj_a[0]) {
            return false;
        }

        OBB.projectToAxis(obb_a, axis_1, proj_a);
        OBB.projectToAxis(obb_b, axis_1, proj_b);
        if (proj_b[0] > proj_a[1] || proj_b[1] < proj_a[0]) {
            return false;
        }

        return true;
    }

    static intersect(obb_a, obb_b) {
        return OBB.axisCollide(obb_a, obb_b, obb_a.axis_0, obb_a.axis_1) &&
               OBB.axisCollide(obb_a, obb_b, obb_b.axis_0, obb_b.axis_1);
    }

}
