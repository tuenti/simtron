const allowedLinePrefixes = [
    'AT',
    'OK',
    'ERROR',
    '+CMS ERROR',
    '+CME ERROR',
    '+CMT',
    '+CREG:',
    '+CCID',
    '+CSCS:',
    '+STIN: 25',
    '+CPIN: READY',
];

const previousLinesExceptionPrefixes = ['AT+CCID', '+CMT'];

const someStartsWith = (lines, prefix)=> lines.some(line => line.startsWith(prefix));

const isValidLine = (line, previousLines) =>
    allowedLinePrefixes.some(allowedLinePrefix => line.startsWith(allowedLinePrefix))
    || previousLinesExceptionPrefixes.some(
        exceptionPrefix => someStartsWith(previousLines, exceptionPrefix)
    );

export default isValidLine;
