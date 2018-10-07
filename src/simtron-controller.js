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
import { NEW_SMS_NOTIFICATION_ID, NETWORK_STATUS_NOTIFICATION_ID } from './device-port/model/notification';
import logger from './logger';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {

    const simCatalog = createSimCatalog();

    const handlePortIncomingNotification = (port, notification) => {
        switch (notification.id) {
            case NEW_SMS_NOTIFICATION_ID:
                logger.debug(
                    `Sms received on port: ${port.portId}, from: ${notification.senderMsisdn}, text: ${notification.smsText}`
                );
            break;
            case NETWORK_STATUS_NOTIFICATION_ID:
                logger.debug(
                    `Network status received on port: ${port.portId}, new status: ${notification.networkStatus.name}`
                );
                simCatalog.updateSimNetworkStatus(notification.networkStatus, port.portId);
            break;
        }
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
