// Sets of values to match for directional and corner anchors
const lefts = ['left', 'top-left', 'bottom-left'];
const rights = ['right', 'top-right', 'bottom-right'];
const tops = ['top', 'top-left', 'top-right'];
const bottoms = ['bottom', 'bottom-left', 'bottom-right'];

const PointAnchor = {

    computeOffset (offset, size, anchor, buffer = null) {
        if (!anchor || anchor === 'center') {
            return offset;
        }

        let offset2 = [offset[0], offset[1]];
        buffer = buffer || this.default_buffer;

        // An optional left/right offset
        if (this.isLeftAnchor(anchor)) {
            offset2[0] -= size[0] / 2;
            if (anchor === 'left') {
                offset2[0] -= buffer[0];
            }
        }
        else if (this.isRightAnchor(anchor)) {
            offset2[0] += size[0] / 2;
            if (anchor === 'right') {
                offset2[0] += buffer[1];
            }
        }

        // An optional top/bottom offset
        if (this.isTopAnchor(anchor)) {
            offset2[1] -= size[1] / 2;
            if (anchor === 'top') {
                offset2[1] -= buffer[2];
            }
        }
        else if (this.isBottomAnchor(anchor)) {
            offset2[1] += size[1] / 2;
            if (anchor === 'bottom') {
                offset2[1] += buffer[3];
            }
        }

        return offset2;
    },

    alignForAnchor (anchor) {
        if (anchor && anchor !== 'center') {
            if (this.isLeftAnchor(anchor)) {
                return 'right';
            }
            else if (this.isRightAnchor(anchor)) {
                return 'left';
            }
        }
        return 'center';
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
    },

    // Buffers: [left, right, top, bottom]
    default_buffer: [2.5, 2.5, 1.5, 0.75],
    zero_buffer: [0, 0, 0, 0]

};

export default PointAnchor;
