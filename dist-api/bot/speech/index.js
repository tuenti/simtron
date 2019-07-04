"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _requestCatalog = require("./request-catalog");

var _simDataEdit = require("./sim-data-edit");

var _forceSimOperator = require("./force-sim-operator");

var _simIdentification = require("./sim-identification");

var _requestSimDetails = require("./request-sim-details");

var _questionary = require("./questionary");

var _simVisibility = require("./sim-visibility");

var _portActivityNotifications = require("./port-activity-notifications");

const speeches = [(0, _questionary.createStopQuestionarySpeech)(), (0, _questionary.createFillQuestionSpeech)(), (0, _simIdentification.createStartSimIdentificationSpeech)(), (0, _forceSimOperator.createStartForceSimOperatorSpeech)(), (0, _simDataEdit.createStartSimDataEditSpeech)(), (0, _simVisibility.createHideSimSpeech)(), (0, _simVisibility.createShowSimSpeech)(), (0, _requestSimDetails.createRequestSimDetailsSpeech)(), (0, _portActivityNotifications.createEnablePortActivityNotifications)(), (0, _portActivityNotifications.createDisablePortActivityNotifications)(), (0, _requestCatalog.createRequestCatalogSpeech)()];

const getMessageSpeech = (message, store) => speeches.find(speech => speech.messageIdentifier(message, store));

var _default = getMessageSpeech;
exports.default = _default;