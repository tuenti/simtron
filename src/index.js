import createSimtronPorts from './device-port/port-factory';
import createSlackBot from './bots/slack-bot';
import {getSlackBotToken} from './config';
import createSimtronController from './simtron-controller';

let simtronController = null;

createSimtronPorts().then(devicePortHandlers => {
    const slackBot = createSlackBot(getSlackBotToken());

    simtronController = createSimtronController(devicePortHandlers, {}, [slackBot]);
    simtronController.start();
});
