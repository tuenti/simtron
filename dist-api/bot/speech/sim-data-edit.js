"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStartSimDataEditSpeech = void 0;

var _messageType = require("../model/message-type");

var _config = require("../../config");

var _message = require("../model/message");

var _simId = _interopRequireDefault(require("../../questionary/sim-id"));

var _delay = _interopRequireDefault(require("../../util/delay"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const SIM_DATA_EDIT_COMMAND = 'edit';

const getSimDataEditMsisdn = messageText => {
  const words = messageText.split(' ');
  const [botName, command, msisdn] = words;
  return (0, _config.getBotNames)().includes(botName) && command === SIM_DATA_EDIT_COMMAND && !!msisdn ? msisdn : null;
};

const isSimDataEditStartMessage = messageText => getSimDataEditMsisdn(messageText) !== null;

const createStartSimDataEditSpeech = () => ({
  messageType: _messageType.MessageType.START_SIM_DATA_EDIT,
  messageIdentifier: receivedMessage => isSimDataEditStartMessage(receivedMessage.messageText),
  isAdmin: true,
  action: (receivedMessage, store, answerMessage) => {
    const msisdn = getSimDataEditMsisdn(receivedMessage.messageText);

    if (msisdn) {
      const sim = store.sim.findSimInCatalogByMsisdn(msisdn);

      if (sim) {
        answerMessage((0, _message.createSuccessFeedbackMessage)(`*Ok*, lets edit the sim card with icc: *${sim.icc}*\nTo cancel, just type *${(0, _config.getBotDisplayName)()} forget it, please* :wink:`), receivedMessage);
        const questionary = (0, _simId.default)(sim, store);
        store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
        (0, _delay.default)(() => questionary.getCurrentQuestion().then(question => answerMessage((0, _message.createQuestionMessage)(question), receivedMessage)), (0, _config.getBotMessageSequenceEnsuringTime)());
      } else {
        answerMessage((0, _message.createErrorMessage)(":-1: I don't know this phone number."), receivedMessage);
      }
    }
  }
});

exports.createStartSimDataEditSpeech = createStartSimDataEditSpeech;