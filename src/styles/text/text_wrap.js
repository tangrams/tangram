// Word wrapping

import { markRTL, isTextRTL, isTextNeutral } from './text_segments';

// Private class to arrange text labels into multiple lines based on
// "text wrap" and "max line" values
export default class MultiLine {
    constructor (context, max_lines = Infinity, text_wrap = Infinity) {
        this.width = 0;
        this.height = 0;
        this.lines = [];

        this.max_lines = max_lines;
        this.text_wrap = text_wrap;
        this.context = context;
    }

    createLine (line_height){
        if (this.lines.length < this.max_lines){
            return new Line(line_height, this.text_wrap);
        }
        else {
            return false;
        }
    }

    push (line){
        if (this.lines.length < this.max_lines){
            // measure line width
            let line_width = this.context.measureText(line.text).width;
            line.width = line_width;

            if (line_width > this.width){
                this.width = Math.ceil(line_width);
            }

            // add to lines and increment height
            this.lines.push(line);
            this.height += line.height;
            return true;
        }
        else {
            this.addEllipsis();
            return false;
        }
    }

    // pushes to the lines array and returns a new line if possible (false otherwise)
    advance (line, line_height) {
        let can_push = this.push(line);
        if (can_push){
            return this.createLine(line_height);
        }
        else {
            return false;
        }
    }

    addEllipsis (){
        let last_line = this.lines[this.lines.length - 1];
        let ellipsis_width = Math.ceil(this.context.measureText(MultiLine.ellipsis).width);

        last_line.append(MultiLine.ellipsis);
        last_line.width += ellipsis_width;

        if (last_line.width > this.width) {
            this.width = last_line.width;
        }
    }

    finish (line){
        if (line){
            this.push(line);
        }
        else {
            this.addEllipsis();
        }
    }

    static parse (str, text_wrap, max_lines, line_height, ctx) {
        // Word wrapping
        // Line breaks can be caused by:
        //  - implicit line break when a maximum character threshold is exceeded per line (text_wrap)
        //  - explicit line break in the label text (\n)
        let words;
        if (typeof text_wrap === 'number') {
            words = str.split(' '); // split words on spaces
        }
        else {
            words = [str]; // no max line word wrapping (but new lines will still be in effect)
        }

        let multiline = new MultiLine(ctx, max_lines, text_wrap);
        let line = multiline.createLine(line_height);

        // First iterate on space-break groups (will be one if max line length off), then iterate on line-break groups
        for (let i = 0; i < words.length; i++) {
            let breaks = words[i].split('\n'); // split on line breaks
            let new_line = (i === 0) ? true : false;

            for (let n=0; n < breaks.length; n++) {
                if (!line){
                    break;
                }

                let word = breaks[n];

                // force punctuation (neutral chars) at the end of a RTL line, so they stay attached to original word
                if (isTextRTL(word) && isTextNeutral(word[word.length - 1])) {
                    word += markRTL;
                }

                let spaced_word = (new_line) ? word : ' ' + word;

                // if adding current word would overflow, add a new line instead
                // first word (i === 0) always appends
                if (text_wrap && i > 0 && line.exceedsTextwrap(spaced_word)) {
                    line = multiline.advance(line, line_height);
                    if (!line){
                        break;
                    }
                    line.append(word);
                    new_line = true;
                }
                else {
                    line.append(spaced_word);
                }

                // if line breaks present, add new line (unless on last line)
                if (n < breaks.length - 1) {
                    line = multiline.advance(line, line_height);
                    new_line = true;
                }
            }

            if (i === words.length - 1){
                multiline.finish(line);
            }
        }
        return multiline;
    }
}

MultiLine.ellipsis = '...';

// A Private class used by MultiLine to contain the logic for a single line
// including character count, width, height and text
class Line {
    constructor (height = 0, text_wrap = 0){
        this.chars = 0;
        this.text = '';

        this.height = Math.ceil(height);
        this.text_wrap = text_wrap;
    }

    append (text){
        this.chars += text.length;
        this.text += text;
    }

    exceedsTextwrap (text){
        return text.length + this.chars > this.text_wrap;
    }
}
