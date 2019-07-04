"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../util/logger"));

var _error = _interopRequireWildcard(require("../util/error"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createCommandQueue = portHandler => {
  const commandQueue = {
    portId: portHandler.portId,
    portHandler,
    lastCommandToExecute: Promise.resolve(),

    addListener(listener) {
      portHandler.addListener(listener);
    },

    clearListeners() {
      portHandler.clearListeners();
    },

    sendCommand(commandHandler) {
      const result = new Promise(resolve => {
        this.lastCommandToExecute.finally(() => {
          this.portHandler.sendCommand(commandHandler).then(resolve).catch(commandResponse => {
            resolve(commandResponse);

            _logger.default.error((0, _error.default)(_error.COMMAND_NOT_RESPONDING, `Command ${commandResponse.command} is not responding`));
          });
        }).catch(({
          command
        }) => {
          _logger.default.error((0, _error.default)(_error.COMMAND_NOT_RESPONDING, `Command ${command} is not responding`));
        });
      });
      this.lastCommandToExecute = result;
      return result;
    }

  };
  return commandQueue;
};

var _default = createCommandQueue;
exports.default = _default;