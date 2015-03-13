import Label from './label';
import Utils from '../../utils/utils';

export default class LabelPoint extends Label {
    constructor (text, position, size, area, move_in_tile, keep_in_tile) {
        super(text, size, move_in_tile, keep_in_tile);

        this.area = area;
        this.position = position;
        this.bbox = this.computeBBox();
    }

    computeBBox () {
        let half_merc_width = Utils.pixelToMercator(this.size.text_size[0]) * 0.5;
        let half_merc_height = Utils.pixelToMercator(this.size.text_size[1]) * 0.5;

        let bbox = [
            this.position[0] - half_merc_width,
            this.position[1] - half_merc_height,
            this.position[0] + half_merc_width,
            this.position[1] + half_merc_height
        ];

        return bbox;
    }

    moveInTile (in_tile) {
        return false;
    }

    discard (bboxes) {
        return super.discard(bboxes);
    }
}

class LabelComposite extends Label {
    constructor (position, labels) {
        this.labels = labels;
    }

    isComposite () {
        return true;
    }

    discard (bboxes) {
        return false;
    }
}

LabelPoint.break = function (text, position, size, maxWidth) {
    return new LabelComposite(position, null);
}

