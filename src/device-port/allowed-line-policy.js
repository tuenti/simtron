const allowedLinePrefixes = [
    'AT',
    'OK',
    'ERROR',
    '+CMS ERROR',
    '+CME ERROR',
    '+CMTI:',
    '+CMGR:',
    '+CREG:',
    '+CCID',
    '+ICCID',
    '+CSCS:',
    'START',
    '+STIN: 25',
    '+CPIN: READY',
];

const previousLinesExceptionPrefixes = ['AT+CCID', '+CMGR:'];

const someStartsWith = (lines, prefix) => lines.some(line => line.startsWith(prefix));

const isValidLine = (line, previousLines) =>
    allowedLinePrefixes.some(allowedLinePrefix => line.startsWith(allowedLinePrefix)) ||
    previousLinesExceptionPrefixes.some(exceptionPrefix => someStartsWith(previousLines, exceptionPrefix));

export default isValidLine;
