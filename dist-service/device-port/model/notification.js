"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.MODEM_RESTART_ID = exports.SIM_READY_ID = exports.NETWORK_STATUS_NOTIFICATION_ID = exports.NEW_SMS_NOTIFICATION_ID = void 0;

var _networkStatus = require("./network-status");

var _matcher = require("../../util/matcher");

const NEW_SMS_NOTIFICATION_ID = '+CMTI:';
exports.NEW_SMS_NOTIFICATION_ID = NEW_SMS_NOTIFICATION_ID;
const NETWORK_STATUS_NOTIFICATION_ID = '+CREG:';
exports.NETWORK_STATUS_NOTIFICATION_ID = NETWORK_STATUS_NOTIFICATION_ID;
const SIM_READY_ID = 'PB DONE';
exports.SIM_READY_ID = SIM_READY_ID;
const MODEM_RESTART_ID = 'START';
exports.MODEM_RESTART_ID = MODEM_RESTART_ID;

const createSmsReceivedNotification = () => ({
  id: NEW_SMS_NOTIFICATION_ID,
  notificationParser: smsLocationLine => {
    return {
      smsIndex: parseInt(smsLocationLine.match(_matcher.LAST_DIGITS)[0])
    };
  }
});

const createNetworkStatusNotification = () => ({
  id: NETWORK_STATUS_NOTIFICATION_ID,
  notificationParser: networkStatusLine => {
    return {
      networkStatus: (0, _networkStatus.createNetworkStatus)(networkStatusLine)
    };
  }
});

const createModemRestartNotification = () => ({
  id: MODEM_RESTART_ID
});

const createSimReadyNotification = () => ({
  id: SIM_READY_ID
});

var _default = [createSmsReceivedNotification(), createNetworkStatusNotification(), createSimReadyNotification(), createModemRestartNotification()];
exports.default = _default;