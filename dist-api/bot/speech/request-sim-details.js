"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestSimDetailsSpeech = void 0;

var _messageType = require("../model/message-type");

var _config = require("../../config");

var _message = require("../model/message");

var _delay = _interopRequireDefault(require("../../util/delay"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SIM_DETAILS_COMMAND = 'details';

const getRequestDetailsPhoneNumber = messageText => {
  const words = messageText.split(' ');
  const [botName, command, phoneNumber] = words;
  return (0, _config.getBotNames)().includes(botName) && command === SIM_DETAILS_COMMAND && !!phoneNumber ? phoneNumber : null;
};

const isRequestSimDetailsMessage = messageText => getRequestDetailsPhoneNumber(messageText) !== null;

const createRequestSimDetailsSpeech = () => ({
  messageType: _messageType.MessageType.REQUEST_SIM_DETAILS,
  messageIdentifier: receivedMessage => isRequestSimDetailsMessage(receivedMessage.messageText),
  action: (receivedMessage, store, answerMessage) => {
    answerMessage((0, _message.createSimDetailsAnswerMessage)(), receivedMessage);
    const phoneNumber = getRequestDetailsPhoneNumber(receivedMessage.messageText);

    if (phoneNumber) {
      const sims = store.sim.findSimsInUseByDisplayNumber(phoneNumber, receivedMessage.isFromAdmin);

      if (sims.length > 0) {
        (0, _delay.default)(() => {
          sims.forEach(sim => answerMessage((0, _message.createSimDetailsContentMessage)(sim), receivedMessage));
        }, (0, _config.getBotMessageSequenceEnsuringTime)());
      } else {
        (0, _delay.default)(() => answerMessage((0, _message.createErrorMessage)(`:-1: Sim not found with phoneNumber *${phoneNumber}*`), receivedMessage), (0, _config.getBotMessageSequenceEnsuringTime)());
      }
    }
  }
});

exports.createRequestSimDetailsSpeech = createRequestSimDetailsSpeech;