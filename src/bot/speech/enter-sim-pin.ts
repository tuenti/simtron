import {MessageType} from '../model/message-type';
import {getBotNames, getBotDisplayName, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createSuccessFeedbackMessage,
    createQuestionMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback, SendCommandCallback} from '.';
import createEnterPinQuestionary from '../../questionary/enter-sim-pin';

const SIM_PIN_REMOVE_COMMAND_1 = 'enter';
const SIM_PIN_REMOVE_COMMAND_2 = 'pin';
export const SIM_PIN_REMOVE_COMMAND = `${SIM_PIN_REMOVE_COMMAND_1} ${SIM_PIN_REMOVE_COMMAND_2}`;

const getSimPinRemoveIndex = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command1, command2, index] = words;
    return getBotNames().includes(botName) &&
        command1 === SIM_PIN_REMOVE_COMMAND_1 &&
        command2 === SIM_PIN_REMOVE_COMMAND_2 &&
        index !== undefined
        ? parseInt(index)
        : null;
};

const isSimPinRemoveStartMessage = (messageText: string) => getSimPinRemoveIndex(messageText) !== null;

export const createStartSimPinEntrySpeech = () => ({
    messageType: MessageType.START_SIM_PIN_REMOVE,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isSimPinRemoveStartMessage(receivedMessage.messageText),
    isAdmin: true,
    action: (
        receivedMessage: IncomingMessage,
        store: Store,
        answerMessage: AnswerMessageCallback,
        sendCommand: SendCommandCallback
    ) => {
        const simIndex = getSimPinRemoveIndex(receivedMessage.messageText);
        const allBlockedSims = store.sim.getAllPortsWithBlockedSims();
        const blockedSim = allBlockedSims.find(sim => sim.portIndex === simIndex);
        if (blockedSim) {
            answerMessage(
                createSuccessFeedbackMessage(
                    `*Ok*, lets enter the pin of the sim located on port index *${simIndex}*, to cancel, just type *${getBotDisplayName()} forget it, please* :wink:`
                ),
                receivedMessage
            );
            const pinType = 'pin';
            const questionary = createEnterPinQuestionary(blockedSim, pinType, store, sendCommand, message =>
                answerMessage(message, receivedMessage)
            );
            store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
            delayed(
                () =>
                    questionary
                        .getCurrentQuestion()
                        .then(question => answerMessage(createQuestionMessage(question), receivedMessage)),
                getBotMessageSequenceEnsuringTime()
            );
            return;
        }
        answerMessage(
            createErrorMessage(':-1: There is no blocked SIM on the port represented by the provided index.'),
            receivedMessage
        );
    },
});
