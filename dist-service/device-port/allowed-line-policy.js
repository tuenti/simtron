"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const allowedLinePrefixes = ['AT', 'OK', 'ERROR', '+CMS ERROR', '+CME ERROR', '+CMTI:', '+CMGR:', '+CREG:', '+CCID', '+ICCID', '+COPS:', '+CSCS:', 'START', 'PB DONE'];
const previousLinesExceptionPrefixes = ['AT+CCID', '+CMGR:'];

const someStartsWith = (lines, prefix) => lines.some(line => line.startsWith(prefix));

const isValidLine = (line, previousLines) => allowedLinePrefixes.some(allowedLinePrefix => line.startsWith(allowedLinePrefix)) || previousLinesExceptionPrefixes.some(exceptionPrefix => someStartsWith(previousLines, exceptionPrefix));

var _default = isValidLine;
exports.default = _default;