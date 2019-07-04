"use strict";

var _portFactory = _interopRequireDefault(require("./device-port/port-factory"));

var _bot = _interopRequireDefault(require("./bot"));

var _simtronController = _interopRequireDefault(require("./simtron-controller"));

var _store = _interopRequireDefault(require("./store"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const store = (0, _store.default)();
const simtronController = (0, _simtronController.default)(_bot.default, _portFactory.default, store);
simtronController.start();