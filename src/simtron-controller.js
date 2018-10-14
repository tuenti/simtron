import {createBootingMessage, createBootDoneMessage, createCatalogAnswerMessage, createSimStatusAnswerMessage} from './bot/model/message';
import {createDeleteAllSmsCommand} from './device-port/model/command';
import {
    NEW_SMS_NOTIFICATION_ID,
    NETWORK_STATUS_NOTIFICATION_ID,
    SIM_RETURNED_TO_MAIN_MENU_ID,
    SIM_PIN_READY_ID
} from './device-port/model/notification';
import logger from './logger';
import {getSimStatusRequestScheduleTime, getSimStatusPollingTime} from './config';
import getMessageSpeech from './bot/speeches';
import createSimStatusHandler from './sim-status-handler';

const createSimtronController = (bots, devicePortsFactory, store, receivedSms) => {
    const simStatusHandler = createSimStatusHandler(store);
    let devicePortHandlers = [];

    const handleBotIncomingMessage = async (bot, incomingMessage) => {
        const messageSpeech = getMessageSpeech(incomingMessage);
        messageSpeech.action(bot, incomingMessage, store);
    };

    const startBots = bots =>
        Promise.all(
            bots.map(bot => {
                bot.addListener(handleBotIncomingMessage);
                return bot.start();
            })
        );

    const sendMessageOnAllBots = (bots, message) =>
        bots.forEach(bot => {
            return bot.sendMessage(message);
        });

    const findPortById = portId => devicePortHandlers.find(portHandler => portHandler.portId === portId);

    const handlePortIncomingNotification = async (portId, notification) => {
        const port = findPortById(portId);
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
            case SIM_PIN_READY_ID:
                logger.debug(
                    `Sim ready notification received on port: ${portId}`
                );
                simStatusHandler.scheduleDeviceInit(port, getSimStatusRequestScheduleTime());
                break;
        }
    };

    const initializePort = async portHandler => {
        await simStatusHandler.scheduleDeviceInit(portHandler);
        portHandler.addListener(handlePortIncomingNotification);
    };

    const initializeAllPorts = async devicePortHandlers =>
        Promise.all(devicePortHandlers.map(initializePort));

    const startSimStatusPolling = (devicePortHandlers, pollingTime) => {
        setInterval(() => {
            Promise.all(devicePortHandlers.map(simStatusHandler.scheduleDeviceInit));
        }, pollingTime);
    }

    return {
        async start() {
            await startBots(bots);
            sendMessageOnAllBots(bots, createBootingMessage());
            devicePortHandlers = await devicePortsFactory.createPorts();
            await initializeAllPorts(devicePortHandlers);
            await startSimStatusPolling(devicePortHandlers, getSimStatusPollingTime());
            sendMessageOnAllBots(bots, createBootDoneMessage());
        },
    };
};

export default createSimtronController;
