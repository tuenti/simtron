import {MessageType} from '../model/message-type';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {createSuccessFeedbackMessage, createQuestionMessage, IncomingMessage} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';
import createIdentifyPortQuestionary from '../../questionary/port-id';

const PORT_IDENTIFICATION_COMMAND_1 = 'identify';
const PORT_IDENTIFICATION_COMMAND_2 = 'port';

const isPortIdentificationStartMessage = (messageText: string) => {
    const words = messageText.split(' ');
    const [botName, command1, command2] = words;
    return (
        getBotNames().includes(botName) &&
        command1 === PORT_IDENTIFICATION_COMMAND_1 &&
        command2 === PORT_IDENTIFICATION_COMMAND_2
    );
};

export const createStartPortIdentificationSpeech = () => ({
    messageType: MessageType.START_PORT_IDENTIFICATION,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isPortIdentificationStartMessage(receivedMessage.messageText),
    isAdmin: true,
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        answerMessage(
            createSuccessFeedbackMessage(
                "*Ok*, Lets identify the port, when required data get entered, the identified port status light will blink. Please, execute this command near *Simtron's hardware*"
            ),
            receivedMessage
        );
        const questionary = createIdentifyPortQuestionary(store, true);
        store.questionary.start(questionary, receivedMessage.botId, receivedMessage.userId);
        delayed(
            () =>
                questionary
                    .getCurrentQuestion()
                    .then(question => answerMessage(createQuestionMessage(question), receivedMessage)),
            getBotMessageSequenceEnsuringTime()
        );
    },
});
