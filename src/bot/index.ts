import createSlackBot from './handler/slack';
import {getSlackBotToken} from '../config';
import {OutgoingMessage, IncomingMessage} from './model/message';

export interface Bot {
    addListener: (listener: (bot: Bot, message: OutgoingMessage) => void) => void;
    clearListeners: () => void;
    sendMessage: (message: OutgoingMessage, incomingMessage: IncomingMessage) => void;
    start: () => void;
}

export default {
    createBots: (): Bot[] => {
        const slackBot = createSlackBot(getSlackBotToken());
        return [slackBot];
    },
};
