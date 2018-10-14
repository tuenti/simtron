import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_SIM_STATUS, ANSWER_CATALOG_MESSAGE} from '../model/message-type';
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
            return {
                container: MESSAGE_TYPE_RICH,
                attachments: [
                    {
                        color: '#2eb886',
                        text: replaceAll(
                            replaceAll(message.text, USER_MENTION, `@${repliedMessage.userName}`),
                            BOLD_TEXT_MARK,
                            '*'
                        ),
                    }
                ],
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
        default:
            return undefined;
    }
};

export default adaptMessage;