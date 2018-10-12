import {createBootingMessage, createBootDoneMessage} from './bot/model/message';
import {
    createSetEchoModeCommand,
    createEnableSmsNotificationsCommand,
    createSetSmsPduModeCommand,
    createEnableNetworkStatusNotificationsCommand,
    createDeleteAllSmsCommand,
} from './device-port/model/command';
import createSimCatalog from './store/sim-card/catalog';
import createSimStatusHandler from './sim-status-handler';
import {NEW_SMS_NOTIFICATION_ID, NETWORK_STATUS_NOTIFICATION_ID, SIM_RETURNED_TO_MAIN_MENU_ID} from './device-port/model/notification';
import logger from './logger';
import createSmsStore from './store/sms/received-sms';
import {getStatusRequestScheduleTime} from './config';

const createSimtronController = (devicePortsFactory, simsCatalog, bots) => {
    const simCatalog = createSimCatalog();
    const simStatusHandler = createSimStatusHandler(simCatalog);
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
                simStatusHandler.storeSimNetworkStatus(networkStatus, portId);
                break;
            case SIM_RETURNED_TO_MAIN_MENU_ID:
                logger.debug(
                    `Sim returned to main menu notification received on port: ${portId}`
                );
                simStatusHandler.scheduleStatusRequest(port, getStatusRequestScheduleTime());
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

    const initializeAllDevices = async devicePortHandlers =>
        Promise.all(devicePortHandlers.map(initializeDevice));

    const updateAllInUseSims = async devicePortHandlers =>
        Promise.all(devicePortHandlers.map(simStatusHandler.scheduleStatusRequest));

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
