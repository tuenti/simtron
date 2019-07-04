"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _receivedSms = _interopRequireDefault(require("./received-sms"));

var _simCatalog = _interopRequireDefault(require("./sim-catalog"));

var _questionary = _interopRequireDefault(require("./questionary"));

var _settings = _interopRequireDefault(require("./settings"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createStore = () => ({
  sim: (0, _simCatalog.default)(),
  sms: (0, _receivedSms.default)(),
  questionary: (0, _questionary.default)(),
  settings: (0, _settings.default)()
});

var _default = createStore;
exports.default = _default;