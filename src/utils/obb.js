import Vector from './vector';

const ZERO_AXES = [[1, 0], [0, 1]]; // re-use single allocation of axes for 0-angle

export default class OBB {

    constructor (x, y, a, w, h) {
        this.dimension = [w, h];
        this.angle = a;
        this.centroid = [x, y];
        this.quad = null;
        this.axes = null;

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
            return [this.quad[0][0], this.quad[0][1], this.quad[2][0], this.quad[2][1]];
        }

        let aabb = [Infinity, Infinity, -Infinity, -Infinity];

        for (let i = 0; i < 4; ++i) {
            aabb[0] = Math.min(this.quad[i][0], aabb[0]);
            aabb[1] = Math.min(this.quad[i][1], aabb[1]);
            aabb[2] = Math.max(this.quad[i][0], aabb[2]);
            aabb[3] = Math.max(this.quad[i][1], aabb[3]);
        }

        return aabb;
    }

    perpAxes () {
        this.axes = [
            // Vector.normalize(Vector.sub(this.quad[2], this.quad[3])),
            // Vector.normalize(Vector.sub(this.quad[2], this.quad[1]))
            Vector.normalize([this.quad[2][0] - this.quad[1][0], this.quad[2][1] - this.quad[1][1]]),
            Vector.normalize([this.quad[2][0] - this.quad[1][0], this.quad[2][1] - this.quad[1][1]])
        ];
    }

    update () {
        // special handling to skip calculations for 0-angle
        if (this.angle === 0) {
            const c = this.centroid;
            const w2 = this.dimension[0] / 2;
            const h2 = this.dimension[1] / 2;
            this.quad = [
                [c[0] - w2, c[1] - h2], // lower-left
                [c[0] + w2, c[1] - h2], // lower-right
                [c[0] + w2, c[1] + h2], // upper-right
                [c[0] - w2, c[1] + h2]  // upper-left
            ];
            this.axes = ZERO_AXES;
        }
        // calculate axes and enclosing quad
        else {
            let x = [ Math.cos(this.angle), Math.sin(this.angle)];
            let y = [-Math.sin(this.angle), Math.cos(this.angle)];

            x = Vector.mult(x, this.dimension[0] / 2.0);
            y = Vector.mult(y, this.dimension[1] / 2.0);

            this.quad = [
                // Vector.sub(Vector.sub(this.centroid, x), y), // lower-left
                // Vector.sub(Vector.add(this.centroid, x), y), // lower-right
                // Vector.add(Vector.add(this.centroid, x), y), // upper-right
                // Vector.add(Vector.sub(this.centroid, x), y)  // upper-left
                [this.centroid[0] - x[0] - y[0], this.centroid[1] - x[1] - y[1]], // lower-left
                [this.centroid[0] + x[0] - y[0], this.centroid[1] + x[1] - y[1]], // lower-right
                [this.centroid[0] + x[0] + y[0], this.centroid[1] + x[1] + y[1]], // upper-right
                [this.centroid[0] - x[0] + y[0], this.centroid[1] - x[1] + y[1]]  // upper-left
            ];

            this.perpAxes();
        }
    }

    static projectToAxis (obb, axis) {
        let min = Infinity;
        let max = -Infinity;

        let quad = obb.quad;

        // for each axis, project obb quad to it and find min and max values
        for (let i = 0; i < 4; ++i) {
            let d =  Vector.dot(quad[i], axis);
            min = Math.min(min, d);
            max = Math.max(max, d);
        }

        return [min, max];
    }

    static axisCollide (obb_a, obb_b, axes) {
        for (let i = 0; i < 2; ++i) {
            let a_proj = OBB.projectToAxis(obb_a, axes[i]);
            let b_proj = OBB.projectToAxis(obb_b, axes[i]);

            if (b_proj[0] > a_proj[1] || b_proj[1] < a_proj[0]) {
                return false;
            }
        }
        return true;
    }

    static intersect(obb_a, obb_b) {
        return OBB.axisCollide(obb_a, obb_b, obb_a.axes) && OBB.axisCollide(obb_a, obb_b, obb_b.axes);
    }

}
