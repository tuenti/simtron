import {MessageType} from '../model/message-type';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createSimDetailsContentMessage,
    createSimDetailsAnswerMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';
import {NON_DIGITS} from '../../util/matcher';

const SIM_DETAILS_COMMAND = 'details';

const getRequestDetailsPhoneNumber = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command, phoneNumber] = words;
    return getBotNames().includes(botName) && command === SIM_DETAILS_COMMAND && !!phoneNumber
        ? phoneNumber.replace(NON_DIGITS, '')
        : null;
};

const isRequestSimDetailsMessage = (messageText: string) =>
    getRequestDetailsPhoneNumber(messageText) !== null;
export const createRequestSimDetailsSpeech = () => ({
    messageType: MessageType.REQUEST_SIM_DETAILS,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isRequestSimDetailsMessage(receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        answerMessage(createSimDetailsAnswerMessage(), receivedMessage);
        const phoneNumber = getRequestDetailsPhoneNumber(receivedMessage.messageText);
        if (phoneNumber) {
            const sims = store.sim.findSimsInUseByDisplayNumber(phoneNumber, receivedMessage.isFromAdmin);
            if (sims.length > 0) {
                delayed(() => {
                    sims.forEach(sim => answerMessage(createSimDetailsContentMessage(sim), receivedMessage));
                }, getBotMessageSequenceEnsuringTime());
            } else {
                delayed(
                    () =>
                        answerMessage(
                            createErrorMessage(`:-1: Sim not found with phoneNumber *${phoneNumber}*`),
                            receivedMessage
                        ),
                    getBotMessageSequenceEnsuringTime()
                );
            }
        }
    },
});
