const allowedLinePrefixes = ['AT', 'OK', 'ERROR', '+CMS ERROR', '+CME ERROR', '+CMT', '+CREG:', '+CCID'];

const previousLinesExceptionPrefixes = ['AT+CCID', '+CMT'];

const SMS_PDU_MIN_LENGTH = 50;

const someStartsWith = (lines, prefix)=> lines.some(line => line.startsWith(prefix));

const isValidLine = (line, previousLines) =>
    allowedLinePrefixes.some(allowedLinePrefix => line.startsWith(allowedLinePrefix))
    || previousLinesExceptionPrefixes.some(
        exceptionPrefix => someStartsWith(previousLines, exceptionPrefix)
    );

export default isValidLine;
