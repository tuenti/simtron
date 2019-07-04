"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _sims = _interopRequireDefault(require("./sims"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createResolvers = store => {
  return [{
    Query: {
      getSims: (0, _sims.default)(store)
    }
  }];
};

var _default = createResolvers;
exports.default = _default;