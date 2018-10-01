import {RTMClient, WebClient, RTM_EVENTS, CLIENT_EVENTS} from '@slack/client';
import logger from '../logger';

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

    const postMessageToChannels = message => channels => {
        channels.map(channel => {
            message.container === MESSAGE_TYPE_PLAIN &&
                slackBotWebClient.chat.postMessage(channel.id, message.text, {as_user: true});
            message.container === MESSAGE_TYPE_RICH &&
                slackBotWebClient.chat.postMessage(channel.id, message.text, {...message, as_user: true});
        });
    };

    const getGroups = () => slackBotWebClient.groups.list().then(res => res.groups);
    const getChannels = () =>
        slackBotWebClient.channels.list().then(res => res.channels.filter(channel => channel.is_member));

    const writeMessage = line => {
        const message = parseMessage(line);
        getGroups().then(postMessageToChannels(message));
        getChannels().then(postMessageToChannels(message));
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
        logger.info(
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

        start() {
            slackBot.start();
        },
    };
};

export default createSlackBot;
