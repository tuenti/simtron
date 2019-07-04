import {
    createBootingMessage,
    createBootDoneMessage,
    createErrorMessage,
    USER_MENTION,
} from './bot/model/message';
import getMessageSpeech from './bot/speech';
import scheduleDeviceConfiguration from './device-config';
import handleNotification from './port-notification';
import {getSimStatusPollingTime} from './config';
import logger from './util/logger';
import Error, {PORT_NOT_FOUND} from './util/error';

const createSimtronController = (botFactory, devicePortsFactory, store) => {
    let bots = [];
    let devicePortHandlers = [];

    const answerMessageToBot = bot => (message, receivedMessage) => {
        bot.sendMessage(message, receivedMessage);
    };

    const sendCommandToPort = (command, portId) => {
        const port = devicePortHandlers.find(portHandler => portHandler.portId === portId);
        if (port) {
            return port.sendCommand(command);
        } else {
            logger.error(Error(PORT_NOT_FOUND, `Port[${portId}] not found`));
            return Promise.reject(Error(PORT_NOT_FOUND, `Port[${portId}] not found`));
        }
    };

    const handleBotIncomingMessage = async (bot, incomingMessage) => {
        const messageSpeech = getMessageSpeech(incomingMessage, store);
        if (messageSpeech) {
            if (messageSpeech.isAdmin && !incomingMessage.isFromAdmin) {
                bot.sendMessage(
                    createErrorMessage(`*${USER_MENTION}* admin actions are restricted.`),
                    incomingMessage
                );
            } else {
                messageSpeech.action(incomingMessage, store, answerMessageToBot(bot), sendCommandToPort);
            }
        }
    };

    const startBots = bots =>
        Promise.all(
            bots.map(bot => {
                bot.addListener(handleBotIncomingMessage);
                return bot.start();
            })
        );

    const sendMessageOnAllBots = message =>
        bots.forEach(bot => {
            return bot.sendMessage(message);
        });

    const findPortById = portId => devicePortHandlers.find(portHandler => portHandler.portId === portId);

    const handlePortIncomingNotification = async (portId, notification) => {
        const port = findPortById(portId);
        handleNotification(port, notification, store, sendMessageOnAllBots);
    };

    const configurePort = async portHandler => {
        await scheduleDeviceConfiguration(portHandler, store.sim);
        portHandler.addListener(handlePortIncomingNotification);
    };

    const configureAllPorts = async devicePortHandlers => Promise.all(devicePortHandlers.map(configurePort));

    const startSimStatusPolling = (devicePortHandlers, pollingTime) => {
        setInterval(() => {
            Promise.all(devicePortHandlers.map(port => scheduleDeviceConfiguration(port, store.sim)));
        }, pollingTime);
    };

    return {
        async start() {
            bots = botFactory.createBots();
            await startBots(bots);
            sendMessageOnAllBots(createBootingMessage());
            devicePortHandlers = await devicePortsFactory.createPorts();
            await configureAllPorts(devicePortHandlers);
            await startSimStatusPolling(devicePortHandlers, getSimStatusPollingTime());
            sendMessageOnAllBots(createBootDoneMessage());
        },
    };
};

export default createSimtronController;
