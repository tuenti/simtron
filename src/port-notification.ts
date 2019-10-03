import {NotificationId} from './device-port/model/notification';
import logger from './util/logger';
import Error, {SIM_NOT_PRESENT, NOTIFICATION_HANDLER_NOT_FOUND} from './util/error';
import {createReadSmsCommand, createDeleteAllSmsCommand, Command} from './device-port/model/command';
import {
    createNewSmsNotificationMessage,
    createSimNetworkStatusChangedNotificationMessage,
} from './bot/model/message';
import {Store} from './store';
import {SendMessageCallback} from './bot/speech';
import scanPort from './port-scan';

type NotificationData = {[index: string]: any};
type PortHandler = {
    portId: string;
    portIndex: number;
    sendCommand: (command: Command) => Promise<{[key: string]: any}>;
};

type NotificationHandler = {
    notificationIds: NotificationId[];
    action: (
        port: PortHandler,
        notification: NotificationData,
        store: Store,
        sendMessage: SendMessageCallback
    ) => void;
};

const notificationHandlers: NotificationHandler[] = [
    {
        notificationIds: [NotificationId.NewSms],
        action: async (port, notification, store, sendMessage) => {
            const {portId} = port;
            const {smsIndex} = notification;
            const sim = store.sim.findSimInUseByPortId(portId);
            if (sim) {
                const readSmsResponse = await port.sendCommand(createReadSmsCommand(smsIndex, sim.smsMode));
                const {senderMsisdn, smsText} = readSmsResponse;
                sendMessage(createNewSmsNotificationMessage(sim, smsText));
                port.sendCommand(createDeleteAllSmsCommand());
                logger.debug(`Sms received on port: ${portId}, from: ${senderMsisdn}, text: ${smsText}`);
            } else {
                logger.error(Error(SIM_NOT_PRESENT, `Sms received on port: ${portId}, no sim on port`));
            }
        },
    },
    {
        notificationIds: [NotificationId.NetworkStatus],
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
        notificationIds: [NotificationId.ModemRestart, NotificationId.SimReady],
        action: async (port, _, store, sendMessage) => {
            const {portId} = port;
            logger.debug(`Sim manipulation notification received on port: ${portId}`);
            scanPort(port.portId, port.portIndex, command => port.sendCommand(command), store, sendMessage);
        },
    },
];

const handleNotification = (
    port: PortHandler,
    notification: NotificationData,
    store: Store,
    sendMessage: SendMessageCallback
) => {
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
