import {MessageType} from '../model/message-type';
import {USER_MENTION, OutgoingMessage, IncomingMessage} from '../model/message';

export enum SlackMessageContainer {
    PLAIN = 'plain',
    RICH = 'rich',
}

interface SlackMessageAttachmentField {
    title: string;
    value: string;
    short: boolean;
}

interface SlackMessageAttachment {
    text?: string;
    color?: string;
    fields?: SlackMessageAttachmentField[];
    author_name?: string;
    footer?: string;
}

export interface SlackMessage {
    container: SlackMessageContainer;
    isPrivate: boolean;
    text: string;
    replyOn?: string;
    attachments?: SlackMessageAttachment[];
}

const adaptMessage = (
    message: OutgoingMessage,
    incomingMessage: IncomingMessage | null
): SlackMessage | null => {
    switch (message.type) {
        case MessageType.NOTIFY_BOOTING:
        case MessageType.NOTIFY_BOOT_DONE:
            return {
                container: SlackMessageContainer.PLAIN,
                text: `:rocket: ${message.text}`,
                isPrivate: false,
            };
        case MessageType.ANSWER_CATALOG:
            return incomingMessage
                ? {
                      container: SlackMessageContainer.RICH,
                      text: message.text
                          ? message.text.replace(USER_MENTION, `@${incomingMessage.userName}`)
                          : '',
                      isPrivate: false,
                      replyOn: incomingMessage.channel,
                  }
                : null;
        case MessageType.ANSWER_CATALOG_CONTENT:
            const messageText =
                message.textLines && message.textLines.length > 0
                    ? message.textLines.reduce((text, line) => `${text}\n${line}`, '')
                    : 'No SIM cards detected.';
            return incomingMessage
                ? {
                      container: SlackMessageContainer.PLAIN,
                      text: messageText,
                      replyOn: incomingMessage.channel,
                      isPrivate: false,
                  }
                : null;
        case MessageType.ANSWER_SIM_DETAILS:
            return incomingMessage
                ? {
                      container: SlackMessageContainer.RICH,
                      text: message.text
                          ? message.text.replace(USER_MENTION, `@${incomingMessage.userName}`)
                          : '',
                      replyOn: incomingMessage.channel,
                      isPrivate: false,
                  }
                : null;
        case MessageType.SIM_DETAILS_CONTENT:
            return {
                container: SlackMessageContainer.RICH,
                text: message.text ? message.text : '',
                attachments: message.attachments
                    ? message.attachments.map((attachment) => ({
                          fields: attachment.fields.map((field) => ({
                              title: field.name,
                              value: field.value,
                              short: true,
                          })),
                      }))
                    : [],
                replyOn: incomingMessage ? incomingMessage.channel : undefined,
                isPrivate: false,
            };
        case MessageType.NOTIFY_UNKNOWN_SIM_EXISTENCE:
            return incomingMessage
                ? {
                      container: SlackMessageContainer.RICH,
                      isPrivate: true,
                      replyOn: incomingMessage.channel,
                      text:
                          message.textLines && message.textLines.length > 1
                              ? `There are *${message.textLines.length} unknown SIM cards* needing to be identified:`
                              : 'There is an *unknown SIM* card needing to be identified:',
                      attachments: message.textLines
                          ? message.textLines.map((line) => {
                                const [simLine, footer] = line.split('|');
                                return {
                                    color: '#D3D3D3',
                                    text: simLine,
                                    footer,
                                };
                            })
                          : [],
                  }
                : null;
        case MessageType.NOTIFY_SMS_RECEIVED:
            return {
                container: SlackMessageContainer.RICH,
                text: message.textLines && message.textLines.length > 0 ? message.textLines[0] : 'Empty SMS',
                isPrivate: false,
                attachments: [
                    {
                        author_name: ':envelope_with_arrow: New sms:',
                        color: '#D3D3D3',
                        text: message.textLines && message.textLines.length > 1 ? message.textLines[1] : '',
                    },
                ],
            };
        case MessageType.NOTIFY_PORT_ACTIVITY_DETECTED:
            return {
                container: SlackMessageContainer.RICH,
                text:
                    message.textLines && message.textLines.length > 0
                        ? message.textLines[0]
                        : 'Activity detected on port.',
                isPrivate: false,
                attachments: [
                    {
                        color: '#D3D3D3',
                        text:
                            ':ballot_box_with_ballot: Activity detected on simtron device affecting this *SIM* card',
                    },
                ],
            };
        case MessageType.FREE_TEXT_QUESTION:
            const [question] = message.textLines ? message.textLines : [''];
            return incomingMessage
                ? {
                      container: SlackMessageContainer.PLAIN,
                      text: question,
                      replyOn: incomingMessage.channel,
                      isPrivate: false,
                  }
                : null;
        case MessageType.SINGLE_SELECTION_QUESTION:
            const [questionText, ...options] = message.textLines ? message.textLines : [''];
            return incomingMessage
                ? {
                      container: SlackMessageContainer.RICH,
                      text: questionText,
                      replyOn: incomingMessage.channel,
                      isPrivate: false,
                      attachments: options.map((option, index) => ({
                          color: '#D3D3D3',
                          text: `${index + 1}) ${option}`,
                      })),
                  }
                : null;
        case MessageType.SUCCESS:
            return incomingMessage
                ? {
                      container: SlackMessageContainer.PLAIN,
                      isPrivate: true,
                      replyOn: incomingMessage.channel,
                      text: `${
                          message.text
                              ? message.text.replace(USER_MENTION, `@${incomingMessage.userName}`)
                              : ''
                      }`,
                  }
                : null;
        case MessageType.ERROR:
            return incomingMessage
                ? {
                      container: SlackMessageContainer.PLAIN,
                      isPrivate: true,
                      replyOn: incomingMessage.channel,
                      text: `${
                          message.text
                              ? message.text.replace(USER_MENTION, `@${incomingMessage.userName}`)
                              : ''
                      }`,
                  }
                : {
                      container: SlackMessageContainer.PLAIN,
                      isPrivate: false,
                      text: `${message.text ? message.text : ''}`,
                  };
        default:
            return null;
    }
};

export default adaptMessage;
