import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_SIM_STATUS, ANSWER_CATALOG_MESSAGE, NOTIFY_SMS_RECEIVED} from '../model/message-type';
import {USER_MENTION, STRIKE_TEXT_MARK, BOLD_TEXT_MARK} from '../model/message-placeholder';

export const MESSAGE_TYPE_PLAIN = 'plain';
export const MESSAGE_TYPE_RICH = 'rich';

const replaceAll = (text, textToFind, replacementText) => {
    let resultText = text;
    while (resultText.includes(textToFind)) {
        resultText = resultText.replace(textToFind, replacementText);
    }
    return resultText;
}

const adaptSimStatusText = text => replaceAll(
        replaceAll(text, STRIKE_TEXT_MARK, '~'),
        BOLD_TEXT_MARK,
        '*'
    );

const adaptMessage = (message, repliedMessage) => {
    switch (message.type) {
        case NOTIFY_BOOTING:
        case NOTIFY_BOOT_DONE:
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: `:rocket: ${message.text}`,
            };
        case ANSWER_CATALOG_MESSAGE:
            const text = replaceAll(
                replaceAll(message.text, USER_MENTION, `@${repliedMessage.userName}`),
                BOLD_TEXT_MARK,
                '*'
            );
            return {
                container: MESSAGE_TYPE_RICH,
                text: `:+1: ${text}`,
                replyOn: repliedMessage.channel,
            };
        case ANSWER_SIM_STATUS:
            const messageText = message.text.reduce(
                (text,line) => `${text}\n${adaptSimStatusText(line)}`
                , ''
            );
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: messageText,
                replyOn: repliedMessage.channel,
            };
        case NOTIFY_SMS_RECEIVED:
            return {
                container: MESSAGE_TYPE_RICH,
                text: `*${message.text[0]}*`,
                attachments: [
                    {
                        author_name: ':envelope_with_arrow: SMS text:',
                        color: '#d9d9d9',
                        text: message.text[1],
                    }
                ],
            };
        default:
            return undefined;
    }
};

export default adaptMessage;