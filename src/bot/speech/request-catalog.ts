import {MessageType} from '../model/message-type';
import {existSomeWordInText} from '../../util/text';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createCatalogAnswerMessage,
    createCatalogAnswerContentMessage,
    createUnknownSimsExistenceNotificationMessage,
    IncomingMessage,
} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

export const createRequestCatalogSpeech = () => ({
    messageType: MessageType.REQUEST_CATALOG,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        existSomeWordInText(getBotNames(), receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        answerMessage(createCatalogAnswerMessage(), receivedMessage);
        const allInUseSims = store.sim.getAllSimsInUse(receivedMessage.isFromAdmin);
        delayed(
            () => answerMessage(createCatalogAnswerContentMessage(allInUseSims), receivedMessage),
            getBotMessageSequenceEnsuringTime()
        ).then(() =>
            delayed(() => {
                const allUnknownSims = store.sim.getAllUnknownSimsInUse();
                if (receivedMessage.isFromAdmin && allUnknownSims.length > 0) {
                    answerMessage(
                        createUnknownSimsExistenceNotificationMessage(allUnknownSims),
                        receivedMessage
                    );
                }
            }, getBotMessageSequenceEnsuringTime())
        );
    },
});
