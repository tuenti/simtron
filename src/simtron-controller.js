import {createBootingMessage, createBootDoneMessage} from './bot/model/message';
import {
    createSetEchoModeCommand,
    createEnableSmsNotificationsCommand,
    createSetSmsPduModeCommand,
    createReadIccCommand,
    createGetNetworkStatusCommand,
    createEnableNetworkStatusNotificationsCommand,
    createDisableSmsNotificationsCommand,
    createDisableNetworkStatusNotificationsCommand,
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

    const initializeDevice = async portHandler => {
        const setEchoModeCommandResponse = await portHandler.sendCommand(
            createSetEchoModeCommand(true)
        );
        const disableSmsNotificationsCommandResponse = await portHandler.sendCommand(
            createDisableSmsNotificationsCommand()
        );
        const setSmsPduModeCommandResponse = await portHandler.sendCommand(
            createSetSmsPduModeCommand()
        );
        const disableNetworkStatusNotificationsCommandResponse = await portHandler.sendCommand(
            createDisableNetworkStatusNotificationsCommand()
        )
        portHandler.addListener(handlePortIncomingNotification);
        return (
            setEchoModeCommandResponse.isSuccessful &&
            disableSmsNotificationsCommandResponse.isSuccessful &&
            setSmsPduModeCommandResponse &&
            disableNetworkStatusNotificationsCommandResponse
        );
    };

    const enableNotifications = async portHandler => {
        const enableSmsNotificationsCommandResponse = await portHandler.sendCommand(
            createEnableSmsNotificationsCommand()
        );
        const enableNetworkStatusNotificationsCommandResponse = await portHandler.sendCommand(
            createEnableNetworkStatusNotificationsCommand()
        )
        return (
            enableSmsNotificationsCommandResponse.isSuccessful &&
            enableNetworkStatusNotificationsCommandResponse
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

    const initializeAllDevices = async devicePortHandlers => {
        return Promise.all(
            devicePortHandlers.map(initializeDevice)
        );
    };

    const enableNotificationsOnAllDevices = async devicePortHandlers => {
        return Promise.all(
            devicePortHandlers.map(enableNotifications)
        );
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
            await initializeAllDevices(this.devicePortHandlers);
            await updateAllInUseSims(this.devicePortHandlers);
            await enableNotificationsOnAllDevices(this.devicePortHandlers);
            sendMessageOnAllBots(bots, createBootDoneMessage());

            return true;
        },
    };
};

export default createSimtronController;
