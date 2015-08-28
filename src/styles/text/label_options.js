import Geo from '../../geo';

export default class LabelOptions {

    constructor ({ offset, exceed, move_in_tile, keep_in_tile, buffer }) {
        this.buffer = buffer|| [0, 0];
        this.keep_in_tile = (keep_in_tile != null) ? keep_in_tile : true;
        this.move_in_tile = (move_in_tile != null) ? move_in_tile : true;
        this.offset = offset || [0, 0];
        this.exceed = (exceed != null) ? exceed : 30;
    }

}
