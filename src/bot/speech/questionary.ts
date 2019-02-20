import {MessageType} from '../model/message-type';
import {
    createSuccessFeedbackMessage,
    createQuestionMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import {getBotNames} from '../../config';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

const QUESIONARY_CANCEL_COMMAND = 'forget';

const isQuestionaryCancelMessage = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command] = words;
    return getBotNames().includes(botName) && command === QUESIONARY_CANCEL_COMMAND;
};

export const createFillQuestionSpeech = () => ({
    messageType: MessageType.FILL_QUESTIONARY,
    messageIdentifier: (receivedMessage: IncomingMessage, store: Store) =>
        !!store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId),
    action: async (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
        if (questionary) {
            const responseAccepted = await questionary.answerCurrentQuestion(receivedMessage.messageText);
            if (responseAccepted) {
                if (questionary.isFullfilled()) {
                    store.questionary.finish(receivedMessage.botId, receivedMessage.userId);
                    answerMessage(
                        createSuccessFeedbackMessage(questionary.getFinishFeedbackText()),
                        receivedMessage
                    );
                } else {
                    const question = await questionary.getCurrentQuestion();
                    answerMessage(createQuestionMessage(question), receivedMessage);
                }
            } else {
                answerMessage(createErrorMessage(questionary.getValidationErrorText()), receivedMessage);
            }
        } else {
            answerMessage(
                createErrorMessage(':-1: First, you need to aske to start a formulary.'),
                receivedMessage
            );
        }
    },
});

export const createStopQuestionarySpeech = () => ({
    messageType: MessageType.STOP_QUESTIONARY,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isQuestionaryCancelMessage(receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
        if (questionary) {
            store.questionary.cancel(receivedMessage.botId, receivedMessage.userId);
            answerMessage(createSuccessFeedbackMessage(':+1: Ok, lets forget about it.'), receivedMessage);
        } else {
            answerMessage(
                createErrorMessage(":-1: I don't know what I need to forget about, but nevermind, it's ok."),
                receivedMessage
            );
        }
    },
});
