import portsFactory from './device-port/port-factory';
import createSlackBot from './bots/handlers/slack-bot';
import {getSlackBotToken} from './config';
import createSimtronController from './simtron-controller';

const slackBot = createSlackBot(getSlackBotToken());
const simtronController = createSimtronController(portsFactory, [], [slackBot]);
simtronController.start();
