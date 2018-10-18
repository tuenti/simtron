import {RTMClient, WebClient} from '@slack/client';
import logger from '../../util/logger';
import {getDevelopmentSlackChannelName, getSlackBotNames, getSlackBotAdminUserIds} from '../../config';
import adaptMessage, {MESSAGE_TYPE_RICH, MESSAGE_TYPE_PLAIN} from '../message-adapter/slack';

const isMessage = event => event.type === 'message' && event.text;

const isMessageToChannel = message => typeof message.channel === 'string';

const isFromUser = (event, userId) => event.user === userId;

export const sanitize = text =>
    text
        .toLowerCase()
        .replace(',', '')
        .replace('.', '')
        .replace(';', '');

export const getValueFromMessage = (message, possibleTexts) => {
    const messageText = sanitize(message.text);
    const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
    const tokens = messageText.split(' ');
    return texts.find(text => tokens.includes(text.toLowerCase()));
};

const messageContainsAnyText = (event, possibleTexts) => !!getValueFromMessage(event, possibleTexts);

const canAccessToChannel = channel =>
    channel.is_member && (!process.env.DEVELOPMENT || channel.name === getDevelopmentSlackChannelName());

const createSlackBot = botToken => {
    let botId;
    const slackBot = new RTMClient(botToken, {});
    const slackBotWebClient = new WebClient(botToken);

    const postMessageToRecipients = (message, recipients) => {
        recipients.map(recipientId => {
            message.container === MESSAGE_TYPE_PLAIN &&
                slackBotWebClient.chat.postMessage({
                    channel: recipientId,
                    text: message.text,
                    as_user: true,
                });
            message.container === MESSAGE_TYPE_RICH &&
                slackBotWebClient.chat.postMessage({
                    ...message,
                    channel: recipientId,
                    text: message.text,
                    as_user: true,
                });
        });
    };

    const getChannels = async () => {
        const conversations = await slackBotWebClient.conversations.list({
            types: 'public_channel,private_channel',
        });
        return conversations.channels.filter(canAccessToChannel).map(channel => channel.id);
    };

    const sendMessage = async message => {
        const recipients = message.replyOn ? [message.replyOn] : await getChannels();
        postMessageToRecipients(message, recipients);
    };

    const isValidUser = userInfo =>
        userInfo.ok &&
        !userInfo.is_bot &&
        !userInfo.deleted &&
        !userInfo.is_restricted &&
        !userInfo.is_ultra_restricted;

    const triggerMessageReceived = (listeners, bot, messageData) => {
        listeners.forEach(listener => {
            listener(bot, messageData);
        });
    };

    const bot = {
        listeners: [],
        addListener(listener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message, repliedMessage = {}) {
            const slackMessage = adaptMessage(message, repliedMessage);
            if (slackMessage) {
                sendMessage(slackMessage);
            }
        },

        start() {
            return slackBot.start();
        },
    };

    slackBot.on('message', async event => {
        if (
            isMessage(event) &&
            isMessageToChannel(event) &&
            !isFromUser(event, botId) &&
            messageContainsAnyText(event, getSlackBotNames())
        ) {
            const userInfo = await slackBotWebClient.users.info({user: event.user});
            if (isValidUser(userInfo)) {
                const userName = userInfo.user.name;
                const userId = userInfo.user.id;
                const isFromAdmin = getSlackBotAdminUserIds().some(id => userId === id);
                const channel = event.channel;
                const messageText = event.text;
                const messageData = {userName, userId, isFromAdmin, channel, messageText};
                logger.debug(`Receiving event on slackBot, with botId: ${botId}, content: ${messageText}`);
                triggerMessageReceived(bot.listeners, bot, messageData);
            }
        }
    });

    slackBot.on('authenticated', rtmStartData => {
        botId = rtmStartData.self.id;
        logger.debug(
            `Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`
        );
    });

    return bot;
};

export default createSlackBot;
