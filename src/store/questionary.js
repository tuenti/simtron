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
        const answers = questionary.getAnswers();
        delete this.ongoingQuesitonaries[key];
        return answers;
    },
});

export default createQuestionaryStore;
