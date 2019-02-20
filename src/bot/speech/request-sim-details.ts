import {MessageType} from '../model/message-type';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createSimDetailsAnswerContentMessage,
    createSimDetailsAnswerMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

const SIM_DETAILS_COMMAND = 'details';

const getRequestDetailsMsisdn = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command, msisdn] = words;
    return getBotNames().includes(botName) && command === SIM_DETAILS_COMMAND && !!msisdn ? msisdn : null;
};

const isRequestSimDetailsMessage = (messageText: string) => getRequestDetailsMsisdn(messageText) !== null;
export const createRequestSimDetails = () => ({
    messageType: MessageType.REQUEST_SIM_DETAILS,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isRequestSimDetailsMessage(receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        answerMessage(createSimDetailsAnswerMessage(), receivedMessage);
        const msisdn = getRequestDetailsMsisdn(receivedMessage.messageText);
        if (msisdn) {
            const sim = store.sim.findSimInUseByMsisdn(msisdn);
            if (sim) {
                delayed(
                    () => answerMessage(createSimDetailsAnswerContentMessage(sim), receivedMessage),
                    getBotMessageSequenceEnsuringTime()
                );
            } else {
                delayed(
                    () =>
                        answerMessage(
                            createErrorMessage(`:-1: Sim not found with msisdn *${msisdn}*`),
                            receivedMessage
                        ),
                    getBotMessageSequenceEnsuringTime()
                );
            }
        }
    },
});
