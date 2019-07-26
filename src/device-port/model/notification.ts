import {createNetworkStatus} from './network-status';
import {LAST_DIGITS} from '../../util/matcher';

export enum NotificationId {
    NewSms = '+CMTI:',
    NetworkStatus = '+CREG:',
    SimReady = 'PB DONE',
    ModemRestart = 'START',
}

const createSmsReceivedNotification = () => ({
    id: NotificationId.NewSms,
    notificationParser: (smsLocationLine: string) => {
        const smsIndex = smsLocationLine.match(LAST_DIGITS);
        return {
            smsIndex: parseInt(smsIndex ? smsIndex[0] : '0'),
        };
    },
});

const createNetworkStatusNotification = () => ({
    id: NotificationId.NetworkStatus,
    notificationParser: (networkStatusLine: string) => {
        return {
            networkStatus: createNetworkStatus(networkStatusLine),
        };
    },
});

const createModemRestartNotification = () => ({
    id: NotificationId.ModemRestart,
});

const createSimReadyNotification = () => ({
    id: NotificationId.SimReady,
});

export default [
    createSmsReceivedNotification(),
    createNetworkStatusNotification(),
    createSimReadyNotification(),
    createModemRestartNotification(),
];
