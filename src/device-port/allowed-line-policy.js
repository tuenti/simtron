const allowedLinePrefixes = [
    'AT',
    'OK',
    'ERROR',
    '+CMS ERROR',
    '+CME ERROR',
    '+CMTI:',
    '+CMGR:',
    '+CREG:',
    '+CPIN:',
    '+CCID',
    '+ICCID',
    '+COPS:',
    '+CSCS:',
    'START',
    'PB DONE',
];

const previousLinesExceptionPrefixes = ['AT+CCID', '+CMGR:', 'AT+CGSN'];

const someStartsWith = (lines, prefix) => lines.some(line => line.startsWith(prefix));

const isValidLine = (line, previousLines) =>
    allowedLinePrefixes.some(allowedLinePrefix => line.startsWith(allowedLinePrefix)) ||
    previousLinesExceptionPrefixes.some(exceptionPrefix => someStartsWith(previousLines, exceptionPrefix));

export default isValidLine;
