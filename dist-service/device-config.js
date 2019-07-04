"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SmsMode = void 0;

var _command = require("./device-port/model/command");

var _parserToken = require("./device-port/model/parser-token");

var _logger = _interopRequireDefault(require("./util/logger"));

var _error = _interopRequireWildcard(require("./util/error"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

let SmsMode;
exports.SmsMode = SmsMode;

(function (SmsMode) {
  SmsMode[SmsMode["NONE"] = 0] = "NONE";
  SmsMode[SmsMode["SMS_TEXT_MODE"] = 1] = "SMS_TEXT_MODE";
  SmsMode[SmsMode["SMS_PDU_MODE"] = 2] = "SMS_PDU_MODE";
})(SmsMode || (exports.SmsMode = SmsMode = {}));

let pendingRequests = {};

const getSimIcc = async portHandler => {
  try {
    const readIccFromSimCommandResponse = await portHandler.sendCommand((0, _command.createReadIccDirectCardAccessCommand)());

    if (readIccFromSimCommandResponse.isSuccessful) {
      return readIccFromSimCommandResponse.icc;
    }

    const readIccFromModuleCommandResponse = await portHandler.sendCommand((0, _command.createReadIccCommand)());

    if (readIccFromModuleCommandResponse.isSuccessful) {
      return readIccFromModuleCommandResponse.icc;
    }
  } catch (e) {}

  return null;
};

const getSimStatus = async portHandler => {
  const icc = await getSimIcc(portHandler);

  if (icc) {
    const getNetworkStatusCommandResponse = await portHandler.sendCommand((0, _command.createGetNetworkStatusCommand)());

    if (getNetworkStatusCommandResponse.isSuccessful) {
      return {
        icc,
        networkStatus: getNetworkStatusCommandResponse.networkStatus
      };
    }
  }

  return null;
};

const configureSmsMode = async portHandler => {
  const supportedEncodingsResponse = await portHandler.sendCommand((0, _command.createGetAllowedEncodingsCommand)());

  if (supportedEncodingsResponse.isSuccessful) {
    if (supportedEncodingsResponse.encodings.includes(_parserToken.UTF16_ENCODING)) {
      const enableTextModeCommandResponse = await portHandler.sendCommand((0, _command.createSetSmsTextModeCommand)());
      const setUtf16EncodingCommandResponse = await portHandler.sendCommand((0, _command.createSetUtf16EncodingCommand)());
      const textModeConfigured = enableTextModeCommandResponse.isSuccessful && setUtf16EncodingCommandResponse.isSuccessful;

      if (textModeConfigured) {
        return SmsMode.SMS_TEXT_MODE;
      }
    } else {
      const enablePduModeCommandResponse = await portHandler.sendCommand((0, _command.createSetSmsPduModeCommand)());

      if (enablePduModeCommandResponse.isSuccessful) {
        return SmsMode.SMS_PDU_MODE;
      }
    }
  }

  return SmsMode.NONE;
};

const configureDevice = async (portHandler, simStore) => {
  const enableEchoResponse = await portHandler.sendCommand((0, _command.createSetEchoModeCommand)());

  if (enableEchoResponse.isSuccessful) {
    const enableNetworkStatusNotificationsResponse = await portHandler.sendCommand((0, _command.createEnableNetworkStatusNotificationsCommand)());
    const simStatus = await getSimStatus(portHandler);

    if (enableNetworkStatusNotificationsResponse.isSuccessful && simStatus) {
      const smsMode = await configureSmsMode(portHandler);

      if (smsMode !== SmsMode.NONE) {
        const enableSmsNotificationsResponse = await portHandler.sendCommand((0, _command.createEnableSmsNotificationsCommand)());
        const simConfigured = enableSmsNotificationsResponse.isSuccessful && enableNetworkStatusNotificationsResponse.isSuccessful;

        if (simConfigured) {
          simStore.setSimInUse(simStatus.icc, simStatus.networkStatus, smsMode, portHandler.portId);
          return true;
        }
      }

      _logger.default.error((0, _error.default)(_error.DEVICE_CONFIGURATION_ERROR, `Device configuration error on port: ${portHandler.portId}`));
    }
  }

  simStore.setSimRemoved(portHandler.portId);
  return false;
};

const scheduleDeviceConfiguration = async (portHandler, simStore, timeOutMs = 0) => new Promise(resolve => {
  if (!pendingRequests[portHandler.portId] || timeOutMs === 0) {
    pendingRequests[portHandler.portId] = setTimeout(async () => {
      const oldSim = simStore.findSimInUseByPortId(portHandler.portId);
      await configureDevice(portHandler, simStore);
      pendingRequests[portHandler.portId] = undefined;
      resolve({
        oldSim,
        newSim: simStore.findSimInUseByPortId(portHandler.portId)
      });
    }, timeOutMs);
  } else {
    const currentSim = simStore.findSimInUseByPortId(portHandler.portId);
    resolve({
      oldSim: currentSim,
      newSim: currentSim
    });
  }
});

var _default = scheduleDeviceConfiguration;
exports.default = _default;