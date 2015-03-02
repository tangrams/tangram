import Label from './label';

export default class LabelPoint extends Label {
    constructor (text, position, size) {
        super(text, size);

        this.position = position;
        this.bbox = this.computeBBox();
    }

    computeBBox () {
        let half_merc_width = this.mercatorLength() * 0.5;
        let half_merc_height = this.mercatorHeight() * 0.5;

        return [
            this.position[0] - half_merc_width,
            this.position[1] - half_merc_height,
            this.position[0] + half_merc_width,
            this.position[1] + half_merc_height
        ];
    }

    moveInTile (in_tile) {
        return false;
    }

    discard (move_in_tile, keep_in_tile, bboxes) {
        return super.discard(move_in_tile, keep_in_tile, bboxes);
    }
}

