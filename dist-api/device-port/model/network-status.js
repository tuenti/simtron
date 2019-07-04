"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createNetworkStatus = exports.getNetworkStatusName = void 0;

var _matcher = require("../../util/matcher");

const UNKNOWN_NETWORK_STATUS_NAME = 'Unknown registration status';
var NetworkStatusId;

(function (NetworkStatusId) {
  NetworkStatusId[NetworkStatusId["NOT_REGISTERED"] = 0] = "NOT_REGISTERED";
  NetworkStatusId[NetworkStatusId["REGISTERED_HOME"] = 1] = "REGISTERED_HOME";
  NetworkStatusId[NetworkStatusId["SEARCHING"] = 2] = "SEARCHING";
  NetworkStatusId[NetworkStatusId["REGISTRATION_DENIED"] = 3] = "REGISTRATION_DENIED";
  NetworkStatusId[NetworkStatusId["UNKNOWN"] = 4] = "UNKNOWN";
  NetworkStatusId[NetworkStatusId["REGISTERED_ROAMING"] = 5] = "REGISTERED_ROAMING";
  NetworkStatusId[NetworkStatusId["REGISTERED_HOME_SMS_ONLY"] = 6] = "REGISTERED_HOME_SMS_ONLY";
  NetworkStatusId[NetworkStatusId["REGISTERED_ROAMING_SMS_ONLY"] = 7] = "REGISTERED_ROAMING_SMS_ONLY";
  NetworkStatusId[NetworkStatusId["REGISTERED_FOR_EMERGENCY_ONLY"] = 8] = "REGISTERED_FOR_EMERGENCY_ONLY";
  NetworkStatusId[NetworkStatusId["REGISTERED_HOME_FOR_CSFB"] = 9] = "REGISTERED_HOME_FOR_CSFB";
  NetworkStatusId[NetworkStatusId["REGISTERED_ROAMING_FOR_CSFB"] = 10] = "REGISTERED_ROAMING_FOR_CSFB";
})(NetworkStatusId || (NetworkStatusId = {}));

const networkStatusName = new Map([[NetworkStatusId.NOT_REGISTERED, 'Not registered'], [NetworkStatusId.REGISTERED_HOME, 'Registered in home network'], [NetworkStatusId.SEARCHING, 'Searching network'], [NetworkStatusId.REGISTRATION_DENIED, 'Registration denied'], [NetworkStatusId.REGISTERED_ROAMING, 'Registered in roaming'], [NetworkStatusId.REGISTERED_HOME_SMS_ONLY, 'Registered in home, SMS only'], [NetworkStatusId.REGISTERED_ROAMING_SMS_ONLY, 'Registered in roaming, SMS only'], [NetworkStatusId.REGISTERED_FOR_EMERGENCY_ONLY, 'Registered, only for emergency'], [NetworkStatusId.REGISTERED_HOME_FOR_CSFB, 'Registered in home network, only CSFB'], [NetworkStatusId.REGISTERED_ROAMING_FOR_CSFB, 'Registered in roaming, only CSFB'], [NetworkStatusId.UNKNOWN, UNKNOWN_NETWORK_STATUS_NAME]]);

const getNetworkStatusName = networkStatusId => networkStatusName.get(networkStatusId) || UNKNOWN_NETWORK_STATUS_NAME;

exports.getNetworkStatusName = getNetworkStatusName;

const createNetworkStatus = networkStatusLine => {
  const matches = networkStatusLine.match(_matcher.LAST_DIGITS);
  const networkStatusId = matches ? parseInt(matches[0]) : NetworkStatusId.UNKNOWN;
  return {
    id: networkStatusId,
    name: getNetworkStatusName(networkStatusId),
    isWorking: [NetworkStatusId.REGISTERED_HOME, NetworkStatusId.REGISTERED_ROAMING, NetworkStatusId.REGISTERED_HOME_SMS_ONLY, NetworkStatusId.REGISTERED_ROAMING_SMS_ONLY].includes(networkStatusId)
  };
};

exports.createNetworkStatus = createNetworkStatus;