import {
    createBootingMessage,
    createBootDoneMessage,
    createNewSmsNotificationMessage,
} from './bot/model/message';
import {createDeleteAllSmsCommand} from './device-port/model/command';
import {
    NEW_SMS_NOTIFICATION_ID,
    NETWORK_STATUS_NOTIFICATION_ID,
    SIM_RETURNED_TO_MAIN_MENU_ID,
    SIM_PIN_READY_ID,
} from './device-port/model/notification';
import logger from './logger';
import {getSimStatusRequestScheduleTime, getSimStatusPollingTime} from './config';
import getMessageSpeech from './bot/speeches';
import createSimStatusHandler from './sim-status-handler';

const createSimtronController = (botFactory, devicePortsFactory, store) => {
    let bots = [];
    let devicePortHandlers = [];
    const simStatusHandler = createSimStatusHandler(store.sim);

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
                store.sms.addSms(senderMsisdn, time, smsText, portId);
                const sim = store.sim.findSimInUseByPortId(portId);
                sendMessageOnAllBots(bots, createNewSmsNotificationMessage(sim, smsText));
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
                logger.debug(`Sim ready notification received on port: ${portId}`);
                simStatusHandler.scheduleSyncDevice(port, getSimStatusRequestScheduleTime());
                break;
        }
    };

    const syncPort = async portHandler => {
        await simStatusHandler.scheduleSyncDevice(portHandler);
        portHandler.addListener(handlePortIncomingNotification);
    };

    const syncAllPorts = async devicePortHandlers => Promise.all(devicePortHandlers.map(syncPort));

    const startSimStatusPolling = (devicePortHandlers, pollingTime) => {
        setInterval(() => {
            Promise.all(devicePortHandlers.map(simStatusHandler.scheduleSyncDevice));
        }, pollingTime);
    };

    return {
        async start() {
            bots = botFactory.createBots();
            await startBots(bots);
            sendMessageOnAllBots(bots, createBootingMessage());
            devicePortHandlers = await devicePortsFactory.createPorts();
            await syncAllPorts(devicePortHandlers);
            await startSimStatusPolling(devicePortHandlers, getSimStatusPollingTime());
            sendMessageOnAllBots(bots, createBootDoneMessage());
        },
    };
};

export default createSimtronController;
