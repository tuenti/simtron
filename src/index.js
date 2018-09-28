import createSimtronPorts from './transport/port-factory';
import logger from './logger';

createSimtronPorts().then(portsInfo => {
    console.log(portsInfo);
});
