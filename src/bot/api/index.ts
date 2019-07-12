import {RTMClient} from '@slack/rtm-api';
import {WebClient} from '@slack/web-api';
import logger from '../../util/logger';
import {getSlackBotId, getSlackChannelId} from '../../config';
import {SlackMessage, SlackMessageContainer} from '../message-adapter/slack';
import {Sim} from '../../graphql/types';
import {LINE_INFO} from '../../util/matcher';

type MessageListener = (message: SlackMessage) => void;

export interface ApiBot {
    addListener: (listener: MessageListener) => void;
    clearListeners: () => void;
    getSims: () => Promise<Sim[]>;
    start: () => void;
}

const isMessage = (event: {type: string; text: string}) => event.type === 'message' && event.text;

const isFromUser = (message: {bot_id: string}, botId: string) => {
    return message.bot_id === botId;
};

export const sanitize = (text: string) =>
    text
        .toLowerCase()
        .replace(',', '')
        .replace('.', '')
        .replace(';', '');

const createApiSlackBot = (botToken: string): ApiBot => {
    let botId: string;
    const retryConfig = {
        forever: true,
        maxTimeout: 60000,
    };

    const slackBot = new RTMClient(botToken, {retryConfig});
    const slackBotWebClient = new WebClient(botToken, {retryConfig});

    const postMessageToBot = (message: SlackMessage, botId: string) => {
        switch (message.container) {
            case SlackMessageContainer.PLAIN:
                const plainMessage = {
                    channel: getSlackChannelId(),
                    user: botId,
                    text: message.text,
                    as_user: true,
                };
                slackBotWebClient.chat.postMessage(plainMessage);
                break;
            case SlackMessageContainer.RICH:
                const richMessage = {
                    ...message,
                    channel: getSlackChannelId(),
                    user: botId,
                    text: message.text,
                    as_user: true,
                };
                slackBotWebClient.chat.postMessage(richMessage);
                break;
        }
    };

    const sendMessage = (message: SlackMessage) => {
        postMessageToBot(message, getSlackBotId());
    };

    let ongoingRequestResolver: ((message: any) => void) | null = null;

    const bot = {
        listeners: <MessageListener[]>[],

        addListener(listener: MessageListener) {
            this.listeners.push(listener);
        },

        async getSims() {
            return new Promise<Sim[]>(simsResolver => {
                ongoingRequestResolver = simsResolver;
                sendMessage({
                    container: SlackMessageContainer.PLAIN,
                    text: 'simtron',
                    isPrivate: false,
                });
            });
        },

        clearListeners() {
            this.listeners = [];
        },

        start() {
            return slackBot.start();
        },
    };

    const getPhoneNumber = (phoneNumberText: string) =>
        phoneNumberText.startsWith('~')
            ? phoneNumberText.substr(1, phoneNumberText.length - 2)
            : phoneNumberText;

    const isOnline = (phoneNumberText: string) => !phoneNumberText.startsWith('~');

    const getBrand = (flag: string) => {
        const brands: {[index: string]: string} = {
            'flag-es': 'ES',
            'flag-gb': 'UK',
            'flag-ar': 'AR',
            'flag-br': 'BR',
            'flag-ec': 'EC',
            'flag-uy': 'UY',
        };
        return brands[flag] || 'ES';
    };

    const extractSimsFromMessage = (messageText: string) => {
        let sims: Sim[] = [];
        const regexp = LINE_INFO;
        let match = regexp.exec(messageText);
        while (match != null) {
            sims.push({
                phoneNumber: getPhoneNumber(match[2]),
                country: getBrand(match[1]),
                brand: match[3],
                lineType: match[4],
                isOnline: isOnline(match[2]),
            });
            match = regexp.exec(messageText);
        }
        LINE_INFO.lastIndex = 0;
        return sims;
    };

    slackBot.on('message', async message => {
        if (isMessage(message) && isFromUser(message, getSlackBotId())) {
            let canBeSmsMessage = true;
            if (ongoingRequestResolver) {
                const sims = extractSimsFromMessage(message.text);
                if (sims.length > 0) {
                    ongoingRequestResolver(sims);
                    ongoingRequestResolver = null;
                    canBeSmsMessage = false;
                }
            }
            if (canBeSmsMessage) {
                bot.listeners.map(listener => {
                    listener(message);
                });
            }
        }
    });

    slackBot.on('authenticated', rtmStartData => {
        botId = rtmStartData.self.id;
        logger.debug(
            `Api client logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${
                rtmStartData.team.name
            }`
        );
    });

    return bot;
};

export default createApiSlackBot;
