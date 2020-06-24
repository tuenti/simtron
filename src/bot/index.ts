import createSlackBot from './handler/slack';
import createTeamsBot from './handler/teams';
import {getSlackBotToken, getTeamsChannelPostWebhookHost, getTeamsChannelPostWebhookPath} from '../config';
import {OutgoingMessage, IncomingMessage} from './model/message';

export type IncomingMessageListener = (bot: Bot, message: IncomingMessage) => void;

export interface Bot {
    addListener: (listener: IncomingMessageListener) => void;
    clearListeners: () => void;
    sendMessage: (message: OutgoingMessage, incomingMessage: IncomingMessage) => void;
    start: () => void;
}

export default {
    createBots: (): Bot[] => {
        const slackBot = createSlackBot(getSlackBotToken());
        const teamsBot = createTeamsBot(getTeamsChannelPostWebhookHost(), getTeamsChannelPostWebhookPath());
        return [slackBot, teamsBot];
    },
};
