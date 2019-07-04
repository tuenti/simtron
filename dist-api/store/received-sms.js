"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _logger = _interopRequireDefault(require("../util/logger"));

var _error = _interopRequireWildcard(require("../util/error"));

var _config = require("../config");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createSms = (senderMsisdn, time, smsText) => {
  return {
    senderMsisdn,
    time,
    smsText
  };
};

let store = {};

const createSmsStore = () => ({
  getAllSms(portId) {
    return store[portId];
  },

  addSms(senderMsisdn, time, smsText, portId) {
    if (senderMsisdn && time && smsText) {
      const sms = createSms(senderMsisdn, time, smsText);

      if (store[portId]) {
        store[portId].push(sms);
      } else {
        store[portId] = [sms];
      }

      if (store[portId].length > (0, _config.getSmsMemoryMaxCount)()) {
        store[portId].shift();
      }
    } else {
      _logger.default.error((0, _error.default)(_error.MISSING_SMS_FIELDS, `Check sms fields, senderMsisdn: '${senderMsisdn}', time: '${time}', smsText '${smsText}'`));
    }
  }

});

var _default = createSmsStore;
exports.default = _default;