import {RTMClient} from '@slack/rtm-api';
import {WebClient} from '@slack/web-api';
import logger from '../../util/logger';
import {getSlackBotId, getSlackChannelId} from '../../config';
import {IncomingMessageListener} from '..';
import {SlackMessage, SlackMessageContainer} from '../message-adapter/slack';

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

const createApiSlackBot = (botToken: string) => {
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

    const bot = {
        listeners: <IncomingMessageListener[]>[],

        addListener(listener: IncomingMessageListener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message: SlackMessage) {
            postMessageToBot(message, getSlackBotId());
        },

        start() {
            return slackBot.start();
        },
    };

    slackBot.on('message', async message => {
        if (isMessage(message) && isFromUser(message, getSlackBotId())) {
            console.log(message);
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
