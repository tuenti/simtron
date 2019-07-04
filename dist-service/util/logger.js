"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _winston = require("winston");

var _debug = _interopRequireDefault(require("debug"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const debug = (0, _debug.default)('app');
const logger = (0, _winston.createLogger)({
  transports: new _winston.transports.Console({
    format: _winston.format.combine(_winston.format.timestamp({
      format: 'YYYY-MM-DD hh:mm:ss'
    }), _winston.format.json())
  })
});
var _default = {
  error: error => {
    logger.error(error);

    if (process.env.DEVELOPMENT) {
      throw error;
    }
  },
  warning: message => {
    logger.warn(message);
  },
  info: message => {
    logger.info(message);
  },
  debug: message => {
    debug(message);
  }
};
exports.default = _default;