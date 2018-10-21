import {
    NOTIFY_BOOTING,
    NOTIFY_BOOT_DONE,
    ANSWER_SIM_STATUS,
    ANSWER_CATALOG_MESSAGE,
    NOTIFY_SMS_RECEIVED,
    NOTIFY_UNKNOWN_SIM_EXISTENCE,
    FREE_TEXT_QUESTION,
    SINGLE_SELECTION_QUESTION,
    ERROR,
    SUCCESS,
} from '../model/message-type';
import {USER_MENTION} from '../model/message';
import {getBotDisplayName} from '../../config';

export const MESSAGE_TYPE_PLAIN = 'plain';
export const MESSAGE_TYPE_RICH = 'rich';

const adaptMessage = (message, repliedMessage) => {
    switch (message.type) {
        case NOTIFY_BOOTING:
        case NOTIFY_BOOT_DONE:
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: `:rocket: ${message.text}`,
            };
        case ANSWER_CATALOG_MESSAGE:
            const text = message.text.replace(USER_MENTION, `@${repliedMessage.userName}`);
            return {
                container: MESSAGE_TYPE_RICH,
                text: text,
                replyOn: repliedMessage.channel,
            };
        case ANSWER_SIM_STATUS:
            const messageText =
                message.textLines.length > 0
                    ? message.textLines.reduce((text, line) => `${text}\n${line}`, '')
                    : 'No SIM cards detected.';
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: messageText,
                replyOn: repliedMessage.channel,
            };
        case NOTIFY_UNKNOWN_SIM_EXISTENCE:
            return {
                container: MESSAGE_TYPE_RICH,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text:
                    message.textLines.length > 1
                        ? `There are *${
                              message.textLines.length
                          } unknown SIM cards* needing to be identified:`
                        : 'There is an *unknown SIM* card needing to be identified:',
                attachments: message.textLines.map((line, index) => ({
                    color: '#D3D3D3',
                    text: line,
                    footer: `To identify this sim, type: *${getBotDisplayName()} id ${
                        message.textLines.length > 1 ? index + 1 : ''
                    }*`,
                })),
            };
        case NOTIFY_SMS_RECEIVED:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.textLines[0],
                attachments: [
                    {
                        author_name: ':envelope_with_arrow: New sms:',
                        color: '#D3D3D3',
                        text: message.textLines[1],
                    },
                ],
            };
        case FREE_TEXT_QUESTION:
            const [question] = message.textLines;
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: question,
                replyOn: repliedMessage.channel,
            };
        case SINGLE_SELECTION_QUESTION:
            const [questionText, ...options] = message.textLines;
            return {
                container: MESSAGE_TYPE_RICH,
                text: questionText,
                replyOn: repliedMessage.channel,
                attachments: options.map((option, index) => ({
                    color: '#D3D3D3',
                    text: `${index + 1}) ${option}`,
                })),
            };
        case SUCCESS:
            return {
                container: MESSAGE_TYPE_PLAIN,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text: `${message.text.replace(USER_MENTION, `@${repliedMessage.userName}`)}`,
            };
        case ERROR:
            return {
                container: MESSAGE_TYPE_PLAIN,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text: `${message.text.replace(USER_MENTION, `@${repliedMessage.userName}`)}`,
            };
        default:
            return undefined;
    }
};

export default adaptMessage;
