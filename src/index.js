import createSimtronPorts from './transport/port-factory';

createSimtronPorts().then(portsInfo => {
    console.log(portsInfo);
});
