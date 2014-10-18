/* globals Point */
export default class Point {
    constructor(x, y) {
        if (! (this instanceof Point)) {
            return new Point(x, y);
        }
        this.x = x;
        this.y = y;
    }

    static copy(other) {
        if (other == null) {
            return null;
        }
        return new Point(other.x, other.y);
    }
}
