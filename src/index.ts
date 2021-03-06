import portsFactory from './device-port/port-factory';
import botFactory from './bot';
import createSimtronController from './simtron-controller';
import createStore from './store';

const store = createStore();
const simtronController = createSimtronController(botFactory, portsFactory, store);
simtronController.start();
