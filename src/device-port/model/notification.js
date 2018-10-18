import {NETWORK_STATUS_LINE_PREFIX} from './parser-token';
import {createNetworkStatus} from './network-status';
import {LAST_DIGITS} from '../../util/matcher';

export const NEW_SMS_NOTIFICATION_ID = '+CMTI:';
export const NETWORK_STATUS_NOTIFICATION_ID = '+CREG:';
export const SIM_RETURNED_TO_MAIN_MENU_ID = '+STIN: 25';
export const SIM_PIN_READY_ID = '+CPIN: READY';
export const MODEM_RESTART_ID = 'START';

const createSmsReceivedNotification = () => ({
    id: NEW_SMS_NOTIFICATION_ID,
    lineCount: 1,
    notificationParser: notificationLines => {
        const [smsLocationLine] = notificationLines;
        console.log({l: smsLocationLine, a: smsLocationLine.match(LAST_DIGITS)});
        return {
            smsIndex: parseInt(smsLocationLine.match(LAST_DIGITS)[0]),
        };
    },
});

const createNetworkStatusNotification = () => ({
    id: NETWORK_STATUS_NOTIFICATION_ID,
    lineCount: 1,
    notificationParser: notificationLines => {
        const networkStatusLine = notificationLines
            .filter(line => {
                return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
            })
            .reduce((previousLine, currentLine) => {
                return currentLine;
            }, '0');
        return {
            networkStatus: createNetworkStatus(networkStatusLine),
        };
    },
});

const createModemRestartNotification = () => ({
    id: MODEM_RESTART_ID,
    lineCount: 1,
});

const createSimReadyNotification = () => ({
    id: SIM_RETURNED_TO_MAIN_MENU_ID,
    lineCount: 1,
});

const createSimPinReadyNotification = () => ({
    id: SIM_PIN_READY_ID,
    lineCount: 1,
});

export default [
    createSmsReceivedNotification(),
    createNetworkStatusNotification(),
    createSimReadyNotification(),
    createSimPinReadyNotification(),
    createModemRestartNotification(),
];
