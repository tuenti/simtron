import {
    REQUEST_CATALOG,
    START_SIM_IDENTIFICATION,
    STOP_QUESTIONARY,
    FILL_QUESTIONARY,
} from './bot/model/message-type';
import {
    createCatalogAnswerMessage,
    createSimStatusAnswerMessage,
    createUnknownSimsExistenceNotificationMessage,
    createErrorMessage,
} from './bot/model/message';
import {getBotMessageSequenceEnsuringTime, getBotNames} from './config';
import delayed from './util/delay';
import {existSomeWordInText} from './util/text';

const SIM_IDENTIFICATION_COMMAND = 'id';

const getSimIdentificationIndex = messageText => {
    const words = messageText.split(' ');
    const [botName, command, index = undefined] = words;
    const simIndex = index !== undefined ? parseInt(index) : 1;
    return getBotNames().includes(botName) && command === SIM_IDENTIFICATION_COMMAND ? simIndex - 1 : null;
};

const isSimIdentificationStartMessage = messageText => getSimIdentificationIndex(messageText) !== null;

const speeches = [
    {
        messageType: STOP_QUESTIONARY,
        messageIdentifier: () => false,
        action: (bot, receivedMessage, store) => {
            // put here stop questionary code
            // questionaries belongs to current user
        },
    },
    {
        messageType: FILL_QUESTIONARY,
        messageIdentifier: () => false,
        action: (bot, receivedMessage, store) => {
            // put here fill questionary code
            // questionaries belongs to current user
        },
    },
    {
        messageType: START_SIM_IDENTIFICATION,
        messageIdentifier: receivedMessage => isSimIdentificationStartMessage(receivedMessage.messageText),
        isAdmin: true,
        action: (bot, receivedMessage, store) => {
            const simIndex = getSimIdentificationIndex(receivedMessage.messageText);
            console.log(simIndex);
            const allUnknownSims = store.sim.getAllUnknownSimsInUse();
            if (simIndex >= 0 && simIndex < allUnknownSims.length) {
                // put here start questionary code
                // questionaries belongs to current user
            } else {
                bot.sendMessage(createErrorMessage('Invalid SIM index'), receivedMessage);
            }
        },
    },
    {
        messageType: REQUEST_CATALOG,
        messageIdentifier: receivedMessage => existSomeWordInText(getBotNames(), receivedMessage.messageText),
        action: (bot, receivedMessage, store) => {
            bot.sendMessage(createCatalogAnswerMessage(), receivedMessage);
            const allInUseSims = store.sim.getAllSimsInUse();
            delayed(
                () => bot.sendMessage(createSimStatusAnswerMessage(allInUseSims), receivedMessage),
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
    },
];

const getMessageSpeech = receivedMessage =>
    speeches.find(speech => speech.messageIdentifier(receivedMessage));

export default getMessageSpeech;
