import {RTMClient, WebClient} from '@slack/client';
import logger from '../../logger';
import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE} from '../model/message-type';
import { getDevelopmentSlackChannelName } from '../../config';

const MESSAGE_TYPE_PLAIN = 'plain';
const MESSAGE_TYPE_RICH = 'rich';

const defaultOptions = {
    usePictures: false,
    logger: console,
    rtmOptions: {},
};

const isMessage = event => event.type === 'message' && event.text;

const isMessageToChannel = message => typeof message.channel === 'string';

const isFromUser = (event, userId) => event.user === userId;

const messageContainsAnyText = (event, possibleTexts) => !!getValueFromMessage(event, possibleTexts);

const createSlackBot = (botToken, options = {}) => {
    let botId;

    const slackBotOptions = Object.assign({}, defaultOptions, options);
    const slackBot = new RTMClient(botToken, slackBotOptions.rtmOptions);
    const slackBotWebClient = new WebClient(botToken);

    const postMessageToChannels = (message, channels) => {
        channels.map(channel => {
            message.container === MESSAGE_TYPE_PLAIN &&
                slackBotWebClient.chat.postMessage({
                    channel: channel.id,
                    text: message.text,
                    as_user: true,
                });
            message.container === MESSAGE_TYPE_RICH &&
                slackBotWebClient.chat.postMessage({
                    ...message,
                    channel: channel.id,
                    text: message.text,
                    as_user: true,
                });
        });
    };

    const canAccessToChannel = channel => channel.is_member
        && (!process.env.DEVELOPMENT || channel.name === getDevelopmentSlackChannelName());

    const getChannels = async () => {
        const conversations = await slackBotWebClient.conversations.list({
            types: 'public_channel,private_channel'
        });
        return conversations.channels.filter(canAccessToChannel);
    }

    const adaptMessageToSlackFormat = message => {
        switch (message.type) {
            case NOTIFY_BOOTING:
            case NOTIFY_BOOT_DONE:
                return {
                    container: MESSAGE_TYPE_PLAIN,
                    text: `:rocket: ${message.text}`,
                };
            default:
                return undefined;
        }
    };

    const sendMessage = async message => {
        const channels = await getChannels();
        postMessageToChannels(message, channels);
    };

    const answerChannel = ({event, message}) => {
        const msgOptions = {as_user: true};
        slackBotWebClient.chat.postMessage(event.channel, message, msgOptions);
    };

    const messageUserName = (username, text) => (username ? `@${username} ` : ' ') + text;

    const speeches = [
        {
            condition: ({event, dictionary}) => messageContainsAnyText(event, dictionary.getMsisdns()),
            action: ({event, username}) => {
                answerChannel({
                    opt,
                    event,
                    message: messageUserName(username, 'Admin actions are restricted'),
                });
            },
        },
    ];

    slackBot.on('message', event => {
        if (
            isMessage(event) &&
            isMessageToChannel(event) &&
            !isFromUser(event, botId) &&
            messageContainsAnyText(event, slackBotOptions.botIds)
        ) {
            slackBotWebClient.users.info(event.user).then(response => {
                const username = response && response.user && response.user.name;

                answerChannel({
                    opt,
                    event,
                    message: 'Oops, there was an error!',
                });
            });
        }
    });

    slackBot.on('authenticated', rtmStartData => {
        botId = rtmStartData.self.id;
        logger.debug(
            `Logged in as ${rtmStartData.self.name} (id: ${botId}) of team ${rtmStartData.team.name}`
        );
    });

    return {
        messageListeners: [],
        addListener(listener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message) {
            const slackMessage = adaptMessageToSlackFormat(message);
            sendMessage(slackMessage);
        },

        start() {
            return slackBot.start();
        },
    };
};

export default createSlackBot;
