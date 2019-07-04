"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const quesitonaryKey = (botId, userId) => `${botId}_${userId}`;

const ongoingQuesitonaries = {};

const createQuestionaryStore = () => ({
  getByBotUser(botId, userId) {
    return ongoingQuesitonaries[quesitonaryKey(botId, userId)] || null;
  },

  start(questionary, botId, userId) {
    ongoingQuesitonaries[quesitonaryKey(botId, userId)] = questionary;
  },

  cancel(botId, userId) {
    const key = quesitonaryKey(botId, userId);
    const questionary = ongoingQuesitonaries[key];

    if (questionary) {
      questionary.cancel();
    }

    delete ongoingQuesitonaries[key];
  },

  finish(botId, userId) {
    const key = quesitonaryKey(botId, userId);
    const questionary = ongoingQuesitonaries[key];

    if (questionary) {
      questionary.finish();
      delete ongoingQuesitonaries[key];
    }
  }

});

var _default = createQuestionaryStore;
exports.default = _default;