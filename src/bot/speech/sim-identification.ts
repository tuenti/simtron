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
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

export const SIM_IDENTIFICATION_COMMAND = 'register';

const getSimIdentificationIndex = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command, index = undefined] = words;
    const simIndex = index !== undefined ? parseInt(index) : 1;
    return getBotNames().includes(botName) && command === SIM_IDENTIFICATION_COMMAND ? simIndex : null;
};

const isSimIdentificationStartMessage = (messageText: string) =>
    getSimIdentificationIndex(messageText) !== null;

export const createStartSimIdentificationSpeech = () => ({
    messageType: MessageType.START_SIM_IDENTIFICATION,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isSimIdentificationStartMessage(receivedMessage.messageText),
    isAdmin: true,
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        const simIndex = getSimIdentificationIndex(receivedMessage.messageText);
        const allUnknownSims = store.sim.getAllUnknownSimsInUse();
        if (simIndex) {
            const sim = allUnknownSims.find(sim => sim.portIndex == simIndex);
            if (sim) {
                answerMessage(
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
                        questionary
                            .getCurrentQuestion()
                            .then(question =>
                                answerMessage(createQuestionMessage(question), receivedMessage)
                            ),
                    getBotMessageSequenceEnsuringTime()
                );
                return;
            }
        }
        answerMessage(createErrorMessage(':-1: Invalid SIM index.'), receivedMessage);
    },
});
