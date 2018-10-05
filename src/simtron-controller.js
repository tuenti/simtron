import {createBootingMessage, createBootDoneMessage} from './bots/message/models';
import {
    createSetEchoModeCommand,
    createEnableNotificationsCommand,
    createSetSmsPduModeCommand,
    createEnableSmsUnsolicitedNotificationsCommand,
} from './device-port/command/models';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {
    const handlePortIncomingNotification = (port, notification) => {
        console.log({port: port.portId, notification: notification});
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
                const setEchoModeCommandResponse = await portHandler.sendCommand(
                    createSetEchoModeCommand(true)
                );
                const enableNotificationsCommandResponse = await portHandler.sendCommand(
                    createEnableNotificationsCommand()
                );
                const setSmsPduModeCommandResponse = await portHandler.sendCommand(
                    createSetSmsPduModeCommand()
                );
                const setEnableSmsUnsolicitedNotificationsCommandResponse = await portHandler.sendCommand(
                    createEnableSmsUnsolicitedNotificationsCommand()
                );
                portHandler.addListener(handlePortIncomingNotification);
                return (
                    setEchoModeCommandResponse.isSuccessful &&
                    enableNotificationsCommandResponse.isSuccessful &&
                    setSmsPduModeCommandResponse &&
                    setEnableSmsUnsolicitedNotificationsCommandResponse
                );
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
