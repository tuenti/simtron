import {RTMClient, WebClient, WebAPICallResult} from '@slack/client';
import logger from '../../util/logger';
import {getDevelopmentSlackChannelName, getSlackBotAdminUserIds} from '../../config';
import adaptMessage, {SlackMessage, SlackMessageContainer} from '../message-adapter/slack';
import {OutgoingMessage, IncomingMessage} from '../model/message';
import {IncomingMessageListener, Bot} from '..';

const ALL_CHANNELS = 10000000;

interface UserInfoPostMessageResult extends WebAPICallResult {
    ok: boolean;
    is_bot: boolean;
    deleted: boolean;
    is_restricted: boolean;
    is_ultra_restricted: boolean;
    user: {
        id: string;
        name: string;
    };
}

interface ConversationChannel {
    id: string;
    is_member: boolean;
    name: string;
}

interface ConversationsPostMessageResult extends WebAPICallResult {
    channels: ConversationChannel[];
}

const isMessage = (event: {type: string; text: string}) => event.type === 'message' && event.text;

const isMessageToChannel = (message: {channel: string}) => typeof message.channel === 'string';

const isFromUser = (message: {user: string}, userId: string) => message.user === userId;

export const sanitize = (text: string) =>
    text
        .toLowerCase()
        .replace(',', '')
        .replace('.', '')
        .replace(';', '');

const canAccessToChannel = (channel: ConversationChannel) =>
    channel.is_member && (!process.env.DEVELOPMENT || channel.name === getDevelopmentSlackChannelName());

const createSlackBot = (botToken: string) => {
    let botId: string;
    const retryConfig = {
        forever: true,
        maxTimeout: 60000,
    };

    const slackBot = new RTMClient(botToken, {retryConfig});
    const slackBotWebClient = new WebClient(botToken, {retryConfig});

    const postMessageToRecipients = (message: SlackMessage, channels: string[], userId: string | null) => {
        channels.map(channelId => {
            switch (message.container) {
                case SlackMessageContainer.PLAIN:
                    const plainMessage = {
                        channel: channelId,
                        user: message.isPrivate ? userId : undefined,
                        text: message.text,
                        as_user: true,
                    };
                    message.isPrivate && userId
                        ? slackBotWebClient.chat.postEphemeral({...plainMessage, user: userId})
                        : slackBotWebClient.chat.postMessage(plainMessage);
                    break;
                case SlackMessageContainer.RICH:
                    const richMessage = {
                        ...message,
                        channel: channelId,
                        user: message.isPrivate ? userId : undefined,
                        text: message.text,
                        as_user: true,
                    };
                    message.isPrivate && userId
                        ? slackBotWebClient.chat.postEphemeral({...richMessage, user: userId})
                        : slackBotWebClient.chat.postMessage(richMessage);
                    break;
            }
        });
    };

    const getChannels = async () => {
        const conversationsResult = await slackBotWebClient.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true,
            limit: ALL_CHANNELS,
        });
        const conversations = conversationsResult as ConversationsPostMessageResult;
        return conversations.channels.filter(canAccessToChannel).map(channel => channel.id);
    };

    const sendMessage = async (message: SlackMessage, userId: string | null) => {
        const channels = message.replyOn ? [message.replyOn] : await getChannels();
        postMessageToRecipients(message, channels, userId);
    };

    const isValidUser = (userInfo: UserInfoPostMessageResult) =>
        userInfo.ok &&
        !userInfo.is_bot &&
        !userInfo.deleted &&
        !userInfo.is_restricted &&
        !userInfo.is_ultra_restricted;

    const triggerMessageReceived = (
        listeners: IncomingMessageListener[],
        bot: Bot,
        messageData: IncomingMessage
    ) => {
        listeners.forEach(listener => {
            listener(bot, messageData);
        });
    };

    const bot = {
        listeners: <IncomingMessageListener[]>[],

        addListener(listener: IncomingMessageListener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message: OutgoingMessage, incomingMessage: IncomingMessage | null = null) {
            const slackMessage = adaptMessage(message, incomingMessage);
            if (slackMessage) {
                sendMessage(
                    slackMessage,
                    incomingMessage && incomingMessage.userId && slackMessage.isPrivate
                        ? incomingMessage.userId
                        : null
                );
            }
        },

        start() {
            return slackBot.start();
        },
    };

    slackBot.on('message', async message => {
        if (isMessage(message) && isMessageToChannel(message) && !isFromUser(message, botId)) {
            const userInfoResult = await slackBotWebClient.users.info({user: message.user});
            const userInfo = userInfoResult as UserInfoPostMessageResult;
            if (isValidUser(userInfo)) {
                const userName = userInfo.user.name;
                const userId = userInfo.user.id;
                const isFromAdmin = getSlackBotAdminUserIds().some((id: string) => userId === id);
                const channel = message.channel;
                const messageText = message.text;
                const messageData = {botId, userName, userId, isFromAdmin, channel, messageText};
                logger.debug(`Receiving message on slackBot, with botId: ${botId}, content: ${messageText}`);
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
