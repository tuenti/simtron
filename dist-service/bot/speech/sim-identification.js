"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStartSimIdentificationSpeech = exports.SIM_IDENTIFICATION_COMMAND = void 0;

var _messageType = require("../model/message-type");

var _config = require("../../config");

var _message = require("../model/message");

var _simId = _interopRequireDefault(require("../../questionary/sim-id"));

var _delay = _interopRequireDefault(require("../../util/delay"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SIM_IDENTIFICATION_COMMAND = 'register';
exports.SIM_IDENTIFICATION_COMMAND = SIM_IDENTIFICATION_COMMAND;

const getSimIdentificationIndex = messageText => {
  const words = messageText.split(' ');
  const [botName, command, index = undefined] = words;
  const simIndex = index !== undefined ? parseInt(index) : 1;
  return (0, _config.getBotNames)().includes(botName) && command === SIM_IDENTIFICATION_COMMAND ? simIndex - 1 : null;
};

const isSimIdentificationStartMessage = messageText => getSimIdentificationIndex(messageText) !== null;

const createStartSimIdentificationSpeech = () => ({
  messageType: _messageType.MessageType.START_SIM_IDENTIFICATION,
  messageIdentifier: receivedMessage => isSimIdentificationStartMessage(receivedMessage.messageText),
  isAdmin: true,
  action: (receivedMessage, store, answerMessage) => {
    const simIndex = getSimIdentificationIndex(receivedMessage.messageText);
    const allUnknownSims = store.sim.getAllUnknownSimsInUse();

    if (!simIndex || simIndex >= 0 && simIndex < allUnknownSims.length) {
      const sim = allUnknownSims[simIndex || 0];
      answerMessage((0, _message.createSuccessFeedbackMessage)(`*Ok*, lets identify the sim card with icc: *${sim.icc}*\nTo cancel, just type *${(0, _config.getBotDisplayName)()} forget it, please* :wink:`), receivedMessage);
      const questionary = (0, _simId.default)(sim, store);
      store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
      (0, _delay.default)(() => questionary.getCurrentQuestion().then(question => answerMessage((0, _message.createQuestionMessage)(question), receivedMessage)), (0, _config.getBotMessageSequenceEnsuringTime)());
    } else {
      answerMessage((0, _message.createErrorMessage)(':-1: Invalid SIM index.'), receivedMessage);
    }
  }
});

exports.createStartSimIdentificationSpeech = createStartSimIdentificationSpeech;