"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRequestCatalogSpeech = void 0;

var _messageType = require("../model/message-type");

var _text = require("../../util/text");

var _config = require("../../config");

var _message = require("../model/message");

var _delay = _interopRequireDefault(require("../../util/delay"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const createRequestCatalogSpeech = () => ({
  messageType: _messageType.MessageType.REQUEST_CATALOG,
  messageIdentifier: receivedMessage => (0, _text.existSomeWordInText)((0, _config.getBotNames)(), receivedMessage.messageText),
  action: (receivedMessage, store, answerMessage) => {
    answerMessage((0, _message.createCatalogAnswerMessage)(), receivedMessage);
    const allSimData = store.sim.getSimCatalog();
    const allInUseSims = store.sim.getAllSimsInUse(receivedMessage.isFromAdmin).filter(sim => !!sim.msisdn).map(simInUse => {
      const foundSimData = allSimData.find(simData => simInUse.icc === simData.icc);
      return {
        sim: simInUse,
        isVisible: !foundSimData || foundSimData && foundSimData.isVisible
      };
    });
    (0, _delay.default)(() => answerMessage((0, _message.createCatalogAnswerContentMessage)(allInUseSims), receivedMessage), (0, _config.getBotMessageSequenceEnsuringTime)()).then(() => (0, _delay.default)(() => {
      const allUnknownSims = store.sim.getAllUnknownSimsInUse();

      if (receivedMessage.isFromAdmin && allUnknownSims.length > 0) {
        answerMessage((0, _message.createUnknownSimsExistenceNotificationMessage)(allUnknownSims), receivedMessage);
      }
    }, (0, _config.getBotMessageSequenceEnsuringTime)()));
  }
});

exports.createRequestCatalogSpeech = createRequestCatalogSpeech;