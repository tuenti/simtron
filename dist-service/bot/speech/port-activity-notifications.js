"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createDisablePortActivityNotifications = exports.createEnablePortActivityNotifications = void 0;

var _messageType = require("../model/message-type");

var _message = require("../model/message");

var _config = require("../../config");

const ENABLE_NOTIFICATIONS_COMMAND = 'enable';
const DISABLE_NOTIFICATIONS_COMMAND = 'disable';
const SUBJECT = 'notifications';
const DESCRIPTION = 'activity';

const isCommandMessage = (messageText, commandWord) => {
  const words = messageText.split(' ');
  const [botName, command, description, subject] = words;
  return (0, _config.getBotNames)().includes(botName) && command === commandWord && description === DESCRIPTION && subject === SUBJECT;
};

const isEnablePortActivityNotificationsMessage = messageText => isCommandMessage(messageText, ENABLE_NOTIFICATIONS_COMMAND);

const isDisablePortActivityNotificationsMessage = messageText => isCommandMessage(messageText, DISABLE_NOTIFICATIONS_COMMAND);

const changePortActivityNotifications = async (command, receivedMessage, store, answerMessage) => {
  store.settings.setPortActivityNotificationsStatus(command === ENABLE_NOTIFICATIONS_COMMAND);
  answerMessage((0, _message.createSuccessFeedbackMessage)(command === ENABLE_NOTIFICATIONS_COMMAND ? ':+1: Notifications enabled.' : ':+1: Notifications disabled.'), receivedMessage);
};

const createEnablePortActivityNotifications = () => ({
  messageType: _messageType.MessageType.ENABLE_PORT_ACTIVITY_NOTIFICATIONS,
  messageIdentifier: receivedMessage => isEnablePortActivityNotificationsMessage(receivedMessage.messageText),
  action: (receivedMessage, store, answerMessage) => changePortActivityNotifications(ENABLE_NOTIFICATIONS_COMMAND, receivedMessage, store, answerMessage)
});

exports.createEnablePortActivityNotifications = createEnablePortActivityNotifications;

const createDisablePortActivityNotifications = () => ({
  messageType: _messageType.MessageType.DISABLE_PORT_ACTIVITY_NOTIFICATIONS,
  messageIdentifier: receivedMessage => isDisablePortActivityNotificationsMessage(receivedMessage.messageText),
  action: (receivedMessage, store, answerMessage) => changePortActivityNotifications(DISABLE_NOTIFICATIONS_COMMAND, receivedMessage, store, answerMessage)
});

exports.createDisablePortActivityNotifications = createDisablePortActivityNotifications;