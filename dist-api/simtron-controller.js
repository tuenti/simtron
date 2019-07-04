"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _message = require("./bot/model/message");

var _speech = _interopRequireDefault(require("./bot/speech"));

var _deviceConfig = _interopRequireDefault(require("./device-config"));

var _portNotification = _interopRequireDefault(require("./port-notification"));

var _config = require("./config");

var _logger = _interopRequireDefault(require("./util/logger"));

var _error = _interopRequireWildcard(require("./util/error"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createSimtronController = (botFactory, devicePortsFactory, store) => {
  let bots = [];
  let devicePortHandlers = [];

  const answerMessageToBot = bot => (message, receivedMessage) => {
    bot.sendMessage(message, receivedMessage);
  };

  const sendCommandToPort = (command, portId) => {
    const port = devicePortHandlers.find(portHandler => portHandler.portId === portId);

    if (port) {
      return port.sendCommand(command);
    } else {
      _logger.default.error((0, _error.default)(_error.PORT_NOT_FOUND, `Port[${portId}] not found`));

      return Promise.reject((0, _error.default)(_error.PORT_NOT_FOUND, `Port[${portId}] not found`));
    }
  };

  const handleBotIncomingMessage = async (bot, incomingMessage) => {
    const messageSpeech = (0, _speech.default)(incomingMessage, store);

    if (messageSpeech) {
      if (messageSpeech.isAdmin && !incomingMessage.isFromAdmin) {
        bot.sendMessage((0, _message.createErrorMessage)(`*${_message.USER_MENTION}* admin actions are restricted.`), incomingMessage);
      } else {
        messageSpeech.action(incomingMessage, store, answerMessageToBot(bot), sendCommandToPort);
      }
    }
  };

  const startBots = bots => Promise.all(bots.map(bot => {
    bot.addListener(handleBotIncomingMessage);
    return bot.start();
  }));

  const sendMessageOnAllBots = message => bots.forEach(bot => {
    return bot.sendMessage(message);
  });

  const findPortById = portId => devicePortHandlers.find(portHandler => portHandler.portId === portId);

  const handlePortIncomingNotification = async (portId, notification) => {
    const port = findPortById(portId);
    (0, _portNotification.default)(port, notification, store, sendMessageOnAllBots);
  };

  const configurePort = async portHandler => {
    await (0, _deviceConfig.default)(portHandler, store.sim);
    portHandler.addListener(handlePortIncomingNotification);
  };

  const configureAllPorts = async devicePortHandlers => Promise.all(devicePortHandlers.map(configurePort));

  const startSimStatusPolling = (devicePortHandlers, pollingTime) => {
    setInterval(() => {
      Promise.all(devicePortHandlers.map(port => (0, _deviceConfig.default)(port, store.sim)));
    }, pollingTime);
  };

  return {
    async start() {
      bots = botFactory.createBots();
      await startBots(bots);
      sendMessageOnAllBots((0, _message.createBootingMessage)());
      devicePortHandlers = await devicePortsFactory.createPorts();
      await configureAllPorts(devicePortHandlers);
      await startSimStatusPolling(devicePortHandlers, (0, _config.getSimStatusPollingTime)());
      sendMessageOnAllBots((0, _message.createBootDoneMessage)());
    }

  };
};

var _default = createSimtronController;
exports.default = _default;