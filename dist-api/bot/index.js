"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _slack = _interopRequireDefault(require("./handler/slack"));

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _default = {
  createBots: () => {
    const slackBot = (0, _slack.default)((0, _config.getSlackBotToken)());
    return [slackBot];
  }
};
exports.default = _default;