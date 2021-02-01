import createTeamsBot from './handler/teams';
import {getTeamsChannelPostWebhookHost, getTeamsChannelPostWebhookPath} from '../config';
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
        const teamsBot = createTeamsBot(getTeamsChannelPostWebhookHost(), getTeamsChannelPostWebhookPath());
        return [teamsBot];
    },
};
