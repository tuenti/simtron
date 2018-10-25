import {
    REQUEST_CATALOG,
    START_SIM_IDENTIFICATION,
    START_SIM_DATA_EDIT,
    STOP_QUESTIONARY,
    FILL_QUESTIONARY,
} from './bot/model/message-type';
import {
    createCatalogAnswerMessage,
    createSimStatusAnswerMessage,
    createUnknownSimsExistenceNotificationMessage,
    createErrorMessage,
    createQuestionMessage,
    createSuccessFeedbackMessage,
} from './bot/model/message';
import {getBotMessageSequenceEnsuringTime, getBotNames, getBotDisplayName} from './config';
import delayed from './util/delay';
import {existSomeWordInText} from './util/text';
import createIdentifySimQuestionary from './questionary/sim-id';

const SIM_IDENTIFICATION_COMMAND = 'id';
const SIM_DATA_EDIT_COMMAND = 'edit';
const QUESIONARY_CANCEL_COMMAND = 'forget';

const getSimIdentificationIndex = messageText => {
    const words = messageText.split(' ');
    const [botName, command, index = undefined] = words;
    const simIndex = index !== undefined ? parseInt(index) : 1;
    return getBotNames().includes(botName) && command === SIM_IDENTIFICATION_COMMAND ? simIndex - 1 : null;
};

const isQuestionaryCancelMessage = messageText => {
    const words = messageText.split(' ');
    const [botName, command] = words;
    return getBotNames().includes(botName) && command === QUESIONARY_CANCEL_COMMAND;
};

const isSimIdentificationStartMessage = messageText => getSimIdentificationIndex(messageText) !== null;

const getSimDataEditMsisdn = messageText => {
    const words = messageText.split(' ');
    const [botName, command, msisdn] = words;
    return getBotNames().includes(botName) && command === SIM_DATA_EDIT_COMMAND && !!msisdn ? msisdn : null;
};

const isSimDataEditStartMessage = messageText => getSimDataEditMsisdn(messageText) !== null;

const speeches = [
    {
        messageType: STOP_QUESTIONARY,
        messageIdentifier: receivedMessage => isQuestionaryCancelMessage(receivedMessage.messageText),
        action: (bot, receivedMessage, store) => {
            const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
            if (questionary) {
                store.questionary.cancel(receivedMessage.botId, receivedMessage.userId);
                bot.sendMessage(
                    createSuccessFeedbackMessage(':+1: Ok, lets forget about it.'),
                    receivedMessage
                );
            } else {
                bot.sendMessage(
                    createErrorMessage(
                        ":-1: I don't know what I need to forget about, but nevermind, it's ok."
                    ),
                    receivedMessage
                );
            }
        },
    },
    {
        messageType: FILL_QUESTIONARY,
        messageIdentifier: (receivedMessage, store) =>
            !!store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId),
        action: (bot, receivedMessage, store) => {
            const questionary = store.questionary.getByBotUser(receivedMessage.botId, receivedMessage.userId);
            const responseAccepted = questionary.answerCurrentQuestion(receivedMessage.messageText);
            if (responseAccepted) {
                if (questionary.isFullfilled()) {
                    store.questionary.finish(receivedMessage.botId, receivedMessage.userId);
                    bot.sendMessage(
                        createSuccessFeedbackMessage(questionary.getFinishFeedbackText()),
                        receivedMessage
                    );
                } else {
                    bot.sendMessage(createQuestionMessage(questionary.getCurrentQuestion()), receivedMessage);
                }
            } else {
                bot.sendMessage(createErrorMessage(questionary.getValidationErrorText()), receivedMessage);
            }
        },
    },
    {
        messageType: START_SIM_IDENTIFICATION,
        messageIdentifier: receivedMessage => isSimIdentificationStartMessage(receivedMessage.messageText),
        isAdmin: true,
        action: (bot, receivedMessage, store) => {
            const simIndex = getSimIdentificationIndex(receivedMessage.messageText);
            const allUnknownSims = store.sim.getAllUnknownSimsInUse();
            if (simIndex >= 0 && simIndex < allUnknownSims.length) {
                const sim = allUnknownSims[simIndex];
                bot.sendMessage(
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
                        bot.sendMessage(
                            createQuestionMessage(questionary.getCurrentQuestion()),
                            receivedMessage
                        ),
                    getBotMessageSequenceEnsuringTime()
                );
            } else {
                bot.sendMessage(createErrorMessage(':-1: Invalid SIM index.'), receivedMessage);
            }
        },
    },
    {
        messageType: START_SIM_DATA_EDIT,
        messageIdentifier: receivedMessage => isSimDataEditStartMessage(receivedMessage.messageText),
        isAdmin: true,
        action: (bot, receivedMessage, store) => {
            const msisdn = getSimDataEditMsisdn(receivedMessage.messageText);
            const sim = store.sim.findSimInCatalogByMsisdn(msisdn);
            if (sim) {
                bot.sendMessage(
                    createSuccessFeedbackMessage(
                        `*Ok*, lets edit the sim card with icc: *${
                            sim.icc
                        }*\nTo cancel, just type *${getBotDisplayName()} forget it, please* :wink:`
                    ),
                    receivedMessage
                );
                const questionary = createIdentifySimQuestionary(sim, store);
                store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
                delayed(
                    () =>
                        bot.sendMessage(
                            createQuestionMessage(questionary.getCurrentQuestion()),
                            receivedMessage
                        ),
                    getBotMessageSequenceEnsuringTime()
                );
            } else {
                bot.sendMessage(createErrorMessage(":-1: I don't know this phone number."), receivedMessage);
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

const getMessageSpeech = (receivedMessage, store) =>
    speeches.find(speech => speech.messageIdentifier(receivedMessage, store));

export default getMessageSpeech;
