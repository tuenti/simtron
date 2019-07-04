"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MessageType = void 0;
let MessageType;
exports.MessageType = MessageType;

(function (MessageType) {
  MessageType["NOTIFY_BOOTING"] = "notify-booting";
  MessageType["NOTIFY_BOOT_DONE"] = "notify-boot-done";
  MessageType["REQUEST_CATALOG"] = "request-catalog";
  MessageType["REQUEST_SIM_DETAILS"] = "request-sim-details";
  MessageType["ANSWER_CATALOG"] = "answer-catalog";
  MessageType["ANSWER_SIM_DETAILS"] = "answer-sim-details";
  MessageType["ANSWER_CATALOG_CONTENT"] = "answer-sim-status";
  MessageType["SIM_DETAILS_CONTENT"] = "sim-details-content";
  MessageType["NOTIFY_UNKNOWN_SIM_EXISTENCE"] = "notify-unknown-sim-existence";
  MessageType["START_SIM_IDENTIFICATION"] = "start-sim-id";
  MessageType["START_SIM_DATA_EDIT"] = "start-sim-data-edit";
  MessageType["NOTIFY_SMS_RECEIVED"] = "notify-sms-received";
  MessageType["NOTIFY_PORT_ACTIVITY_DETECTED"] = "notify-port-activity-detected";
  MessageType["START_FORCE_SIM_OPERATOR"] = "start-force-sim-operator";
  MessageType["STOP_QUESTIONARY"] = "stop-questionary";
  MessageType["FILL_QUESTIONARY"] = "fill-questionary";
  MessageType["SHOW_SIM"] = "show-sim";
  MessageType["HIDE_SIM"] = "hide-sim";
  MessageType["ENABLE_PORT_ACTIVITY_NOTIFICATIONS"] = "enable-port-activity-notifications";
  MessageType["DISABLE_PORT_ACTIVITY_NOTIFICATIONS"] = "disable-port-activity-notifications";
  MessageType["FREE_TEXT_QUESTION"] = "free-text-question";
  MessageType["SINGLE_SELECTION_QUESTION"] = "single-selection-question";
  MessageType["SUCCESS"] = "success";
  MessageType["ERROR"] = "error";
})(MessageType || (exports.MessageType = MessageType = {}));