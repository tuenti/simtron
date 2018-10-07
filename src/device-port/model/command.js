import { getNetworkStatusName } from "./network-status";

const ICC_LINE_PREFIX = '+CCID:';
const NETWORK_STATUS_LINE_PREFIX = '+CREG:';

export const createReadVendorCommand = () => ({
    command: 'AT+CGMI',
});

export const createSetEchoModeCommand = enable => ({
    command: `ATE${enable ? '1' : '0'}`,
});

export const createEnableNotificationsCommand = () => ({
    command: 'AT+CNMI=1,2,0,0,0',
});

export const createReadIccCommand = () => ({
    command: 'AT+CCID',
    responseParser: responseLines => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(ICC_LINE_PREFIX) || line.length > 18;
        });
        if (iccLine) {
            return {
                icc: iccLine.replace(/\D/g, ''),
            };
        }
        return {};
    },
});

export const createGetNetworkStatusCommand = () => ({
    command: 'AT+CREG?',
    responseParser: responseLines => {
        const statusLine = responseLines.find(line => {
            return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
        });
        if (statusLine) {
            const networkStatus = statusLine.match(/\d+$/g)[0];
            return {
                networkStatus: {
                    id: networkStatus,
                    name: getNetworkStatusName(networkStatus),
                }
            };
        }
        return {};
    },
});

export const createEnableSmsUnsolicitedNotificationsCommand = () => ({
    command: 'AT+CNMI=2,2',
});

export const createSetSmsPduModeCommand = () => ({
    command: 'AT+CMGF=0',
});

export const createDeleteSmsCommand = smsIndex => ({
    command: `AT+CMGD=${smsIndex}`,
});