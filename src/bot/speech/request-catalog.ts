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
import {Bot} from '..';
import {Store} from '../../store';

export const createRequestCatalogSpeech = () => ({
    messageType: MessageType.REQUEST_CATALOG,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        existSomeWordInText(getBotNames(), receivedMessage.messageText),
    action: (bot: Bot, receivedMessage: IncomingMessage, store: Store) => {
        bot.sendMessage(createCatalogAnswerMessage(), receivedMessage);
        const allInUseSims = store.sim.getAllSimsInUse();
        delayed(
            () => bot.sendMessage(createCatalogAnswerContentMessage(allInUseSims), receivedMessage),
            getBotMessageSequenceEnsuringTime()
        ).then(() =>
            delayed(() => {
                const allUnknownSims = store.sim.getAllUnknownSimsInUse();
                if (receivedMessage.isFromAdmin && allUnknownSims.length > 0) {
                    bot.sendMessage(
                        createUnknownSimsExistenceNotificationMessage(allUnknownSims),
                        receivedMessage
                    );
                }
            }, getBotMessageSequenceEnsuringTime())
        );
    },
});
