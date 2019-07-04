"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createErrorMessage = exports.createSuccessFeedbackMessage = exports.createQuestionMessage = exports.createPortActivityNotificationMessage = exports.createNewSmsNotificationMessage = exports.createUnknownSimsExistenceNotificationMessage = exports.createSimNetworkStatusChangedNotificationMessage = exports.createSimRemovedNotificationMessage = exports.createSimInsertedNotificationMessage = exports.createSimDetailsContentMessage = exports.createCatalogAnswerContentMessage = exports.createSimDetailsAnswerMessage = exports.createCatalogAnswerMessage = exports.createBootDoneMessage = exports.createBootingMessage = exports.USER_MENTION = void 0;

var _config = require("../../config");

var _handler = require("../../questionary/handler");

var _messageType = require("./message-type");

const USER_MENTION = '[USER_MENTION]';
exports.USER_MENTION = USER_MENTION;

const createBootingMessage = () => ({
  type: _messageType.MessageType.NOTIFY_BOOTING,
  text: 'Booting ...'
});

exports.createBootingMessage = createBootingMessage;

const createBootDoneMessage = () => ({
  type: _messageType.MessageType.NOTIFY_BOOT_DONE,
  text: 'Ready'
});

exports.createBootDoneMessage = createBootDoneMessage;

const createCatalogAnswerMessage = () => ({
  type: _messageType.MessageType.ANSWER_CATALOG,
  text: `:+1: *${USER_MENTION}* getting catalog info.`
});

exports.createCatalogAnswerMessage = createCatalogAnswerMessage;

const createSimDetailsAnswerMessage = () => ({
  type: _messageType.MessageType.ANSWER_SIM_DETAILS,
  text: `:+1: *${USER_MENTION}* getting details.`
});

exports.createSimDetailsAnswerMessage = createSimDetailsAnswerMessage;

const createSimIdentityLine = ({
  icc,
  displayNumber
}) => displayNumber ? displayNumber : `Unknown sim with icc ${icc}`;

const createLineInfo = ({
  brand,
  lineType
}) => brand && lineType ? `${brand} ${lineType}` : '';

const createCatalogAnswerContentMessage = sims => {
  return {
    type: _messageType.MessageType.ANSWER_CATALOG_CONTENT,
    textLines: sims.map(({
      sim,
      isVisible
    }) => {
      const simId = createSimIdentityLine(sim);
      const lineInfo = createLineInfo(sim);
      const visibility = isVisible ? '' : ':no_entry_sign:';
      return sim.networkStatus.isWorking ? `${(0, _config.getCountryFlag)(sim.country)} *${simId}* ${lineInfo} ${visibility}` : `${(0, _config.getCountryFlag)(sim.country)} *~${simId}~* ${lineInfo}  ${visibility}`;
    })
  };
};

exports.createCatalogAnswerContentMessage = createCatalogAnswerContentMessage;

const createSimDetailsContentMessage = (sim, notificationText) => {
  const simId = createSimIdentityLine(sim);
  const lineInfo = createLineInfo(sim);
  const simDataPart = lineInfo ? `icc: ${sim.icc}, msisdn: ${sim.msisdn} ` : '';
  const fields = lineInfo ? [{
    name: 'Line Info',
    value: lineInfo
  }, {
    name: 'Network Status',
    value: sim.networkStatus.name
  }] : [{
    name: 'Network Status',
    value: sim.networkStatus.name
  }];
  return {
    type: _messageType.MessageType.SIM_DETAILS_CONTENT,
    text: `${sim.networkStatus.isWorking ? `${(0, _config.getCountryFlag)(sim.country)} *${simId}* ${simDataPart}` : `${(0, _config.getCountryFlag)(sim.country)} *~${simId}~* ${simDataPart}`} ${notificationText ? notificationText : ''}`,
    attachments: [{
      fields
    }]
  };
};

exports.createSimDetailsContentMessage = createSimDetailsContentMessage;

const createSimInsertedNotificationMessage = sim => createSimDetailsContentMessage(sim, 'inserted :+1:');

exports.createSimInsertedNotificationMessage = createSimInsertedNotificationMessage;

const createSimRemovedNotificationMessage = sim => createSimDetailsContentMessage(sim, 'removed :+1:');

exports.createSimRemovedNotificationMessage = createSimRemovedNotificationMessage;

const createSimNetworkStatusChangedNotificationMessage = sim => createSimDetailsContentMessage(sim, 'network status changed');

exports.createSimNetworkStatusChangedNotificationMessage = createSimNetworkStatusChangedNotificationMessage;

const createUnknownSimsExistenceNotificationMessage = unknownSims => {
  return {
    type: _messageType.MessageType.NOTIFY_UNKNOWN_SIM_EXISTENCE,
    textLines: unknownSims.map(sim => `Icc: *${sim.icc}*`)
  };
};

exports.createUnknownSimsExistenceNotificationMessage = createUnknownSimsExistenceNotificationMessage;

const createNewSmsNotificationMessage = (sim, smsText) => {
  const simId = createSimIdentityLine(sim);
  const lineInfo = createLineInfo(sim);
  return {
    type: _messageType.MessageType.NOTIFY_SMS_RECEIVED,
    textLines: [`${(0, _config.getCountryFlag)(sim.country)} *${simId}* ${lineInfo}`, smsText]
  };
};

exports.createNewSmsNotificationMessage = createNewSmsNotificationMessage;

const createPortActivityNotificationMessage = sim => {
  const simId = createSimIdentityLine(sim);
  const lineInfo = createLineInfo(sim);
  return {
    type: _messageType.MessageType.NOTIFY_PORT_ACTIVITY_DETECTED,
    textLines: [`${(0, _config.getCountryFlag)(sim.country)} *${simId}* ${lineInfo}`]
  };
};

exports.createPortActivityNotificationMessage = createPortActivityNotificationMessage;

const createQuestionMessage = question => {
  if ((0, _handler.isSelectionQuestion)(question)) {
    return {
      type: _messageType.MessageType.SINGLE_SELECTION_QUESTION,
      textLines: [question.text, ...(question.options ? question.options.map(option => option['text']) : [])]
    };
  } else {
    return {
      type: _messageType.MessageType.FREE_TEXT_QUESTION,
      textLines: [question.text]
    };
  }
};

exports.createQuestionMessage = createQuestionMessage;

const createSuccessFeedbackMessage = text => ({
  type: _messageType.MessageType.SUCCESS,
  text
});

exports.createSuccessFeedbackMessage = createSuccessFeedbackMessage;

const createErrorMessage = text => ({
  type: _messageType.MessageType.ERROR,
  text
});

exports.createErrorMessage = createErrorMessage;