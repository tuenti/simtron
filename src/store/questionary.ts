import {Questionary} from '../questionary/handler';

export interface QuestionaryStore {
    getByBotUser: (botId: string, userId: string) => Questionary | null;
    start: (questionary: Questionary, botId: string, userId: string) => void;
    cancel: (botId: string, userId: string) => void;
    finish: (botId: string, userId: string) => void;
}

const quesitonaryKey = (botId: string, userId: string) => `${botId}_${userId}`;

const ongoingQuesitonaries: {[key: string]: Questionary} = {};

const createQuestionaryStore = (): QuestionaryStore => ({
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
    },
});

export default createQuestionaryStore;
