"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const createSettingsStore = () => {
  let portActivityNotificationsEnabled = true;
  return {
    setPortActivityNotificationsStatus: isEnabled => {
      portActivityNotificationsEnabled = isEnabled;
    },
    arePortActivityNotificationsEnabled: () => portActivityNotificationsEnabled
  };
};

var _default = createSettingsStore;
exports.default = _default;