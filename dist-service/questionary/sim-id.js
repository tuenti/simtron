"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _handler = _interopRequireWildcard(require("./handler"));

var _googleLibphonenumber = _interopRequireDefault(require("google-libphonenumber"));

var _config = require("../config");

var _phoneNumber = require("../util/phone-number");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const ICC_DATA_KEY = 'icc';
const MSISDN_DATA_KEY = 'msisdn';
const BRAND_DATA_KEY = 'brand';
const COUNTRY_DATA_KEY = 'country';
const LINE_TYPE_DATA_KEY = 'line-type';
const IS_VISIBLE_DATA_KEY = 'is-visible';
const INVALID_MSISDN_ERROR = 'invalid-msisdn';

const getCountryQuestionOptions = () => (0, _config.getSupportedCountries)().map(country => ({
  text: `${(0, _config.getCountryFlag)(country)} ${(0, _config.getCountryName)(country)}`,
  value: country
}));

const getBrandQuestionOptions = country => (0, _config.getSupportedBrands)(country).map(brand => ({
  text: brand,
  value: brand
}));

const getLineTypeQuestionOptions = (country, brand) => (0, _config.getSupportedLineTypes)(country, brand).map(lineType => ({
  text: lineType,
  value: lineType
}));

const createIdentifySimQuestionary = ({
  icc
}, store) => (0, _handler.default)({
  questions: [{
    dataId: COUNTRY_DATA_KEY,
    type: 'single-selection',
    text: "Let's start. Can you please select the *country* of the SIM card ?",
    optionsCreator: getCountryQuestionOptions,
    errorMessages: {
      [_handler.INVALID_INDEX]: ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !'
    }
  }, {
    dataId: BRAND_DATA_KEY,
    type: 'single-selection',
    text: '... and the *brand* is ?',
    optionsCreator: previousAnswers => getBrandQuestionOptions(previousAnswers[COUNTRY_DATA_KEY]),
    errorMessages: {
      [_handler.INVALID_INDEX]: ':unamused: Select one please ... type the number of the selected option !'
    }
  }, {
    dataId: MSISDN_DATA_KEY,
    type: 'free-text',
    text: 'Thanks dude! Can you please tell me the *phone number* ?',
    validator: (msisdn, previousAnswers) => {
      const phoneUtil = _googleLibphonenumber.default.PhoneNumberUtil.getInstance();

      const number = phoneUtil.parseAndKeepRawInput(msisdn, previousAnswers[COUNTRY_DATA_KEY]);
      return phoneUtil.isValidNumber(number) ? _handler.NO_ERROR : INVALID_MSISDN_ERROR;
    },
    answerFormatter: (msisdn, previousAnswers) => ({
      national: (0, _phoneNumber.formatPhoneNumber)(msisdn, previousAnswers[COUNTRY_DATA_KEY], previousAnswers[BRAND_DATA_KEY], 'national'),
      international: (0, _phoneNumber.formatPhoneNumber)(msisdn, previousAnswers[COUNTRY_DATA_KEY], previousAnswers[BRAND_DATA_KEY], 'international')
    }),
    errorMessages: {
      [INVALID_MSISDN_ERROR]: ':sleepy: Ops, you must enter a valid *phone number*.'
    }
  }, {
    dataId: LINE_TYPE_DATA_KEY,
    type: 'single-selection',
    text: 'Great! Now I need to know the *line type*',
    optionsCreator: previousAnswers => getLineTypeQuestionOptions(previousAnswers[COUNTRY_DATA_KEY], previousAnswers[BRAND_DATA_KEY]),
    errorMessages: {
      [_handler.INVALID_INDEX]: ":tired_face: I can't accept that! It must be one of these options ... type the number of the selected option !"
    }
  }, {
    dataId: IS_VISIBLE_DATA_KEY,
    type: 'single-selection',
    text: 'Finally ... Do you want to make this sim *available* to allowed users groups ?',
    optionsCreator: () => [{
      text: 'Yes, make it available',
      value: true
    }, {
      text: 'No, hide this sim by now',
      value: false
    }],
    errorMessages: {
      [_handler.INVALID_INDEX]: ":tired_face: I can't accept that! It must be one of these options ... type the number of the selected option !"
    }
  }],
  initialData: [{
    dataId: ICC_DATA_KEY,
    value: icc
  }],
  finishCallback: responses => store.sim.saveSimInCatalog(responses[ICC_DATA_KEY], responses[MSISDN_DATA_KEY].international, responses[MSISDN_DATA_KEY].national, responses[BRAND_DATA_KEY], responses[COUNTRY_DATA_KEY], responses[LINE_TYPE_DATA_KEY], responses[IS_VISIBLE_DATA_KEY]),
  finishFeedbackText: '*Sim* successfully registered :tada:'
});

var _default = createIdentifySimQuestionary;
exports.default = _default;