"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.SlackMessageContainer = void 0;

var _messageType = require("../model/message-type");

var _message = require("../model/message");

var _config = require("../../config");

var _simIdentification = require("../speech/sim-identification");

let SlackMessageContainer;
exports.SlackMessageContainer = SlackMessageContainer;

(function (SlackMessageContainer) {
  SlackMessageContainer["PLAIN"] = "plain";
  SlackMessageContainer["RICH"] = "rich";
})(SlackMessageContainer || (exports.SlackMessageContainer = SlackMessageContainer = {}));

const adaptMessage = (message, incomingMessage) => {
  switch (message.type) {
    case _messageType.MessageType.NOTIFY_BOOTING:
    case _messageType.MessageType.NOTIFY_BOOT_DONE:
      return {
        container: SlackMessageContainer.PLAIN,
        text: `:rocket: ${message.text}`,
        isPrivate: false
      };

    case _messageType.MessageType.ANSWER_CATALOG:
      return incomingMessage ? {
        container: SlackMessageContainer.RICH,
        text: message.text ? message.text.replace(_message.USER_MENTION, `@${incomingMessage.userName}`) : '',
        isPrivate: false,
        replyOn: incomingMessage.channel
      } : null;

    case _messageType.MessageType.ANSWER_CATALOG_CONTENT:
      const messageText = message.textLines && message.textLines.length > 0 ? message.textLines.reduce((text, line) => `${text}\n${line}`, '') : 'No SIM cards detected.';
      return incomingMessage ? {
        container: SlackMessageContainer.PLAIN,
        text: messageText,
        replyOn: incomingMessage.channel,
        isPrivate: false
      } : null;

    case _messageType.MessageType.ANSWER_SIM_DETAILS:
      return incomingMessage ? {
        container: SlackMessageContainer.RICH,
        text: message.text ? message.text.replace(_message.USER_MENTION, `@${incomingMessage.userName}`) : '',
        replyOn: incomingMessage.channel,
        isPrivate: false
      } : null;

    case _messageType.MessageType.SIM_DETAILS_CONTENT:
      return {
        container: SlackMessageContainer.RICH,
        text: message.text ? message.text : '',
        attachments: message.attachments ? message.attachments.map(attachment => ({
          fields: attachment.fields.map(field => ({
            title: field.name,
            value: field.value,
            short: true
          }))
        })) : [],
        replyOn: incomingMessage ? incomingMessage.channel : undefined,
        isPrivate: false
      };

    case _messageType.MessageType.NOTIFY_UNKNOWN_SIM_EXISTENCE:
      return incomingMessage ? {
        container: SlackMessageContainer.RICH,
        isPrivate: true,
        replyOn: incomingMessage.channel,
        text: message.textLines && message.textLines.length > 1 ? `There are *${message.textLines.length} unknown SIM cards* needing to be identified:` : 'There is an *unknown SIM* card needing to be identified:',
        attachments: message.textLines ? message.textLines.map((line, index) => ({
          color: '#D3D3D3',
          text: line,
          footer: `To identify this sim, type: *${(0, _config.getBotDisplayName)()} ${_simIdentification.SIM_IDENTIFICATION_COMMAND} ${message.textLines && message.textLines.length > 1 ? index + 1 : ''}*`
        })) : []
      } : null;

    case _messageType.MessageType.NOTIFY_SMS_RECEIVED:
      return {
        container: SlackMessageContainer.RICH,
        text: message.textLines && message.textLines.length > 0 ? message.textLines[0] : 'Empty SMS',
        isPrivate: false,
        attachments: [{
          author_name: ':envelope_with_arrow: New sms:',
          color: '#D3D3D3',
          text: message.textLines && message.textLines.length > 1 ? message.textLines[1] : ''
        }]
      };

    case _messageType.MessageType.NOTIFY_PORT_ACTIVITY_DETECTED:
      return {
        container: SlackMessageContainer.RICH,
        text: message.textLines && message.textLines.length > 0 ? message.textLines[0] : 'Activity detected on port.',
        isPrivate: false,
        attachments: [{
          color: '#D3D3D3',
          text: ':ballot_box_with_ballot: Activity detected on simtron device affecting this *SIM* card'
        }]
      };

    case _messageType.MessageType.FREE_TEXT_QUESTION:
      const [question] = message.textLines ? message.textLines : [''];
      return incomingMessage ? {
        container: SlackMessageContainer.PLAIN,
        text: question,
        replyOn: incomingMessage.channel,
        isPrivate: false
      } : null;

    case _messageType.MessageType.SINGLE_SELECTION_QUESTION:
      const [questionText, ...options] = message.textLines ? message.textLines : [''];
      return incomingMessage ? {
        container: SlackMessageContainer.RICH,
        text: questionText,
        replyOn: incomingMessage.channel,
        isPrivate: false,
        attachments: options.map((option, index) => ({
          color: '#D3D3D3',
          text: `${index + 1}) ${option}`
        }))
      } : null;

    case _messageType.MessageType.SUCCESS:
      return incomingMessage ? {
        container: SlackMessageContainer.PLAIN,
        isPrivate: true,
        replyOn: incomingMessage.channel,
        text: `${message.text ? message.text.replace(_message.USER_MENTION, `@${incomingMessage.userName}`) : ''}`
      } : null;

    case _messageType.MessageType.ERROR:
      return incomingMessage ? {
        container: SlackMessageContainer.PLAIN,
        isPrivate: true,
        replyOn: incomingMessage.channel,
        text: `${message.text ? message.text.replace(_message.USER_MENTION, `@${incomingMessage.userName}`) : ''}`
      } : null;

    default:
      return null;
  }
};

var _default = adaptMessage;
exports.default = _default;