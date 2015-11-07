// Sets of values to match for directional and corner anchors
const lefts = ['left', 'top-left', 'bottom-left'];
const rights = ['right', 'top-right', 'bottom-right'];
const tops = ['top', 'top-left', 'top-right'];
const bottoms = ['bottom', 'bottom-left', 'bottom-right'];

var PointAnchor;

export default PointAnchor = {

    computeOffset (offset, size, anchor) {
        if (!anchor || anchor === 'center') {
            return offset;
        }

        let offset2 = [offset[0], offset[1]];

        // An optional left/right offset
        if (this.isLeftAnchor(anchor)) {
            offset2[0] -= size[0] / 2;
        }
        else if (this.isRightAnchor(anchor)) {
            offset2[0] += size[0] / 2;
        }

        // An optional top/bottom offset
        if (this.isTopAnchor(anchor)) {
            offset2[1] -= size[1] / 2;
        }
        else if (this.isBottomAnchor(anchor)) {
            offset2[1] += size[1] / 2;
        }

        return offset2;
    },

    isLeftAnchor (anchor) {
        return (lefts.indexOf(anchor) > -1);
    },

    isRightAnchor (anchor) {
        return (rights.indexOf(anchor) > -1);
    },

    isTopAnchor (anchor) {
        return (tops.indexOf(anchor) > -1);
    },

    isBottomAnchor (anchor) {
        return (bottoms.indexOf(anchor) > -1);
    }

};
