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

        for (let i in words) {
            let word = words[i];
            let word_length = this.size_info[word];

            word_infos.push({
                word: word,
                start: offset,
                end: offset + word_length
            });
            offset += word_length;

            if (i != words.length - 1) {
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
        let half_width = this.line_length / 2;
        let index = this.wordInfoIndex(half_width);
        let word_info = this.words[index];

        if (word_info.word === ' ') {
            word_info = this.words[index + 1];
        }
        if (word_info.end > max_width) {
            let next_line_length = 0, previous_line_length = 0;
            let next_line_words = '', previous_line_words = '';

            for (let i = index; i < this.words.length; ++i) {
                next_line_words += this.words[i].word;
                next_line_length += this.size_info[this.words[i].word];
            }

            for (let i = 0; i < index; i++) {
                previous_line_words += this.words[i].word;
                previous_line_length += this.size_info[this.words[i].word];
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
        if (position > this.line_length) {
            return this.words.length - 1;
        } else if (position < 0) {
            return 0;
        }

        let half_width = this.line_length / 2;
        let i = Math.floor(this.words.length / 2);
        let word_info = this.words[i];

        // dichotomic search
        while (word_info.start > position || word_info.end < position) {
            let offset;

            if (word_info.end < position) {
                offset = Math.floor((this.words.length - i) / 2);
                i += offset;
            } else {
                offset = Math.floor((i + 1) / 2);
                i -= offset;
            }

            word_info = this.words[i];
        }

        return i;
    }
}

LabelPoint.explode = function (text, position, size, max_width) {
    let split_text = text.split(' ');
    if (split_text.length <= 2) {
        // TODO : one word string
    } else {
        let line = new TextLine(text, size.text_size[0], split_text, size.split_size);
        let lines = line.explode(50);
        debugger;
    }

    return new LabelComposite(position, null);
}

