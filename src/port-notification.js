import {
    NEW_SMS_NOTIFICATION_ID,
    NETWORK_STATUS_NOTIFICATION_ID,
    SIM_RETURNED_TO_MAIN_MENU_ID,
    SIM_PIN_READY_ID,
    MODEM_RESTART_ID,
} from './device-port/model/notification';
import logger from './util/logger';
import Error, {SIM_NOT_PRESENT, NOTIFICATION_HANDLER_NOT_FOUND} from './util/error';
import {createReadSmsCommand, createDeleteAllSmsCommand} from './device-port/model/command';
import {createNewSmsNotificationMessage} from './bot/model/message';
import scheduleDeviceConfiguration from './device-config';
import {getSimStatusRequestScheduleTime} from './config';

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
        action: (port, notification, store) => {
            const {portId} = port;
            const {networkStatus} = notification;
            store.sim.updateSimNetworkStatus(networkStatus, portId);
            logger.debug(
                `Network status received on port: ${portId}, new status: ${notification.networkStatus.name}`
            );
        },
    },
    {
        notificationIds: [SIM_RETURNED_TO_MAIN_MENU_ID, SIM_PIN_READY_ID, MODEM_RESTART_ID],
        action: (port, notification, store) => {
            const {portId} = port;
            scheduleDeviceConfiguration(port, store.sim, getSimStatusRequestScheduleTime());
            logger.debug(`Sim ready notification received on port: ${portId}`);
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
