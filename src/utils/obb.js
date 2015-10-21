import Vector from '../vector';

export default class OBB {

    constructor (x, y, a, w, h) {
        this.dimension = [w, h];
        this.angle = a;
        this.centroid = [x, y];
        this.quad = [];
        this.axes = [];

        this.update();
    }

    move (px, py) {
    	this.centroid = [px, py];

    	this.update();
    }

    getExtent () {
    	let inf = 1e6;
    	let aabb = [inf, inf, -inf, -inf];

    	for (let i = 0; i < 4; ++i) {
            aabb[0] = Math.min(this.quad[i][0], aabb[0]);
            aabb[1] = Math.min(this.quad[i][1], aabb[1]);
            aabb[2] = Math.max(this.quad[i][0], aabb[2]);
            aabb[3] = Math.max(this.quad[i][1], aabb[3]);
    	}

    	return aabb;
    }

    perpAxes () {
    	this.axes[0] = Vector.normalize(Vector.sub(this.quad[2], this.quad[3]));
    	this.axes[1] = Vector.normalize(Vector.sub(this.quad[2], this.quad[1]));
    }

    update () {
    	let x = [ Math.cos(this.angle), Math.sin(this.angle)];
    	let y = [-Math.sin(this.angle), Math.cos(this.angle)];

    	x = Vector.mult(x, this.dimension[0] / 2.0);
    	y = Vector.mult(y, this.dimension[1] / 2.0);

    	this.quad[0] = Vector.sub(Vector.sub(this.centroid, x), y); // lower-left
    	this.quad[1] = Vector.sub(Vector.add(this.centroid, x), y); // lower-right
    	this.quad[2] = Vector.add(Vector.add(this.centroid, x), y); // uper-right
    	this.quad[3] = Vector.add(Vector.sub(this.centroid, x), y); // uper-left

    	this.perpAxes();
    }

    static projectToAxis (obb, axis) {
    	let inf = 1e6;
    	let min = inf;
    	let max = -inf;

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

