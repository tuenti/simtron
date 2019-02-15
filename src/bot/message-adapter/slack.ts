import {MessageType} from '../model/message-type';
import {USER_MENTION, OutgoingMessage, IncomingMessage} from '../model/message';
import {getBotDisplayName} from '../../config';
import {SIM_IDENTIFICATION_COMMAND} from '../speech/sim-identification';

export const MESSAGE_TYPE_PLAIN = 'plain';
export const MESSAGE_TYPE_RICH = 'rich';

const adaptMessage = (message: OutgoingMessage, repliedMessage: IncomingMessage) => {
    switch (message.type) {
        case MessageType.NOTIFY_BOOTING:
        case MessageType.NOTIFY_BOOT_DONE:
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: `:rocket: ${message.text}`,
            };
        case MessageType.ANSWER_CATALOG:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.text ? message.text.replace(USER_MENTION, `@${repliedMessage.userName}`) : '',
                replyOn: repliedMessage.channel,
            };
        case MessageType.ANSWER_CATALOG_CONTENT:
            const messageText =
                message.textLines && message.textLines.length > 0
                    ? message.textLines.reduce((text, line) => `${text}\n${line}`, '')
                    : 'No SIM cards detected.';
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: messageText,
                replyOn: repliedMessage.channel,
            };
        case MessageType.ANSWER_SIM_DETAILS:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.text ? message.text.replace(USER_MENTION, `@${repliedMessage.userName}`) : '',
                replyOn: repliedMessage.channel,
            };
        case MessageType.ANSWER_SIM_DETAILS_CONTENT:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.text,
                attachments: message.attachments
                    ? message.attachments.map(attachment => ({
                          fields: attachment.fields.map(field => ({
                              title: field.name,
                              value: field.value,
                              short: true,
                          })),
                      }))
                    : [],
                replyOn: repliedMessage.channel,
            };
        case MessageType.NOTIFY_UNKNOWN_SIM_EXISTENCE:
            return {
                container: MESSAGE_TYPE_RICH,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text:
                    message.textLines && message.textLines.length > 1
                        ? `There are *${
                              message.textLines.length
                          } unknown SIM cards* needing to be identified:`
                        : 'There is an *unknown SIM* card needing to be identified:',
                attachments: message.textLines
                    ? message.textLines.map((line, index) => ({
                          color: '#D3D3D3',
                          text: line,
                          footer: `To identify this sim, type: *${getBotDisplayName()} ${SIM_IDENTIFICATION_COMMAND} ${
                              message.textLines && message.textLines.length > 1 ? index + 1 : ''
                          }*`,
                      }))
                    : [],
            };
        case MessageType.NOTIFY_SMS_RECEIVED:
            return {
                container: MESSAGE_TYPE_RICH,
                text: message.textLines && message.textLines.length > 0 ? message.textLines[0] : 'Empty SMS',
                attachments: [
                    {
                        author_name: ':envelope_with_arrow: New sms:',
                        color: '#D3D3D3',
                        text: message.textLines && message.textLines.length > 1 ? message.textLines[1] : '',
                    },
                ],
            };
        case MessageType.FREE_TEXT_QUESTION:
            const [question] = message.textLines ? message.textLines : [''];
            return {
                container: MESSAGE_TYPE_PLAIN,
                text: question,
                replyOn: repliedMessage.channel,
            };
        case MessageType.SINGLE_SELECTION_QUESTION:
            const [questionText, ...options] = message.textLines ? message.textLines : [''];
            return {
                container: MESSAGE_TYPE_RICH,
                text: questionText,
                replyOn: repliedMessage.channel,
                attachments: options.map((option, index) => ({
                    color: '#D3D3D3',
                    text: `${index + 1}) ${option}`,
                })),
            };
        case MessageType.SUCCESS:
            return {
                container: MESSAGE_TYPE_PLAIN,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text: `${
                    message.text ? message.text.replace(USER_MENTION, `@${repliedMessage.userName}`) : ''
                }`,
            };
        case MessageType.ERROR:
            return {
                container: MESSAGE_TYPE_PLAIN,
                isPrivate: true,
                replyOn: repliedMessage.channel,
                text: `${
                    message.text ? message.text.replace(USER_MENTION, `@${repliedMessage.userName}`) : ''
                }`,
            };
        default:
            return undefined;
    }
};

export default adaptMessage;
