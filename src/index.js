import portsFactory from './device-port/port-factory';
import createSlackBot from './bot/handler/slack';
import {getSlackBotToken} from './config';
import createSimtronController from './simtron-controller';
import createSimStatusHandler from './sim-status-handler';
import createSimCatalog from './store/sim-card/catalog';
import createSmsStore from './store/sms/received-sms';

const slackBot = createSlackBot(getSlackBotToken());
const store = createSimCatalog();
const receivedSms = createSmsStore();
const simtronController = createSimtronController([slackBot], portsFactory, store, receivedSms);
simtronController.start();
