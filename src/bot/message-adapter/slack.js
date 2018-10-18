import {
    NOTIFY_BOOTING,
    NOTIFY_BOOT_DONE,
    ANSWER_SIM_STATUS,
    ANSWER_CATALOG_MESSAGE,
    NOTIFY_SMS_RECEIVED,
} from '../model/message-type';
import {USER_MENTION} from '../model/message';

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
        case NOTIFY_SMS_RECEIVED:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.text[0],
                attachments: [
                    {
                        author_name: ':envelope_with_arrow: New sms:',
                        color: '#D3D3D3',
                        text: message.text[1],
                    },
                ],
            };
        default:
            return undefined;
    }
};

export default adaptMessage;
