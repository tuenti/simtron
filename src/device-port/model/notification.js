import decodePdu from '../encoding/pdu';
import { NETWORK_STATUS_LINE_PREFIX } from './parser-token';
import { createNetworkStatus } from './network-status';

const createSmsReceivedNotification = () => ({
    id: '+CMT',
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
    id: '+CREG:',
    notificationParser: notificationLines => {
        const networkStatus = notificationLines.filter(line => {
            return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
        }).reduce((previousLine, currentLine) => {
            return currentLine.match(/\d+$/g)[0];
        }, 0);
        return {
            networkStatus: createNetworkStatus(networkStatus)
        };
    },
});

export default [createSmsReceivedNotification(), createNetworkStatusNotification()];
