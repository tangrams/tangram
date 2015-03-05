import Label from './label';

export default class LabelPoint extends Label {
    constructor (text, position, size, move_in_tile, keep_in_tile) {
        super(text, size, move_in_tile, keep_in_tile);

        this.position = position;
        this.bbox = this.computeBBox();
    }

    computeBBox () {
        let half_merc_width = this.mercatorLength() * 0.5;
        let half_merc_height = this.mercatorHeight() * 0.5;

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

