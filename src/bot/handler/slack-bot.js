import {RTMClient, WebClient} from '@slack/client';
import logger from '../../logger';
import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_SIM_STATUS, ANSWER_CATALOG_MESSAGE} from '../model/message-type';
import {getDevelopmentSlackChannelName, getSlackBotNames, getSlackBotAdminUserIds} from '../../config';
import { USER_MENTION, STRIKE_TEXT_MARK, BOLD_TEXT_MARK } from '../model/message-placeholder';

const MESSAGE_TYPE_PLAIN = 'plain';
const MESSAGE_TYPE_RICH = 'rich';

const isMessage = event => event.type === 'message' && event.text;

const isMessageToChannel = message => typeof message.channel === 'string';

const isFromUser = (event, userId) => event.user === userId;

export const sanitize = text =>
  text
    .toLowerCase()
    .replace(",", "")
    .replace(".", "")
    .replace(";", "");

export const getValueFromMessage = (message, possibleTexts) => {
  const messageText = sanitize(message.text);
  const texts = Array.isArray(possibleTexts) ? possibleTexts : [possibleTexts];
  const tokens = messageText.split(" ");
  return texts.find(text => tokens.includes(text.toLowerCase()));
};

const messageContainsAnyText = (event, possibleTexts) => !!getValueFromMessage(event, possibleTexts);

const canAccessToChannel = channel =>
    channel.is_member
    && (!process.env.DEVELOPMENT || channel.name === getDevelopmentSlackChannelName());

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
            types: 'public_channel,private_channel'
        });
        return conversations.channels
            .filter(canAccessToChannel)
            .map(channel => channel.id);
    }

    const sendMessage = async (message) => {
        const recipients = message.replyOn ? [message.replyOn] : await getChannels();
        postMessageToRecipients(message, recipients);
    };

    const isValidUser = userInfo => userInfo.ok
        && !userInfo.is_bot
        && !userInfo.deleted
        && !userInfo.is_restricted
        && !userInfo.is_ultra_restricted;

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

    const adaptMessageToSlackFormat = (message, repliedMessage) => {
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
                return {};
            default:
                return undefined;
        }
    };

    const triggerMessageReceived = (listeners, bot, messageData) => {
        listeners.forEach(listener => {
            listener(bot, messageData);
        })
    }

    const bot = {
        listeners: [],
        addListener(listener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message, repliedMessage = {}) {
            const slackMessage = adaptMessageToSlackFormat(message, repliedMessage);
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
                logger.debug(
                    `Receiving event on slackBot, with botId: ${botId}, content: ${messageText}`
                );
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
