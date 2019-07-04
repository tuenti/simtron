"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serialport = _interopRequireDefault(require("serialport"));

var _dataChunk = _interopRequireDefault(require("./data-chunk"));

var _logger = _interopRequireDefault(require("../util/logger"));

var _config = require("../config");

var _notification = _interopRequireDefault(require("./model/notification"));

var _allowedLinePolicy = _interopRequireDefault(require("./allowed-line-policy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createOngoingCommandResolver = (commandHandler, resolve, reject, timeoutCallback) => ({
  commandHandler,
  resolve,
  reject,
  timeoutHandler: setTimeout(timeoutCallback, commandHandler.timeout || (0, _config.getDevicesCommandsTimeout)()),
  timeoutCallback
});

const parseCommandResponse = (isSuccessful, responseLines, responseParser) => responseParser && isSuccessful ? responseParser(responseLines) : {};

const createCommandResponse = (isSuccessful, commandHandler, responseLines) => ({
  isSuccessful,
  responseLines,
  ...parseCommandResponse(isSuccessful, responseLines, commandHandler.responseParser)
});

const createCommandTimeoutResponse = command => ({
  isSuccessful: false,
  command
});

const createNotificationFromLine = ({
  id,
  notificationParser
}, notificationLine) => ({
  id,
  ...(notificationParser ? notificationParser(notificationLine) : {})
});

const isNotificationLine = (line, ongoingCommand) => !ongoingCommand && _notification.default.find(notification => line.startsWith(notification.id));

const isCommandExecutionStatusLine = line => line === 'OK' || line === 'ERROR' || line.startsWith('+CMS ERROR') || line.startsWith('+CME ERROR');

const isSuccessfulStatusLine = line => line === 'OK';

const triggerNotificationReceived = (portHandler, notification) => {
  portHandler.listeners.forEach(async listener => {
    await listener(portHandler.portId, notification);
  });
};

const debugCommandResponseReceived = (portId, lines) => {
  lines.forEach(responseLine => {
    _logger.default.debug(`Receiving command response line '${responseLine}' on port '${portId}'`);
  });
};

const resolveCommand = (commandHandler, commandResponse) => setTimeout(() => commandHandler.resolve(commandResponse), (0, _config.getDevicesCommandsResolveDelay)());

const handleNotificationLine = (line, portHandler) => {
  const notification = createNotificationFromLine(_notification.default.find(n => line.startsWith(n.id)), line);

  _logger.default.debug(`Receiving notification line '${line}' on port '${portHandler.portId}'`);

  triggerNotificationReceived(portHandler, notification);
};

const handleCommandResponseLine = (line, portHandler) => {
  if ((0, _allowedLinePolicy.default)(line, portHandler.commandResponseLines)) {
    if (isCommandExecutionStatusLine(line, portHandler.ongoingCommand)) {
      if (portHandler.ongoingCommand) {
        portHandler.commandResponseLines.push(line);
        const commandResponse = createCommandResponse(isSuccessfulStatusLine(line), portHandler.ongoingCommand.commandHandler, portHandler.commandResponseLines);
        debugCommandResponseReceived(portHandler.portId, portHandler.commandResponseLines);
        resolveCommand(portHandler.ongoingCommand, commandResponse);
        portHandler.ongoingCommand = null;
        portHandler.commandResponseLines = [];
      }
    } else {
      portHandler.commandResponseLines.push(line);
    }
  } else {
    _logger.default.debug(`Receiving unsupported line '${line}' in command response.`);
  }
};

const createPortHandler = ({
  portName,
  baudRate
}) => {
  const port = new _serialport.default(portName, {
    baudRate
  });
  const portHandler = {
    port,
    portId: portName,
    ongoingCommand: null,
    commandResponseLines: [],
    notificationLines: [],
    listeners: [],

    addListener(listener) {
      this.listeners.push(listener);
    },

    clearListeners() {
      this.listeners = [];
    },

    async sendCommand(commandHandler) {
      return new Promise((resolve, reject) => {
        port.write(`${commandHandler.command}\r`);

        const handleCommandTimedOut = () => {
          reject(createCommandTimeoutResponse(commandHandler.command));
          this.ongoingCommand = null;
        };

        this.ongoingCommand = createOngoingCommandResolver(commandHandler, resolve, reject, handleCommandTimedOut);

        _logger.default.debug(`Sending command '${commandHandler.command}' on port '${this.portId}'`);
      });
    }

  };
  const dataReader = (0, _dataChunk.default)();
  port.on('data', async data => {
    const decodedData = data.toString('utf8');
    dataReader.read(decodedData, line => {
      if (isNotificationLine(line, portHandler.ongoingCommand)) {
        handleNotificationLine(line, portHandler);
      } else {
        handleCommandResponseLine(line, portHandler);
      }
    });
  });
  return portHandler;
};

var _default = createPortHandler;
exports.default = _default;