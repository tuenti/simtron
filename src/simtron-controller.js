import {createBootingMessage, createBootDoneMessage} from './bots/message/models';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {
    const handlePortIncomingLine = (port, line) => {
        console.log(`${port.portId}: ${line}`);
    };

    const startBots = async bots =>
        Promise.all(
            bots.map(bot => {
                return bot.start();
            })
        );

    const sendMessageOnAllBots = (bots, message) =>
        bots.forEach(bot => {
            return bot.sendMessage(message);
        });

    return {
        devicePortHandlers: [],
        simsCatalog,
        bots,

        async start() {
            await startBots(bots);
            sendMessageOnAllBots(bots, createBootingMessage());
            this.devicePortHandlers = await devicePortsFactory.createPorts();
            sendMessageOnAllBots(bots, createBootDoneMessage());
            this.devicePortHandlers.forEach(portHandler => {
                portHandler.addListener(handlePortIncomingLine);
            });
        },
    };
};

export default createSimtronController;
