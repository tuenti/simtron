import {createNetworkStatus} from './network-status';
import {LAST_DIGITS} from '../../util/matcher';

export const NEW_SMS_NOTIFICATION_ID = '+CMTI:';
export const NETWORK_STATUS_NOTIFICATION_ID = '+CREG:';
export const SIM_RETURNED_TO_MAIN_MENU_ID = '+STIN: 25';
export const SIM_PIN_READY_ID = '+CPIN: READY';
export const MODEM_RESTART_ID = 'START';

const createSmsReceivedNotification = () => ({
    id: NEW_SMS_NOTIFICATION_ID,
    notificationParser: smsLocationLine => {
        return {
            smsIndex: parseInt(smsLocationLine.match(LAST_DIGITS)[0]),
        };
    },
});

const createNetworkStatusNotification = () => ({
    id: NETWORK_STATUS_NOTIFICATION_ID,
    notificationParser: networkStatusLine => {
        return {
            networkStatus: createNetworkStatus(networkStatusLine),
        };
    },
});

const createModemRestartNotification = () => ({
    id: MODEM_RESTART_ID,
});

const createSimReadyNotification = () => ({
    id: SIM_RETURNED_TO_MAIN_MENU_ID,
});

const createSimPinReadyNotification = () => ({
    id: SIM_PIN_READY_ID,
});

export default [
    createSmsReceivedNotification(),
    createNetworkStatusNotification(),
    createSimReadyNotification(),
    createSimPinReadyNotification(),
    createModemRestartNotification(),
];
