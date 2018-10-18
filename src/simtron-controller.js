import {
    createBootingMessage,
    createBootDoneMessage,
    createNewSmsNotificationMessage,
} from './bot/model/message';
import {createDeleteAllSmsCommand, createReadSmsCommand} from './device-port/model/command';
import {
    NEW_SMS_NOTIFICATION_ID,
    NETWORK_STATUS_NOTIFICATION_ID,
    SIM_RETURNED_TO_MAIN_MENU_ID,
    SIM_PIN_READY_ID,
    MODEM_RESTART_ID,
} from './device-port/model/notification';
import logger from './logger';
import {getSimStatusRequestScheduleTime, getSimStatusPollingTime} from './config';
import getMessageSpeech from './bot/speeches';
import createSimStatusHandler from './sim-status-handler';
import Error, {SIM_NOT_PRESENT} from './error';

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
                const sim = store.sim.findSimInUseByPortId(portId);
                if (sim) {
                    const readSmsResponse = await port.sendCommand(
                        createReadSmsCommand(notification.smsIndex, sim.smsMode)
                    );
                    const {senderMsisdn, time, smsText} = readSmsResponse;
                    store.sms.addSms(senderMsisdn, time, smsText, portId);
                    sendMessageOnAllBots(bots, createNewSmsNotificationMessage(sim, smsText));
                    port.sendCommand(createDeleteAllSmsCommand());
                    logger.debug(`Sms received on port: ${portId}, from: ${senderMsisdn}, text: ${smsText}`);
                } else {
                    logger.error(Error(SIM_NOT_PRESENT, `Sms arrived on port: ${portId}, no sim on port`));
                }
                break;
            case NETWORK_STATUS_NOTIFICATION_ID:
                const {networkStatus} = notification;
                simStatusHandler.storeSimNetworkStatus(networkStatus, portId);
                logger.debug(
                    `Network status received on port: ${portId}, new status: ${
                        notification.networkStatus.name
                    }`
                );
                break;
            case SIM_RETURNED_TO_MAIN_MENU_ID:
            case SIM_PIN_READY_ID:
            case MODEM_RESTART_ID:
                simStatusHandler.scheduleDeviceConfiguration(port, getSimStatusRequestScheduleTime());
                logger.debug(`Sim ready notification received on port: ${portId}`);
                break;
        }
    };

    const configurePort = async portHandler => {
        await simStatusHandler.scheduleDeviceConfiguration(portHandler);
        portHandler.addListener(handlePortIncomingNotification);
    };

    const configureAllPorts = async devicePortHandlers => Promise.all(devicePortHandlers.map(configurePort));

    const startSimStatusPolling = (devicePortHandlers, pollingTime) => {
        setInterval(() => {
            Promise.all(devicePortHandlers.map(simStatusHandler.scheduleDeviceConfiguration));
        }, pollingTime);
    };

    return {
        async start() {
            bots = botFactory.createBots();
            await startBots(bots);
            sendMessageOnAllBots(bots, createBootingMessage());
            devicePortHandlers = await devicePortsFactory.createPorts();
            await configureAllPorts(devicePortHandlers);
            await startSimStatusPolling(devicePortHandlers, getSimStatusPollingTime());
            sendMessageOnAllBots(bots, createBootDoneMessage());
        },
    };
};

export default createSimtronController;
