// Text directionality (right-to-left, bi-directional) and segmentation (curved labels, Arabic handling)

// Right-to-left / bi-directional text handling
// Taken from http://stackoverflow.com/questions/12006095/javascript-how-to-check-if-character-is-rtl
const rtl_test = new RegExp('[\u0591-\u07FF\u200F\u202B\u202E\uFB1D-\uFDFD\uFE70-\uFEFC]');
export function isTextRTL(s){
    return rtl_test.test(s);
}

const neutral_chars = '\u0000-\u002F\u003A-\u0040\u005B-\u0060\u007B-\u00BF\u00D7\u00F7\u02B9-\u02FF\u2000-\u2BFF\u2010-\u2029\u202C\u202F-\u2BFF';
const neutral_test = new RegExp('['+neutral_chars+']+');
export function isTextNeutral(s){
    return neutral_test.test(s);
}

export const RTL_MARKER = '\u200F'; // explicit right-to-left marker

// Arabic script ranges
// test http://localhost:8000/#16.72917/30.08541/31.28466
const arabic_range = new RegExp('^['+neutral_chars+'\u0600-\u06FF]+'); // all characters are Arabic or neutral
const arabic_splitters = new RegExp('['+neutral_chars+'\u0622-\u0625\u0627\u062F-\u0632\u0648\u0671-\u0677\u0688-\u0699\u06C4-\u06CB\u06CF\u06D2\u06D3\u06EE\u06EF]');
const arabic_vowels = new RegExp('^[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06DC\u06DF-\u06E4\u06E7\u06E8\u06EA-\u06ED]+');

// Complex script ranges (non-Arabic)
const accents_and_vowels = '[\u0300-\u036F' + // Combining Diacritical Marks
'\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7' + // Hebrew
'\u07A6-\u07B0' + // Thaana
'\u0900-\u0903\u093A-\u094C\u094E\u094F\u0951-\u0957\u0962\u0963' + // Devanagari
'\u0981-\u0983\u09BC\u09BE-\u09CC\u09D7\u09E2\u09E3' + // Bengali
'\u0A01-\u0A03\u0A3C-\u0A4C\u0A51' + // Gurmukhi
'\u0A81-\u0A83\u0ABC\u0ABE-\u0ACC\u0AE2\u0AE3' + // Gujarati
'\u0B01-\u0B03\u0B3C\u0B3E-\u0B4C\u0B56\u0B57\u0B62\u0B63' + // Oriya
'\u0B82\u0BBE-\u0BCD\u0BD7' + // Tamil
'\u0C00-\u0C03\u0C3E-\u0C4C\u0C55\u0C56\u0C62\u0C63' + // Telugu
'\u0C81-\u0C83\u0CBC\u0CBE-\u0CCC\u0CD5\u0CD6\u0CE2\u0CE3' + // Kannada
'\u0D01-\u0D03\u0D3E-\u0D4C\u0D4E\u0D57\u0D62\u0D63' + // Malayalam
'\u0D82\u0D83\u0DCA-\u0DDF\u0DF2\u0DF3' + // Sinhala
'\u0E31\u0E34-\u0E3A\u0E47-\u0E4E' + // Thai
'\u0EB1\u0EB4-\u0EBC\u0EC8-\u0ECD' + // Lao
'\u0F18\u0F19\u0F35\u0F37\u0F39\u0F3E\u0F3F\u0F71-\u0F83\u0F86\u0F87\u0F8D-\u0FBC\u0FC6' + // Tibetan
'\u102B-\u1038\u103A-\u103E\u1056-\u1059\u105E-\u1060\u1062-\u1064\u1067-\u106D\u1071-\u1074\u1082-\u108D\u108F\u109A-\u109D' + // Burmese
'\u17B4-\u17D1\u17D3' + // Khmer
'\u1A55-\u1A5E\u1A61-\u1A7C' + // Tai Tham
'\u1DC0-\u1DFF' + // Combining Diacritical Marks Supplement
'\u20D0-\u20FF' + // Combining Diacritical Marks for Symbols
']';
const combo_characters = '[\u094D\u09CD\u0A4D\u0ACD\u0B4D\u0C4D\u0CCD\u0D4D\u0F84\u1039\u17D2\u1A60\u1A7F]';

// Find the next grapheme cluster (non-Arabic)
const grapheme_match = new RegExp(`^.(?:${accents_and_vowels}+)?(${combo_characters}\\W(?:${accents_and_vowels}+)?)*`); // eslint-disable-line no-misleading-character-class

// Scripts that cannot be curved due (due to contextual shaping and/or layout complexity)
const curve_blacklist = {
    Mongolian: '\u1800-\u18AF'
};
const curve_blacklist_range = Object.keys(curve_blacklist).map(r => curve_blacklist[r]).join('');
const curve_blacklist_test = new RegExp('['+curve_blacklist_range+']');
export function isTextCurveBlacklisted(s){
    return curve_blacklist_test.test(s);
}

// Splitting strategy for chopping a label into segments
const default_segment_length = 2; // character length of each segment when dividing up label text

export function splitLabelText(text, rtl, cache) {
    // Use single-character segments for RTL, to avoid additional handling for neutral characters
    // (see https://github.com/tangrams/tangram/issues/541)
    const segment_length = rtl ? 1 : default_segment_length;

    // Only one segment
    if (text.length < segment_length) {
        return [text];
    }

    // Check segment cache first (skips processing for labels we've seen before)
    let key = text;
    if (cache.segment[key]) {
        cache.stats.segment_hits++;
        return cache.segment[key];
    }

    let segments = [];

    // Arabic-specific text handling
    // NB: works for strings that are *only* Arabic; mixed-script labels may need more work
    if (arabic_range.exec(text)) {
        segments = text.split(arabic_splitters);
        let offset = -1;
        for (var s = 0; s < segments.length - 1; s++) {
            if (s > 0) {
                let carryover_vowels = arabic_vowels.exec(segments[s]);
                if (carryover_vowels) {
                    segments[s] = segments[s].substring(carryover_vowels[0].length);
                    segments[s - 1] += carryover_vowels[0];
                    offset += carryover_vowels[0].length;
                }
            }
            offset += 1 + segments[s].length;
            segments[s] += text.slice(offset, offset + 1);
        }
        text = ''; // will skip non-Arabic handling below
    }

    // Non-Arabic text handling
    while (text.length) {
        let segment = '';
        let test_text = text;
        let grapheme_count = 0;

        for (grapheme_count; grapheme_count < segment_length && test_text.length; grapheme_count++) {
            let grapheme_cluster = (grapheme_match.exec(test_text) || test_text)[0];
            segment += grapheme_cluster;
            test_text = test_text.substring(grapheme_cluster.length);
        }

        segments.push(segment);
        text = text.substring(segment.length);
    }

    // Reverse segments if needed
    if (rtl) {
        segments.reverse();
    }

    // Cache and return
    cache.stats.segment_misses++;
    cache.segment[key] = segments;
    return segments;
}
