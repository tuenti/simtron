import {createBootingMessage, createBootDoneMessage} from './bots/message/models';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {
    const handlePortIncomingNotification = (port, notification) => {
        console.log(`${port.portId}: ${notification}`);
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

    const initializeDevices = async devicePortHandlers => {
        return Promise.all(
            devicePortHandlers.map(async portHandler => {
                const echoCommandResponse = await portHandler.sendCommand('ATE1');
                const enableNotificationsCommandResponse = await portHandler.sendCommand('AT+CNMI=1,2,0,0,0');
                portHandler.addListener(handlePortIncomingNotification);
                return echoCommandResponse.isSuccessful && enableNotificationsCommandResponse.isSuccessful;
            })
        );
    };

    return {
        devicePortHandlers: [],
        simsCatalog,
        bots,

        async start() {
            await startBots(bots);
            sendMessageOnAllBots(bots, createBootingMessage());
            this.devicePortHandlers = await devicePortsFactory.createPorts();
            sendMessageOnAllBots(bots, createBootDoneMessage());
            return await initializeDevices(this.devicePortHandlers);
        },
    };
};

export default createSimtronController;
