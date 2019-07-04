"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createStopQuestionarySpeech = exports.createFillQuestionSpeech = void 0;

var _messageType = require("../model/message-type");

var _message = require("../model/message");

var _config = require("../../config");

const QUESIONARY_CANCEL_COMMAND = 'forget';

const isQuestionaryCancelMessage = messageText => {
  const words = messageText.split(' ');
  const [botName, command] = words;
  return (0, _config.getBotNames)().includes(botName) && command === QUESIONARY_CANCEL_COMMAND;
};

const createFillQuestionSpeech = () => ({
  messageType: _messageType.MessageType.FILL_QUESTIONARY,
  messageIdentifier: (receivedMessage, store) => !!store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId),
  action: async (receivedMessage, store, answerMessage) => {
    const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);

    if (questionary) {
      const responseAccepted = await questionary.answerCurrentQuestion(receivedMessage.messageText);

      if (responseAccepted) {
        if (questionary.isFullfilled()) {
          store.questionary.finish(receivedMessage.botId, receivedMessage.userId);
          answerMessage((0, _message.createSuccessFeedbackMessage)(questionary.getFinishFeedbackText()), receivedMessage);
        } else {
          const question = await questionary.getCurrentQuestion();
          answerMessage((0, _message.createQuestionMessage)(question), receivedMessage);
        }
      } else {
        answerMessage((0, _message.createErrorMessage)(questionary.getValidationErrorText()), receivedMessage);
      }
    } else {
      answerMessage((0, _message.createErrorMessage)(':-1: First, you need to aske to start a formulary.'), receivedMessage);
    }
  }
});

exports.createFillQuestionSpeech = createFillQuestionSpeech;

const createStopQuestionarySpeech = () => ({
  messageType: _messageType.MessageType.STOP_QUESTIONARY,
  messageIdentifier: receivedMessage => isQuestionaryCancelMessage(receivedMessage.messageText),
  action: (receivedMessage, store, answerMessage) => {
    const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);

    if (questionary) {
      store.questionary.cancel(receivedMessage.botId, receivedMessage.userId);
      answerMessage((0, _message.createSuccessFeedbackMessage)(':+1: Ok, lets forget about it.'), receivedMessage);
    } else {
      answerMessage((0, _message.createErrorMessage)(":-1: I don't know what I need to forget about, but nevermind, it's ok."), receivedMessage);
    }
  }
});

exports.createStopQuestionarySpeech = createStopQuestionarySpeech;