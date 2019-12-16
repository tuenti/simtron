import {MessageType} from '../model/message-type';
import {createSuccessFeedbackMessage, createErrorMessage, IncomingMessage} from '../model/message';
import {getBotNames} from '../../config';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';
import {NON_DIGITS, EMAIL_ADDRESS} from '../../util/matcher';

interface SmsEmailReceiversData {
    phoneNumber: string;
    receivers: string[];
}

const COMMAND = 'redirect';

const getSmsEmailReceiversData = (messageText: string): SmsEmailReceiversData | undefined => {
    const words = messageText.split(' ');
    const [botName, command, phoneNumber, ...receivers] = words;
    return getBotNames().includes(botName) && command === COMMAND && !!phoneNumber
        ? {phoneNumber: phoneNumber.replace(NON_DIGITS, ''), receivers}
        : undefined;
};

export const createSetSmsEmailReceivers = () => ({
    messageType: MessageType.SET_SMS_EMAIL_RECEIVERS,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        getSmsEmailReceiversData(receivedMessage.messageText) != null,
    action: async (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        const receiversData = getSmsEmailReceiversData(receivedMessage.messageText);
        if (receiversData) {
            const foundSims = store.sim.findSimsInUseByDisplayNumber(receiversData.phoneNumber, true);
            if (foundSims.length === 0) {
                answerMessage(
                    createErrorMessage(':-1: We dont have any sim card with this phone number.'),
                    receivedMessage
                );
                return;
            }

            if (!receiversData.receivers || receiversData.receivers.length === 0) {
                answerMessage(
                    createErrorMessage(
                        ':-1: You should specify some email addresses, separated by spaces if more than one.'
                    ),
                    receivedMessage
                );
                return;
            }
            const validEmails = receiversData.receivers
                .map(email => {
                    const matches = email.match(EMAIL_ADDRESS);
                    return matches && matches.length > 0 ? matches[0] : undefined;
                })
                .filter(email => !!email) as string[];

            store.settings.setSmsEmailReceivers(receiversData.phoneNumber, validEmails);
            answerMessage(createSuccessFeedbackMessage(':+1: Redirection added.'), receivedMessage);
        } else {
            answerMessage(
                createErrorMessage(
                    ':-1: You need to enter at least one valid phone number and one email address.'
                ),
                receivedMessage
            );
        }
    },
});
