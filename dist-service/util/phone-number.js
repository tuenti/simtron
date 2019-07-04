"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.formatPhoneNumber = void 0;

var _googleLibphonenumber = _interopRequireDefault(require("google-libphonenumber"));

var _matcher = require("./matcher");

var _config = require("../config");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const phoneUtil = _googleLibphonenumber.default.PhoneNumberUtil.getInstance();

const mapFormat = format => format === 'national' ? _googleLibphonenumber.default.PhoneNumberFormat.NATIONAL : _googleLibphonenumber.default.PhoneNumberFormat.INTERNATIONAL;

const applyCustomFormat = (phoneNumber, country, brand) => {
  const customFormatter = (0, _config.getPhoneNumberCustomFormatters)(country, brand);
  return customFormatter ? phoneNumber.replace(new RegExp(customFormatter.regexp, 'g'), customFormatter.replaceValue) : phoneNumber;
};

const formatPhoneNumber = (phoneNumber, country, brand, format) => {
  const number = phoneUtil.parseAndKeepRawInput(phoneNumber, country);
  const numberFormat = mapFormat(format);
  const formattedNumber = phoneUtil.format(number, numberFormat).replace(_matcher.NON_DIGITS, '');
  return format === 'national' ? applyCustomFormat(formattedNumber, country, brand) : formattedNumber;
};

exports.formatPhoneNumber = formatPhoneNumber;