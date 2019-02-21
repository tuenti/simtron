import {MessageType} from '../model/message-type';
import {getBotNames, getBotDisplayName, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    IncomingMessage,
    createSuccessFeedbackMessage,
    createQuestionMessage,
    createErrorMessage,
} from '../model/message';
import {Store} from '../../store';
import delayed from '../../util/delay';
import {Question} from '../../questionary/handler';
import createForceSimOperatorQuestionary from '../../questionary/force-sim-operator';
import {AnswerMessageCallback, SendCommandCallback} from '.';

const FORCE_OPERATOR_COMMAND1 = 'force';
const FORCE_OPERATOR_COMMAND2 = 'operator';

const getMsisdnOfSimToForceOperator = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command1, command2, msisdn] = words;
    return getBotNames().includes(botName) &&
        command1 === FORCE_OPERATOR_COMMAND1 &&
        command2 === FORCE_OPERATOR_COMMAND2 &&
        !!msisdn
        ? msisdn
        : null;
};

const isStartForceSimOperatorMessage = (messageText: string) =>
    getMsisdnOfSimToForceOperator(messageText) !== null;

export const createStartForceSimOperatorSpeech = () => ({
    messageType: MessageType.START_FORCE_SIM_OPERATOR,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isStartForceSimOperatorMessage(receivedMessage.messageText),
    action: (
        receivedMessage: IncomingMessage,
        store: Store,
        answerMessage: AnswerMessageCallback,
        sendCommand: SendCommandCallback
    ) => {
        const msisdn = getMsisdnOfSimToForceOperator(receivedMessage.messageText);
        if (msisdn) {
            const simInUse = store.sim.findSimInUseByMsisdn(msisdn);
            if (simInUse) {
                answerMessage(
                    createSuccessFeedbackMessage(
                        `*Ok*, lets search for available operators for the sim with icc: *${
                            simInUse.icc
                        }*\nTo cancel, just type *${getBotDisplayName()} forget it, please* :wink:`
                    ),
                    receivedMessage
                );

                const questionary = createForceSimOperatorQuestionary(simInUse, sendCommand);
                store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);

                delayed(
                    () =>
                        questionary.getCurrentQuestion().then((question: Question) => {
                            if (!questionary.isCanceled()) {
                                answerMessage(createQuestionMessage(question), receivedMessage);
                            }
                        }),
                    getBotMessageSequenceEnsuringTime()
                );
            } else {
                answerMessage(createErrorMessage(":-1: I don't know this phone number."), receivedMessage);
            }
        }
    },
});
