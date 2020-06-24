import {MessageType} from '../model/message-type';
import {OutgoingMessage} from '../model/message';
import {getFlagsUnicodeMap} from '../../config';

export interface TeamsMessage {
    '@context': string;
    '@type': string;
    title?: string;
    text: string;
}

const formatText = (textToReplaceIn: string, flags: {[key: string]: string}): string =>
    Object.keys(flags)
        .reduce((text: string, flag: string) => {
            return text.replace(flag, flags[flag]);
        }, textToReplaceIn)
        .replace(/\*/g, '');

const adaptMessage = (message: OutgoingMessage): TeamsMessage | null => {
    switch (message.type) {
        case MessageType.NOTIFY_BOOTING:
        case MessageType.NOTIFY_BOOT_DONE:
            return {
                '@context': 'http://schema.org/extensions',
                '@type': 'MessageCard',
                text: `&#x1F680; ${message.text}`,
            };
        case MessageType.NOTIFY_SMS_RECEIVED:
            return {
                '@context': 'http://schema.org/extensions',
                '@type': 'MessageCard',
                title: formatText(
                    message.textLines && message.textLines.length > 0 ? message.textLines[0] : 'Empty SMS',
                    getFlagsUnicodeMap()
                ),
                text: message.textLines && message.textLines.length > 1 ? message.textLines[1] : '',
            };
        case MessageType.NOTIFY_PORT_ACTIVITY_DETECTED:
            return {
                '@context': 'http://schema.org/extensions',
                '@type': 'MessageCard',
                title: formatText(
                    message.textLines && message.textLines.length > 0
                        ? message.textLines[0]
                        : 'Activity detected on port.',
                    getFlagsUnicodeMap()
                ),
                text: '&#x1F5F3;&#xFE0F; Activity detected on simtron device affecting this *SIM* card',
            };
        default:
            return null;
    }
};

export default adaptMessage;
