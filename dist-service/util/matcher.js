"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PARENTHESIS_GROUP = exports.LAST_DIGITS = exports.QUOTES = exports.QUOTED_TEXTS = exports.NON_DIGITS = exports.NULL_UNICODE_CHAR = void 0;
const NULL_UNICODE_CHAR = /[\u0000]/g;
exports.NULL_UNICODE_CHAR = NULL_UNICODE_CHAR;
const NON_DIGITS = /\D/g;
exports.NON_DIGITS = NON_DIGITS;
const QUOTED_TEXTS = /\"([^"]*)\"/g;
exports.QUOTED_TEXTS = QUOTED_TEXTS;
const QUOTES = /\"/g;
exports.QUOTES = QUOTES;
const LAST_DIGITS = /\d+$/g;
exports.LAST_DIGITS = LAST_DIGITS;
const PARENTHESIS_GROUP = /\(([^()]*)\)/g;
exports.PARENTHESIS_GROUP = PARENTHESIS_GROUP;