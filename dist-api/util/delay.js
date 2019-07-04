"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const delayed = (func, delayMs) => new Promise(resolve => {
  setTimeout(() => {
    func();
    resolve();
  }, delayMs);
});

var _default = delayed;
exports.default = _default;