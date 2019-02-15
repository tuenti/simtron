import {MessageType} from '../model/message-type';
import {getBotNames, getBotDisplayName, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createSuccessFeedbackMessage,
    createQuestionMessage,
    createErrorMessage,
    IncomingMessage,
} from '../model/message';
import createIdentifySimQuestionary from '../../questionary/sim-id';
import delayed from '../../util/delay';
import {Bot} from '..';
import {Store} from '../../store';

const SIM_DATA_EDIT_COMMAND = 'edit';

const getSimDataEditMsisdn = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command, msisdn] = words;
    return getBotNames().includes(botName) && command === SIM_DATA_EDIT_COMMAND && !!msisdn ? msisdn : null;
};

const isSimDataEditStartMessage = (messageText: string) => getSimDataEditMsisdn(messageText) !== null;

export const createStartSimDataEditSpeech = () => ({
    messageType: MessageType.START_SIM_DATA_EDIT,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isSimDataEditStartMessage(receivedMessage.messageText),
    isAdmin: true,
    action: (bot: Bot, receivedMessage: IncomingMessage, store: Store) => {
        const msisdn = getSimDataEditMsisdn(receivedMessage.messageText);
        if (msisdn) {
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
        }
    },
});
