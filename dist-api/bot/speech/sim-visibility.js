"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createHideSimSpeech = exports.createShowSimSpeech = void 0;

var _messageType = require("../model/message-type");

var _message = require("../model/message");

var _config = require("../../config");

const SHOW_SIM_COMMAND = 'show';
const HIDE_SIM_COMMAND = 'hide';

const getMsisdn = (messageText, commandWord) => {
  const words = messageText.split(' ');
  const [botName, command, msisdn] = words;
  return (0, _config.getBotNames)().includes(botName) && command === commandWord && !!msisdn ? msisdn : null;
};

const isShowSimMessage = messageText => getMsisdn(messageText, SHOW_SIM_COMMAND) !== null;

const isHideSimMessage = messageText => getMsisdn(messageText, HIDE_SIM_COMMAND) !== null;

const changeSimVisibility = async (visibilityCommand, receivedMessage, store, answerMessage) => {
  const msisdn = getMsisdn(receivedMessage.messageText, visibilityCommand);

  if (msisdn) {
    const simToEdit = store.sim.findSimInCatalogByMsisdn(msisdn);

    if (simToEdit) {
      store.sim.saveSimInCatalog(simToEdit.icc, simToEdit.msisdn, simToEdit.displayNumber, simToEdit.brand, simToEdit.country, simToEdit.lineType, visibilityCommand === SHOW_SIM_COMMAND);
      answerMessage((0, _message.createSuccessFeedbackMessage)(':+1: Sim visibility updated.'), receivedMessage);
    } else {
      answerMessage((0, _message.createErrorMessage)(':-1: We dont have any **sim** card with this **msisdn**.'), receivedMessage);
    }
  }
};

const createShowSimSpeech = () => ({
  messageType: _messageType.MessageType.SHOW_SIM,
  messageIdentifier: receivedMessage => isShowSimMessage(receivedMessage.messageText),
  action: async (receivedMessage, store, answerMessage) => changeSimVisibility(SHOW_SIM_COMMAND, receivedMessage, store, answerMessage)
});

exports.createShowSimSpeech = createShowSimSpeech;

const createHideSimSpeech = () => ({
  messageType: _messageType.MessageType.HIDE_SIM,
  messageIdentifier: receivedMessage => isHideSimMessage(receivedMessage.messageText),
  action: async (receivedMessage, store, answerMessage) => changeSimVisibility(HIDE_SIM_COMMAND, receivedMessage, store, answerMessage)
});

exports.createHideSimSpeech = createHideSimSpeech;