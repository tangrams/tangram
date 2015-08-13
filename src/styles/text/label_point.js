import Label from './label';
import Utils from '../../utils/utils';
import Geo from '../../geo';
import OBB from '../../utils/obb';

export default class LabelPoint extends Label {
    constructor (text, position, size, area, offset, { move_in_tile, keep_in_tile }) {
        super(text, size, offset, { move_in_tile, keep_in_tile });

        this.area = area;
        this.position = position;
        this.aabb = this.computeAABB();
    }

    computeAABB () {
        let width = this.size.text_size[0] * Geo.units_per_pixel;
        let height = this.size.text_size[1] * Geo.units_per_pixel;

        let obb = new OBB(this.position[0] + this.offset[0], this.position[1] + this.offset[1], 0.0, width, height);
        let aabb = obb.getExtent();
        aabb.obb = obb;

        return aabb;
    }

    moveInTile (in_tile) {
        let width = this.aabb[2] - this.aabb[0];
        let height = -this.aabb[3] - (-this.aabb[1]);

        // Move point labels to tile edges
        if (this.position[0] - width/2 < 0) {
            this.position[0] = width/2 + 1;
        }
        else if (this.position[0] + width/2 > Geo.tile_scale) {
            this.position[0] = Geo.tile_scale - (width/2 + 1);
        }

        this.position[1] *= -1; // just doing this so Y coord is positive
        if (this.position[1] - height/2 < 0) { // && this.position[1] > 0) {
            this.position[1] = height/2 + 1;
        }
        else if (this.position[1] + height/2 > Geo.tile_scale) {
            this.position[1] = Geo.tile_scale - (height/2 + 1);
        }
        this.position[1] *= -1;

        this.aabb = this.computeAABB();
        return !this.inTileBounds();
    }

    static explode (text, position, size, max_width, padding, move_in_tile, keep_in_tile) {
        let split_text = text.split(' ');

        if (split_text.length < 2) {
            return new LabelPoint(text, position, size, null, move_in_tile, keep_in_tile);
        }

        let line = new TextLine(text, size.text_size[0], split_text, size.split_size);
        let lines = line.explode(max_width);
        let labels = [];

        if (lines.length === 1) {
            return new LabelPoint(text, position, size, null, move_in_tile, keep_in_tile);
        }

        for (let i in lines) {
            let l = lines[i];
            let pos = [position[0], position[1] - Math.abs(padding) * i];
            labels.push(new LabelPoint(l.text, pos, size, null, move_in_tile, keep_in_tile));
        }

        return new LabelComposite(text, position, size, labels, move_in_tile, keep_in_tile);
    }
}

class LabelComposite extends Label {
    constructor (text, position, size, labels, move_in_tile, keep_in_tile) {
        super(text, size, move_in_tile, keep_in_tile);

        this.position = position;
        this.labels = labels;
        this.aabb = this.computeAABB();
    }

    isComposite () {
        return true;
    }

    moveInTile (in_tile) {
        return false;
    }

    computeAABB () {
        let aabb = [ Infinity, Infinity, -Infinity, -Infinity ];

        for (let i in this.labels) {
            let b = this.labels[i].aabb;

            aabb[0] = Math.min(b[0], aabb[0]);
            aabb[1] = Math.min(b[1], aabb[1]);
            aabb[2] = Math.max(b[2], aabb[2]);
            aabb[3] = Math.max(b[3], aabb[3]);
        }

        return aabb;
    }
}

class TextLine {
    constructor (text, line_length, words, size_info) {
        this.text = text;
        this.line_length = line_length;
        this.size_info = size_info;
        this.words = this.positions(words);
    }

    positions (words, size_info) {
        let word_infos = [];
        let offset = 0;
        let space_offset = this.size_info[' '];

        for (let i = 0; i < words.length; ++i) {
            let word = words[i];
            let word_length = this.size_info[word];

            word_infos.push({
                word: word,
                start: offset,
                end: offset + word_length
            });
            offset += word_length;

            if (i !== words.length - 1) {
                word_infos.push({
                    word: ' ',
                    start: offset,
                    end: offset + space_offset
                });
                offset += space_offset;
            }
        }

        return word_infos;
    }

    explode (max_width, exploded_lines = []) {
        if (max_width > this.line_length) {
            exploded_lines.push(this);
            return exploded_lines;
        }

        let index = this.wordInfoIndex(max_width);

        if (this.words[index].word === ' ') {
            index -= 1;
        }

        if (index < 1) {
            exploded_lines.push(this);
            return exploded_lines;
        }

        if (index < this.words.length) {
            let next_line_length = 0, previous_line_length = 0;
            let next_line_words = '', previous_line_words = '';

            for (let i = index; i < this.words.length; ++i) {
                next_line_words += this.words[i].word;
                next_line_length += this.size_info[this.words[i].word];
            }

            for (let i = 0; i < index; i++) {
                if (i !== index - 1 && this.words[i] !== ' ') {
                    previous_line_words += this.words[i].word;
                    previous_line_length += this.size_info[this.words[i].word];
                }
            }

            exploded_lines.push(new TextLine(
                    previous_line_words,
                    previous_line_length,
                    previous_line_words.split(' '),
                    this.size_info
            ));

            let next_line = new TextLine(next_line_words,
                    next_line_length,
                    next_line_words.split(' '),
                    this.size_info
            );

            return next_line.explode(max_width, exploded_lines);
        }

        exploded_lines.push(this);
        return exploded_lines;
    }

    wordInfoIndex (position) {
        if (position > this.line_length || this.words[this.words.length - 1].end < position) {
            return this.words.length - 1;
        } else if (position < 0) {
            return 0;
        }

        let d = this.words.length / 2;
        let i = Math.ceil(d);
        i = Math.min(Math.max(0, i), this.words.length - 1);
        let word_info = this.words[i];

        // dichotomic search
        while (word_info.start > position || word_info.end < position) {
            d /= 2;
            i += word_info.end < position ? Math.ceil(d) : -Math.ceil(d);
            i = Math.min(Math.max(0, i), this.words.length - 1);
            word_info = this.words[i];
        }

        return i;
    }
}

