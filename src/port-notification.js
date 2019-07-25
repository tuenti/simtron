import {
    NEW_SMS_NOTIFICATION_ID,
    NETWORK_STATUS_NOTIFICATION_ID,
    SIM_PIN_READY_ID,
    MODEM_RESTART_ID,
    SIM_READY_ID,
} from './device-port/model/notification';
import logger from './util/logger';
import Error, {SIM_NOT_PRESENT, NOTIFICATION_HANDLER_NOT_FOUND} from './util/error';
import {createReadSmsCommand, createDeleteAllSmsCommand} from './device-port/model/command';
import {
    createNewSmsNotificationMessage,
    createPortActivityNotificationMessage,
    createSimInsertedNotificationMessage,
    createSimRemovedNotificationMessage,
    createSimNetworkStatusChangedNotificationMessage,
} from './bot/model/message';
import scheduleDeviceConfiguration from './device-config';
import {getSimStatusRequestScheduleTime} from './config';

const SIM_READY_TIMEOUT_MS = 5000;

const handleSimManipulation = (simDiff, sendMessage) => {
    if (simDiff.oldSim === null && simDiff.newSim !== null) {
        sendMessage(createSimInsertedNotificationMessage(simDiff.newSim));
    } else if (simDiff.oldSim !== null && simDiff.newSim === null) {
        sendMessage(createSimRemovedNotificationMessage(simDiff.oldSim));
    } else if (
        simDiff.oldSim !== null &&
        simDiff.newSim !== null &&
        simDiff.oldSim.icc !== simDiff.newSim.icc
    ) {
        sendMessage(createSimRemovedNotificationMessage(simDiff.oldSim));
        delayed(() => {
            sendMessage(createSimInsertedNotificationMessage(simDiff.newSim));
        }, getBotMessageSequenceEnsuringTime());
    }
};

const notificationHandlers = [
    {
        notificationIds: [NEW_SMS_NOTIFICATION_ID],
        action: async (port, notification, store, sendMessage) => {
            const {portId} = port;
            const {smsIndex} = notification;
            const sim = store.sim.findSimInUseByPortId(portId);
            if (sim) {
                const readSmsResponse = await port.sendCommand(createReadSmsCommand(smsIndex, sim.smsMode));
                const {senderMsisdn, time, smsText} = readSmsResponse;
                store.sms.addSms(senderMsisdn, time, smsText, portId);
                sendMessage(createNewSmsNotificationMessage(sim, smsText));
                port.sendCommand(createDeleteAllSmsCommand());
                logger.debug(`Sms received on port: ${portId}, from: ${senderMsisdn}, text: ${smsText}`);
            } else {
                logger.error(Error(SIM_NOT_PRESENT, `Sms arrived on port: ${portId}, no sim on port`));
            }
        },
    },
    {
        notificationIds: [NETWORK_STATUS_NOTIFICATION_ID],
        action: (port, notification, store, sendMessage) => {
            const {portId, portIndex} = port;
            const {networkStatus} = notification;
            store.sim.updateSimNetworkStatus(networkStatus, portId, portIndex);
            const sim = store.sim.findSimInUseByPortId(portId);
            if (sim) {
                sendMessage(createSimNetworkStatusChangedNotificationMessage(sim));
            }
            logger.debug(
                `Network status received on port: ${portId}, new status: ${notification.networkStatus.name}`
            );
        },
    },
    {
        notificationIds: [MODEM_RESTART_ID, SIM_READY_ID],
        action: async (port, notification, store, sendMessage) => {
            const {portId} = port;
            logger.debug(`Sim manipulation notification received on port: ${portId}`);
            setTimeout(async () => {
                handleSimManipulation(await scheduleDeviceConfiguration(port, store.sim), sendMessage);
                handleSimManipulation(
                    await scheduleDeviceConfiguration(port, store.sim, getSimStatusRequestScheduleTime()),
                    sendMessage
                );
            }, SIM_READY_TIMEOUT_MS);
        },
    },
];

const handleNotification = (port, notification, store, sendMessage) => {
    const {portId} = port;
    const notificationHandler = notificationHandlers.find(handler =>
        handler.notificationIds.includes(notification.id)
    );
    if (notificationHandler) {
        notificationHandler.action(port, notification, store, sendMessage);
    } else {
        logger.error(
            Error(
                NOTIFICATION_HANDLER_NOT_FOUND,
                `Notification handler not found for id: ${notification.id}, port: ${portId}`
            )
        );
    }
};

export default handleNotification;
