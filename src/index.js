import portsFactory from './device-port/port-factory';
import createSlackBot from './bot/handler/slack';
import {getSlackBotToken} from './config';
import createSimtronController from './simtron-controller';
import createStore from './store';

const slackBot = createSlackBot(getSlackBotToken());
const store = createStore();
const simtronController = createSimtronController([slackBot], portsFactory, store);
simtronController.start();
