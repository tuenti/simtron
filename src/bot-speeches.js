import {REQUEST_CATALOG} from './bot/model/message-type';
import {
    createCatalogAnswerMessage,
    createSimStatusAnswerMessage,
    createUnknownSimsExistenceNotificationMessage,
} from './bot/model/message';
import {getBotMessageSequenceEnsuringTime, getSlackBotAdminUserIds} from './config';
import delayed from './util/delay';

const isAdmin = userId => getSlackBotAdminUserIds().includes(userId);

const speeches = [
    {
        messageType: REQUEST_CATALOG,
        messageIdentifier: () => true,
        action: (bot, message, store) => {
            bot.sendMessage(createCatalogAnswerMessage(), message);
            const allInUseSims = store.sim.getAllSimsInUse();
            delayed(
                () => bot.sendMessage(createSimStatusAnswerMessage(allInUseSims), message),
                getBotMessageSequenceEnsuringTime()
            ).then(() =>
                delayed(() => {
                    const allUnknownSims = store.sim.getAllUnknownSimsInUse();
                    if (isAdmin(message.userId) && allUnknownSims.length > 0) {
                        bot.sendMessage(
                            createUnknownSimsExistenceNotificationMessage(allUnknownSims),
                            message
                        );
                    }
                }, getBotMessageSequenceEnsuringTime())
            );
        },
    },
];

const getMessageSpeech = message => speeches.find(speech => speech.messageIdentifier(message));

export default getMessageSpeech;
