const quesitonaryKey = (botId, userId) => `${botId}_${userId}`;

const createQuestionaryStore = () => ({
    ongoingQuesitonaries: {},

    getByBotUser(botId, userId) {
        return this.ongoingQuesitonaries[quesitonaryKey(botId, userId)];
    },

    start(questionary, botId, userId) {
        this.ongoingQuesitonaries[quesitonaryKey(botId, userId)] = questionary;
    },

    cancel(botId, userId) {
        delete this.ongoingQuesitonaries[quesitonaryKey(botId, userId)];
    },

    finish(botId, userId) {
        const key = quesitonaryKey(botId, userId);
        const questionary = this.ongoingQuesitonaries[key];
        questionary.finish();
        delete this.ongoingQuesitonaries[key];
    },
});

export default createQuestionaryStore;
