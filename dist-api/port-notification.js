"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _notification = require("./device-port/model/notification");

var _logger = _interopRequireDefault(require("./util/logger"));

var _error = _interopRequireWildcard(require("./util/error"));

var _command = require("./device-port/model/command");

var _message = require("./bot/model/message");

var _deviceConfig = _interopRequireDefault(require("./device-config"));

var _config = require("./config");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const handleSimManipulation = (simDiff, sendMessage) => {
  if (simDiff.oldSim === null && simDiff.newSim !== null) {
    sendMessage((0, _message.createSimInsertedNotificationMessage)(simDiff.newSim));
  } else if (simDiff.oldSim !== null && simDiff.newSim === null) {
    sendMessage((0, _message.createSimRemovedNotificationMessage)(simDiff.oldSim));
  } else if (simDiff.oldSim !== null && simDiff.newSim !== null && simDiff.oldSim.icc !== simDiff.newSim.icc) {
    sendMessage((0, _message.createSimRemovedNotificationMessage)(simDiff.oldSim));
    delayed(() => {
      sendMessage((0, _message.createSimInsertedNotificationMessage)(simDiff.newSim));
    }, getBotMessageSequenceEnsuringTime());
  }
};

const notificationHandlers = [{
  notificationIds: [_notification.NEW_SMS_NOTIFICATION_ID],
  action: async (port, notification, store, sendMessage) => {
    const {
      portId
    } = port;
    const {
      smsIndex
    } = notification;
    const sim = store.sim.findSimInUseByPortId(portId);

    if (sim) {
      const readSmsResponse = await port.sendCommand((0, _command.createReadSmsCommand)(smsIndex, sim.smsMode));
      const {
        senderMsisdn,
        time,
        smsText
      } = readSmsResponse;
      store.sms.addSms(senderMsisdn, time, smsText, portId);
      sendMessage((0, _message.createNewSmsNotificationMessage)(sim, smsText));
      port.sendCommand((0, _command.createDeleteAllSmsCommand)());

      _logger.default.debug(`Sms received on port: ${portId}, from: ${senderMsisdn}, text: ${smsText}`);
    } else {
      _logger.default.error((0, _error.default)(_error.SIM_NOT_PRESENT, `Sms arrived on port: ${portId}, no sim on port`));
    }
  }
}, {
  notificationIds: [_notification.NETWORK_STATUS_NOTIFICATION_ID],
  action: (port, notification, store, sendMessage) => {
    const {
      portId
    } = port;
    const {
      networkStatus
    } = notification;
    store.sim.updateSimNetworkStatus(networkStatus, portId);
    const sim = store.sim.findSimInUseByPortId(portId);

    if (sim) {
      sendMessage((0, _message.createSimNetworkStatusChangedNotificationMessage)(sim));
    }

    _logger.default.debug(`Network status received on port: ${portId}, new status: ${notification.networkStatus.name}`);
  }
}, {
  notificationIds: [_notification.MODEM_RESTART_ID, _notification.SIM_READY_ID],
  action: async (port, notification, store, sendMessage) => {
    const {
      portId
    } = port;
    handleSimManipulation((await (0, _deviceConfig.default)(port, store.sim)), sendMessage);
    handleSimManipulation((await (0, _deviceConfig.default)(port, store.sim, (0, _config.getSimStatusRequestScheduleTime)())), sendMessage);

    _logger.default.debug(`Sim manipulation notification received on port: ${portId}`);
  }
}];

const handleNotification = (port, notification, store, sendMessage) => {
  const {
    portId
  } = port;
  const notificationHandler = notificationHandlers.find(handler => handler.notificationIds.includes(notification.id));

  if (notificationHandler) {
    notificationHandler.action(port, notification, store, sendMessage);
  } else {
    _logger.default.error((0, _error.default)(_error.NOTIFICATION_HANDLER_NOT_FOUND, `Notification handler not found for id: ${notification.id}, port: ${portId}`));
  }
};

var _default = handleNotification;
exports.default = _default;