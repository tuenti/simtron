"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStartForceSimOperatorSpeech = void 0;

var _messageType = require("../model/message-type");

var _config = require("../../config");

var _message = require("../model/message");

var _delay = _interopRequireDefault(require("../../util/delay"));

var _forceSimOperator = _interopRequireDefault(require("../../questionary/force-sim-operator"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const FORCE_OPERATOR_COMMAND1 = 'force';
const FORCE_OPERATOR_COMMAND2 = 'operator';

const getMsisdnOfSimToForceOperator = messageText => {
  const words = messageText.split(' ');
  const [botName, command1, command2, msisdn] = words;
  return (0, _config.getBotNames)().includes(botName) && command1 === FORCE_OPERATOR_COMMAND1 && command2 === FORCE_OPERATOR_COMMAND2 && !!msisdn ? msisdn : null;
};

const isStartForceSimOperatorMessage = messageText => getMsisdnOfSimToForceOperator(messageText) !== null;

const createStartForceSimOperatorSpeech = () => ({
  messageType: _messageType.MessageType.START_FORCE_SIM_OPERATOR,
  messageIdentifier: receivedMessage => isStartForceSimOperatorMessage(receivedMessage.messageText),
  isAdmin: true,
  action: (receivedMessage, store, answerMessage, sendCommand) => {
    const msisdn = getMsisdnOfSimToForceOperator(receivedMessage.messageText);

    if (msisdn) {
      const simInUse = store.sim.findSimInUseByMsisdn(msisdn, receivedMessage.isFromAdmin);

      if (simInUse) {
        answerMessage((0, _message.createSuccessFeedbackMessage)(`*Ok*, lets search for available operators for the sim with icc: *${simInUse.icc}*\nTo cancel, just type *${(0, _config.getBotDisplayName)()} forget it, please* :wink:`), receivedMessage);
        const questionary = (0, _forceSimOperator.default)(simInUse, sendCommand);
        store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
        (0, _delay.default)(() => questionary.getCurrentQuestion().then(question => {
          if (!questionary.isCanceled()) {
            answerMessage((0, _message.createQuestionMessage)(question), receivedMessage);
          }
        }), (0, _config.getBotMessageSequenceEnsuringTime)());
      } else {
        answerMessage((0, _message.createErrorMessage)(":-1: I don't know this phone number."), receivedMessage);
      }
    }
  }
});

exports.createStartForceSimOperatorSpeech = createStartForceSimOperatorSpeech;