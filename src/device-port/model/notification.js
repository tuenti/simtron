import decodePdu from '../encoding/pdu';
import {NETWORK_STATUS_LINE_PREFIX} from './parser-token';
import {createNetworkStatus} from './network-status';

export const NEW_SMS_NOTIFICATION_ID = '+CMT';
export const NETWORK_STATUS_NOTIFICATION_ID = '+CREG:';
export const SIM_RETURNED_TO_MAIN_MENU_ID = '+STIN: 25';

const createSmsReceivedNotification = () => ({
    id: NEW_SMS_NOTIFICATION_ID,
    lineCount: 2,
    notificationParser: notificationLines => {
        const [, ...smsLines] = notificationLines;
        const parsedSms = decodePdu(smsLines[0]);

        return {
            senderMsisdn: parsedSms.sender,
            time: parsedSms.time,
            smsText: parsedSms.text,
        };
    },
});

const createNetworkStatusNotification = () => ({
    id: NETWORK_STATUS_NOTIFICATION_ID,
    lineCount: 1,
    notificationParser: notificationLines => {
        const networkStatus = notificationLines
            .filter(line => {
                return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
            })
            .reduce((previousLine, currentLine) => {
                return currentLine.match(/\d+$/g)[0];
            }, 0);
        return {
            networkStatus: createNetworkStatus(networkStatus),
        };
    },
});

const createSimReadyNotification = () => ({
    id: SIM_RETURNED_TO_MAIN_MENU_ID,
    lineCount: 1,
});

export default [createSmsReceivedNotification(), createNetworkStatusNotification(), createSimReadyNotification()];
