import {REQUEST_CATALOG} from '../model/message-type';
import {existSomeWordInText} from '../../util/text';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createCatalogAnswerMessage,
    createCatalogAnswerContentMessage,
    createUnknownSimsExistenceNotificationMessage,
} from '../model/message';
import delayed from '../../util/delay';

export const createRequestCatalogSpeech = () => ({
    messageType: REQUEST_CATALOG,
    messageIdentifier: receivedMessage => existSomeWordInText(getBotNames(), receivedMessage.messageText),
    action: (bot, receivedMessage, store) => {
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
