import createSlackBot from "./handler/slack";
import {getSlackBotToken} from '../config';

export default {
    createBots: () => {
        const slackBot = createSlackBot(getSlackBotToken());
        return [slackBot];
    }
};
