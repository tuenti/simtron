import {MessageType} from '../model/message-type';
import {createSuccessFeedbackMessage, IncomingMessage} from '../model/message';
import {getBotNames} from '../../config';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

const ENABLE_NOTIFICATIONS_COMMAND = 'enable';
const DISABLE_NOTIFICATIONS_COMMAND = 'disable';
const SUBJECT = 'notifications';
const DESCRIPTION = 'activity';

const isCommandMessage = (messageText: string, commandWord: string) => {
    const words = messageText.split(' ');
    const [botName, command, description, subject] = words;
    return (
        getBotNames().includes(botName) &&
        command === commandWord &&
        description === DESCRIPTION &&
        subject === SUBJECT
    );
};

const isEnablePortActivityNotificationsMessage = (messageText: string) =>
    isCommandMessage(messageText, ENABLE_NOTIFICATIONS_COMMAND);

const isDisablePortActivityNotificationsMessage = (messageText: string) =>
    isCommandMessage(messageText, DISABLE_NOTIFICATIONS_COMMAND);

const changePortActivityNotifications = async (
    command: string,
    receivedMessage: IncomingMessage,
    store: Store,
    answerMessage: AnswerMessageCallback
) => {
    store.settings.setPortActivityNotificationsStatus(command === ENABLE_NOTIFICATIONS_COMMAND);
    answerMessage(
        createSuccessFeedbackMessage(
            command === ENABLE_NOTIFICATIONS_COMMAND
                ? ':+1: Notifications enabled.'
                : ':+1: Notifications disabled.'
        ),
        receivedMessage
    );
};

export const createEnablePortActivityNotifications = () => ({
    messageType: MessageType.ENABLE_PORT_ACTIVITY_NOTIFICATIONS,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isEnablePortActivityNotificationsMessage(receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) =>
        changePortActivityNotifications(ENABLE_NOTIFICATIONS_COMMAND, receivedMessage, store, answerMessage),
});

export const createDisablePortActivityNotifications = () => ({
    messageType: MessageType.DISABLE_PORT_ACTIVITY_NOTIFICATIONS,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        isDisablePortActivityNotificationsMessage(receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) =>
        changePortActivityNotifications(DISABLE_NOTIFICATIONS_COMMAND, receivedMessage, store, answerMessage),
});
