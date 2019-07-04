"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const decodeUtf16 = text => {
  let result = [];

  for (let i = 0; i < text.length; i += 4) {
    result.push(parseInt(text.substring(i, i + 4), 16));
  }

  return String.fromCharCode(...result);
};

var _default = decodeUtf16;
exports.default = _default;