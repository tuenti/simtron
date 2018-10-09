import {createBootingMessage, createBootDoneMessage} from './bot/model/message';
import {
    createSetEchoModeCommand,
    createEnableSmsNotificationsCommand,
    createSetSmsPduModeCommand,
    createReadIccCommand,
    createGetNetworkStatusCommand,
    createEnableNetworkStatusNotificationsCommand,
    createDeleteAllSmsCommand,
} from './device-port/model/command';
import createSimCatalog from './store/sim-card/catalog';
import {NEW_SMS_NOTIFICATION_ID, NETWORK_STATUS_NOTIFICATION_ID} from './device-port/model/notification';
import logger from './logger';
import createSmsStore from './store/sms/received-sms';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {
    const simCatalog = createSimCatalog();
    const receivedSms = createSmsStore();

    const handlePortIncomingNotification = async (port, notification) => {
        const {portId} = port;
        switch (notification.id) {
            case NEW_SMS_NOTIFICATION_ID:
                const {senderMsisdn, time, smsText} = notification;
                logger.debug(`Sms received on port: ${portId}, from: ${senderMsisdn}, text: ${smsText}`);
                receivedSms.addSms(senderMsisdn, time, smsText, portId);
                port.sendCommand(createDeleteAllSmsCommand());
                break;
            case NETWORK_STATUS_NOTIFICATION_ID:
                const {networkStatus} = notification;
                logger.debug(
                    `Network status received on port: ${portId}, new status: ${
                        notification.networkStatus.name
                    }`
                );
                simCatalog.updateSimNetworkStatus(networkStatus, portId);
                break;
        }
    };

    const startBots = bots =>
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
        const commandsSucceeded = await Promise.all([
            portHandler.sendCommand(createSetEchoModeCommand(true)),
            portHandler.sendCommand(createSetSmsPduModeCommand()),
            portHandler.sendCommand(createEnableSmsNotificationsCommand()),
            portHandler.sendCommand(createEnableNetworkStatusNotificationsCommand()),
        ]);
        portHandler.addListener(handlePortIncomingNotification);
        return commandsSucceeded.every(command => command.isSuccessful);
    };

    const updateSimStatus = async portHandler => {
        const readIccCommandResponse = await portHandler.sendCommand(createReadIccCommand());
        if (readIccCommandResponse.isSuccessful) {
            const getNetworkStatusCommandResponse = await portHandler.sendCommand(
                createGetNetworkStatusCommand()
            );
            if (getNetworkStatusCommandResponse.isSuccessful) {
                simCatalog.setSimInUse(
                    readIccCommandResponse.icc,
                    getNetworkStatusCommandResponse.networkStatus,
                    portHandler.portId
                );
            }
        }
        return {
            success: readIccCommandResponse.isSuccessful,
        };
    };

    const initializeAllDevices = async devicePortHandlers =>
        Promise.all(devicePortHandlers.map(initializeDevice));

    const updateAllInUseSims = async devicePortHandlers =>
        Promise.all(devicePortHandlers.map(updateSimStatus));

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
            sendMessageOnAllBots(bots, createBootDoneMessage());
        },
    };
};

export default createSimtronController;
