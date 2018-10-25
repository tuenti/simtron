import {FILL_QUESTIONARY, STOP_QUESTIONARY} from '../model/message-type';
import {createSuccessFeedbackMessage, createQuestionMessage, createErrorMessage} from '../model/message';
import {getBotNames} from '../../config';

const QUESIONARY_CANCEL_COMMAND = 'forget';

const isQuestionaryCancelMessage = messageText => {
    const words = messageText.split(' ');
    const [botName, command] = words;
    return getBotNames().includes(botName) && command === QUESIONARY_CANCEL_COMMAND;
};

export const createFillQuestionSpeech = () => ({
    messageType: FILL_QUESTIONARY,
    messageIdentifier: (receivedMessage, store) =>
        !!store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId),
    action: (bot, receivedMessage, store) => {
        const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
        const responseAccepted = questionary.answerCurrentQuestion(receivedMessage.messageText);
        if (responseAccepted) {
            if (questionary.isFullfilled()) {
                store.questionary.finish(receivedMessage.botId, receivedMessage.userId);
                bot.sendMessage(
                    createSuccessFeedbackMessage(questionary.getFinishFeedbackText()),
                    receivedMessage
                );
            } else {
                bot.sendMessage(createQuestionMessage(questionary.getCurrentQuestion()), receivedMessage);
            }
        } else {
            bot.sendMessage(createErrorMessage(questionary.getValidationErrorText()), receivedMessage);
        }
    },
});

export const createStopQuestionarySpeech = () => ({
    messageType: STOP_QUESTIONARY,
    messageIdentifier: receivedMessage => isQuestionaryCancelMessage(receivedMessage.messageText),
    action: (bot, receivedMessage, store) => {
        const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
        if (questionary) {
            store.questionary.cancel(receivedMessage.botId, receivedMessage.userId);
            bot.sendMessage(createSuccessFeedbackMessage(':+1: Ok, lets forget about it.'), receivedMessage);
        } else {
            bot.sendMessage(
                createErrorMessage(":-1: I don't know what I need to forget about, but nevermind, it's ok."),
                receivedMessage
            );
        }
    },
});
