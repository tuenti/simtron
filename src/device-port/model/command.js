import {createNetworkStatus} from "./network-status";
import {ICC_LINE_PREFIX, NETWORK_STATUS_LINE_PREFIX, ENCODINGS_LINE_PREFIX} from "./parser-token";

export const createSetEchoModeCommand = enable => ({
    command: `ATE${enable ? '1' : '0'}`,
});

export const createEnableSmsNotificationsCommand = () => ({
    command: 'AT+CNMI=2,2,0,0,0',
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

export const createGetAllowedEncodingsCommand = () => ({
    command: 'AT+CSCS=?',
    responseParser: responseLines => {
        const encodingsLine = responseLines.find(line => {
            return line.startsWith(ENCODINGS_LINE_PREFIX);
        });
        if (encodingsLine) {
            return {
                encodings: encodingsLine.match(/\"([^"]+)\"/g)
                    .map(item => item.replace(/\"/g, '')),
            };
        }
        return {};
    },
});

export const createSetUtf16EncodingCommand = () => ({
    command: 'AT+CSCS="UCS2"',
});

export const createEnableNetworkStatusNotificationsCommand = () => ({
    command: 'AT+CREG=1',
});

export const createGetNetworkStatusCommand = () => ({
    command: 'AT+CREG?',
    responseParser: responseLines => {
        const statusLine = responseLines.find(line => {
            return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
        });
        return statusLine ? {networkStatus: createNetworkStatus(statusLine)} : {};
    },
});

export const createSetSmsPduModeCommand = () => ({
    command: 'AT+CMGF=0',
});

export const createSetSmsTextModeCommand = () => ({
    command: 'AT+CMGF=1',
});

export const createDeleteAllSmsCommand = () => ({
    command: 'AT+CMGD=1,4',
});
