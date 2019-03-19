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

const SHOW_SIM_COMMAND = 'show';
const HIDE_SIM_COMMAND = 'hide';

const getMsisdn = (messageText: string, commandWord: string) => {
    const words = messageText.split(' ');
    const [botName, command, msisdn] = words;
    return getBotNames().includes(botName) && command === commandWord && !!msisdn ? msisdn : null;
};

const isShowSimMessage = (messageText: string) => getMsisdn(messageText, SHOW_SIM_COMMAND) !== null;

const isHideSimMessage = (messageText: string) => getMsisdn(messageText, HIDE_SIM_COMMAND) !== null;

const changeSimVisibility = async (
    visibilityCommand: string,
    receivedMessage: IncomingMessage,
    store: Store,
    answerMessage: AnswerMessageCallback
) => {
    const msisdn = getMsisdn(receivedMessage.messageText, visibilityCommand);
    if (msisdn) {
        const simToEdit = store.sim.findSimInCatalogByMsisdn(msisdn);
        if (simToEdit) {
            store.sim.saveSimInCatalog(
                simToEdit.icc,
                simToEdit.msisdn,
                simToEdit.brand,
                simToEdit.country,
                simToEdit.lineType,
                visibilityCommand === SHOW_SIM_COMMAND
            );
            answerMessage(createSuccessFeedbackMessage(':+1: Sim visibility updated.'), receivedMessage);
        } else {
            answerMessage(
                createErrorMessage(':-1: We dont have any **sim** card with this **msisdn**.'),
                receivedMessage
            );
        }
    }
};

export const createShowSimSpeech = () => ({
    messageType: MessageType.SHOW_SIM,
    messageIdentifier: (receivedMessage: IncomingMessage) => isShowSimMessage(receivedMessage.messageText),
    action: async (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) =>
        changeSimVisibility(SHOW_SIM_COMMAND, receivedMessage, store, answerMessage),
});

export const createHideSimSpeech = () => ({
    messageType: MessageType.HIDE_SIM,
    messageIdentifier: (receivedMessage: IncomingMessage) => isHideSimMessage(receivedMessage.messageText),
    action: async (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) =>
        changeSimVisibility(HIDE_SIM_COMMAND, receivedMessage, store, answerMessage),
});
