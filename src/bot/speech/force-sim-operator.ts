import {MessageType} from '../model/message-type';
import {getBotNames} from '../../config';
import {IncomingMessage} from '../model/message';

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
    action: () => {},
});
