import {MessageType} from '../model/message-type';
import {getBotNames, getBotDisplayName, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createSuccessFeedbackMessage,
    createQuestionMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import createIdentifySimQuestionary from '../../questionary/sim-id';
import delayed from '../../util/delay';
import {Bot} from '..';
import {Store} from '../../store';

export const SIM_IDENTIFICATION_COMMAND = 'register';

const getSimIdentificationIndex = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command, index = undefined] = words;
    const simIndex = index !== undefined ? parseInt(index) : 1;
    return getBotNames().includes(botName) && command === SIM_IDENTIFICATION_COMMAND ? simIndex - 1 : null;
};

const isSimIdentificationStartMessage = (messageText: string) =>
    getSimIdentificationIndex(messageText) !== null;

export const createStartSimIdentificationSpeech = () => ({
    messageType: MessageType.START_SIM_IDENTIFICATION,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isSimIdentificationStartMessage(receivedMessage.messageText),
    isAdmin: true,
    action: (bot: Bot, receivedMessage: IncomingMessage, store: Store) => {
        const simIndex = getSimIdentificationIndex(receivedMessage.messageText);
        const allUnknownSims = store.sim.getAllUnknownSimsInUse();
        if (simIndex && simIndex >= 0 && simIndex < allUnknownSims.length) {
            const sim = allUnknownSims[simIndex];
            bot.sendMessage(
                createSuccessFeedbackMessage(
                    `*Ok*, lets identify the sim card with icc: *${
                        sim.icc
                    }*\nTo cancel, just type *${getBotDisplayName()} forget it, please* :wink:`
                ),
                receivedMessage
            );
            const questionary = createIdentifySimQuestionary(sim, store);
            store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
            delayed(
                () =>
                    bot.sendMessage(createQuestionMessage(questionary.getCurrentQuestion()), receivedMessage),
                getBotMessageSequenceEnsuringTime()
            );
        } else {
            bot.sendMessage(createErrorMessage(':-1: Invalid SIM index.'), receivedMessage);
        }
    },
});
