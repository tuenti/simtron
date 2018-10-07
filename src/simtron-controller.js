import {createBootingMessage, createBootDoneMessage} from './bot/model/message';
import {
    createSetEchoModeCommand,
    createEnableNotificationsCommand,
    createSetSmsPduModeCommand,
    createEnableSmsUnsolicitedNotificationsCommand,
    createReadIccCommand,
    createGetNetworkStatusCommand,
} from './device-port/model/command';
import createSimCatalog from './sim-card/catalog';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {

    const simCatalog = createSimCatalog();

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
                const setEnableSmsUnsolicitedNotificationsCommandResponse = await portHandler.sendCommand(
                    createEnableSmsUnsolicitedNotificationsCommand()
                );
                const setSmsPduModeCommandResponse = await portHandler.sendCommand(
                    createSetSmsPduModeCommand()
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

    const updateSimStatus = async portHandler => {
        const readIccCommandResponse = await portHandler.sendCommand(createReadIccCommand());
        if (readIccCommandResponse.isSuccessful) {
            const getNetworkStatusCommandResponse = await portHandler.sendCommand(createGetNetworkStatusCommand());
            if (getNetworkStatusCommandResponse.isSuccessful) {
                simCatalog.setSimInUse(
                    readIccCommandResponse.icc,
                    getNetworkStatusCommandResponse.networkStatus,
                    portHandler.portId
                );
            }
        }
        return {
            success: readIccCommandResponse.isSuccessful
        };
    };

    const updateAllInUseSims = async devicePortHandlers => {
        return Promise.all(
            devicePortHandlers.map(updateSimStatus)
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
            await initializeDevices(this.devicePortHandlers);
            await updateAllInUseSims(this.devicePortHandlers);
        },
    };
};

export default createSimtronController;
