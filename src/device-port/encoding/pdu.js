import pdu from 'pdu/pdu';

const nonStandardGsmCharsToUnicode = {
    0x01: '\u00A3', // POUND SIGN
    0x02: '\u0024', // DOLLAR SIGN
    0x03: '\u00A5', // YEN SIGN
    0x04: '\u00E8', // LATIN SMALL LETTER E WITH GRAVE
    0x05: '\u00E9', // LATIN SMALL LETTER E WITH ACUTE
    0x06: '\u00F9', // LATIN SMALL LETTER U WITH GRAVE
    0x07: '\u00EC', // LATIN SMALL LETTER I WITH GRAVE
    0x08: '\u00F2', // LATIN SMALL LETTER O WITH GRAVE
    0x09: '\u00E7', // LATIN SMALL LETTER C WITH CEDILLA
    0x0a: '\u000A', // LINE FEED
    0x0b: '\u00D8', // LATIN CAPITAL LETTER O WITH STROKE
    0x0c: '\u00F8', // LATIN SMALL LETTER O WITH STROKE
    0x0d: '\u000D', // CARRIAGE RETURN
    0x0e: '\u00C5', // LATIN CAPITAL LETTER A WITH RING ABOVE
    0x0f: '\u00E5', // LATIN SMALL LETTER A WITH RING ABOVE
    0x10: '\u0394', // GREEK CAPITAL LETTER DELTA
    0x11: '\u005F', // LOW LINE
    0x12: '\u03A6', // GREEK CAPITAL LETTER PHI
    0x13: '\u0393', // GREEK CAPITAL LETTER GAMMA
    0x14: '\u039B', // GREEK CAPITAL LETTER LAMDA
    0x15: '\u03A9', // GREEK CAPITAL LETTER OMEGA
    0x16: '\u03A0', // GREEK CAPITAL LETTER PI
    0x17: '\u03A8', // GREEK CAPITAL LETTER PSI
    0x18: '\u03A3', // GREEK CAPITAL LETTER SIGMA
    0x19: '\u0398', // GREEK CAPITAL LETTER THETA
    0x1a: '\u039E', // GREEK CAPITAL LETTER XI
    0x1b: '\u00A0', // ESCAPE TO EXTENSION TABLE
    0x1c: '\u00C6', // LATIN CAPITAL LETTER AE
    0x1d: '\u00E6', // LATIN SMALL LETTER AE
    0x1e: '\u00DF', // LATIN SMALL LETTER SHARP S (German)
    0x1f: '\u00C9', // LATIN CAPITAL LETTER E WITH ACUTE
    0x20: '\u0020', // SPACE
    0x21: '\u0021', // EXCLAMATION MARK
    0x22: '\u0022', // QUOTATION MARK
    0x23: '\u0023', // NUMBER SIGN
    0x24: '\u00A4', // CURRENCY SIGN
    0x25: '\u0025', // PERCENT SIGN
    0x26: '\u0026', // AMPERSAND
    0x27: '\u0027', // APOSTROPHE
    0x28: '\u0028', // LEFT PARENTHESIS
    0x29: '\u0029', // RIGHT PARENTHESIS
    0x2a: '\u002A', // ASTERISK
    0x2b: '\u002B', // PLUS SIGN
    0x2c: '\u002C', // COMMA
    0x2d: '\u002D', // HYPHEN-MINUS
    0x2e: '\u002E', // FULL STOP
    0x2f: '\u002F', // SOLIDUS
    0x30: '\u0030', // DIGIT ZERO
    0x31: '\u0031', // DIGIT ONE
    0x32: '\u0032', // DIGIT TWO
    0x33: '\u0033', // DIGIT THREE
    0x34: '\u0034', // DIGIT FOUR
    0x35: '\u0035', // DIGIT FIVE
    0x36: '\u0036', // DIGIT SIX
    0x37: '\u0037', // DIGIT SEVEN
    0x38: '\u0038', // DIGIT EIGHT
    0x39: '\u0039', // DIGIT NINE
    0x3a: '\u003A', // COLON
    0x3b: '\u003B', // SEMICOLON
    0x3c: '\u003C', // LESS-THAN SIGN
    0x3d: '\u003D', // EQUALS SIGN
    0x3e: '\u003E', // GREATER-THAN SIGN
    0x3f: '\u003F', // QUESTION MARK
    0x40: '\u00A1', // INVERTED EXCLAMATION MARK
    0x5b: '\u00C4', // LATIN CAPITAL LETTER A WITH DIAERESIS
    0x5c: '\u00D6', // LATIN CAPITAL LETTER O WITH DIAERESIS
    0x5d: '\u00D1', // LATIN CAPITAL LETTER N WITH TILDE
    0x5e: '\u00DC', // LATIN CAPITAL LETTER U WITH DIAERESIS
    0x5f: '\u00A7', // SECTION SIGN
    0x60: '\u00BF', // INVERTED QUESTION MARK
    0x7b: '\u00E4', // LATIN SMALL LETTER A WITH DIAERESIS
    0x7c: '\u00F6', // LATIN SMALL LETTER O WITH DIAERESIS
    0x7d: '\u00F1', // LATIN SMALL LETTER N WITH TILDE
    0x7e: '\u00FC', // LATIN SMALL LETTER U WITH DIAERESIS
    0x7f: '\u00E0', // LATIN SMALL LETTER A WITH GRAVE
};

const replaceNonStandardGsmChars = smsText => {
    let result = '';
    for (let charIndex in smsText) {
        if (nonStandardGsmCharsToUnicode[smsText.charCodeAt(charIndex)]) {
            result += nonStandardGsmCharsToUnicode[smsText.charCodeAt(charIndex)];
        } else {
            result += smsText[charIndex];
        }
    }
    return result;
};

/**
 * This function fixes some issues related to the used GSM7 library
 * @param {*} smsText
 */
const removeUnicodeNullChars = smsText => smsText.replace(/[\u0000]/g, '');

export default pduContent => {
    const decodedPdu = pdu.parse(pduContent);
    return {
        ...decodedPdu,
        text: removeUnicodeNullChars(replaceNonStandardGsmChars(decodedPdu.text)),
    };
};
