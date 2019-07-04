"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.throwableError = exports.DEVICE_CONFIGURATION_ERROR = exports.NOTIFICATION_HANDLER_NOT_FOUND = exports.SIM_NOT_PRESENT = exports.COMMAND_NOT_RESPONDING = exports.MISSING_SMS_FIELDS = exports.PORT_NOT_FOUND = exports.INVALID_SIM_STATUS_DATA = exports.NON_RESPONSIVE_PORTS = void 0;
const NON_RESPONSIVE_PORTS = 'non-responsive-ports';
exports.NON_RESPONSIVE_PORTS = NON_RESPONSIVE_PORTS;
const INVALID_SIM_STATUS_DATA = 'invalid-sim-status-data';
exports.INVALID_SIM_STATUS_DATA = INVALID_SIM_STATUS_DATA;
const PORT_NOT_FOUND = 'port-not-found';
exports.PORT_NOT_FOUND = PORT_NOT_FOUND;
const MISSING_SMS_FIELDS = 'missing-sms-fields';
exports.MISSING_SMS_FIELDS = MISSING_SMS_FIELDS;
const COMMAND_NOT_RESPONDING = 'command-not-responding';
exports.COMMAND_NOT_RESPONDING = COMMAND_NOT_RESPONDING;
const SIM_NOT_PRESENT = 'sim-not-present';
exports.SIM_NOT_PRESENT = SIM_NOT_PRESENT;
const NOTIFICATION_HANDLER_NOT_FOUND = 'notification-handler-not-found';
exports.NOTIFICATION_HANDLER_NOT_FOUND = NOTIFICATION_HANDLER_NOT_FOUND;
const DEVICE_CONFIGURATION_ERROR = 'device-configuration-error';
exports.DEVICE_CONFIGURATION_ERROR = DEVICE_CONFIGURATION_ERROR;

const Error = (reason, description) => ({
  reason,
  description
});

const throwableError = (reason, description) => JSON.stringify(Error(reason, description));

exports.throwableError = throwableError;
var _default = Error;
exports.default = _default;