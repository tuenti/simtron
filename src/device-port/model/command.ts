import {createNetworkStatus} from './network-status';
import {
    ICC_LINE_PREFIX,
    NETWORK_STATUS_LINE_PREFIX,
    ENCODINGS_LINE_PREFIX,
    SIM_CARD_ICC_LINE_PREFIX,
    OPERATORS_LINE_PREFIX,
} from './parser-token';
import {NON_DIGITS, QUOTED_TEXTS, QUOTES} from '../../util/matcher';
import decodeUtf16 from '../encoding/utf16';
import decodePdu from '../encoding/pdu';
import {getSearchOperatorsCommandsTimeout} from '../../config';

const SMS_METADATA_SENDER_INDEX = 1;

export interface Command {
    command: string;
    timeout?: number;
    responseParser?: (responseLines: string[]) => {[key: string]: any};
}

export const createSetEchoModeCommand = () => ({
    command: 'ATE1',
});

export const createReadIccCommand = () => ({
    command: 'AT+CCID',
    responseParser: (responseLines: string[]) => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(ICC_LINE_PREFIX) || line.length > 18;
        });
        if (iccLine) {
            return {
                icc: iccLine.replace(NON_DIGITS, ''),
            };
        }
        return {};
    },
});

export const createReadIccDirectCardAccessCommand = () => ({
    command: 'AT+CICCID',
    responseParser: (responseLines: string[]) => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(SIM_CARD_ICC_LINE_PREFIX) || line.length > 18;
        });
        if (iccLine) {
            return {
                icc: iccLine.replace(NON_DIGITS, ''),
            };
        }
        return {};
    },
});

export const createGetAllowedEncodingsCommand = () => ({
    command: 'AT+CSCS=?',
    responseParser: (responseLines: string[]) => {
        const encodingsLine = responseLines.find(line => {
            return line.startsWith(ENCODINGS_LINE_PREFIX);
        });
        if (encodingsLine) {
            const matches = encodingsLine.match(QUOTED_TEXTS);
            return matches
                ? {
                      encodings: matches.map(item => item.replace(QUOTES, '')),
                  }
                : {};
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
    responseParser: (responseLines: string[]) => {
        const statusLine = responseLines.find(line => {
            return line.startsWith(NETWORK_STATUS_LINE_PREFIX);
        });
        return statusLine ? {networkStatus: createNetworkStatus(statusLine)} : {};
    },
});

export const createEnableSmsNotificationsCommand = () => ({
    command: 'AT+CNMI=2,1,0,0,0',
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

export const createSearchOperatorsCommand = () => ({
    command: 'AT+COPS=?',
    timeout: getSearchOperatorsCommandsTimeout(),
    responseParser: (responseLines: string[]) => {
        const [, operatorsLine] = responseLines;
        console.log(operatorsLine);
        if (operatorsLine.startsWith(OPERATORS_LINE_PREFIX)) {
            console.log(operatorsLine);
            return {
                operators: [operatorsLine],
            };
        } else {
            return {
                operators: [],
            };
        }
    },
});

export const createReadSmsCommand = (smsIndex: number, smsMode: number) => ({
    command: `AT+CMGR=${smsIndex}`,
    responseParser: (responseLines: string[]) => {
        const [, smsMetaDataLine, smsTextLine] = responseLines;
        // fixme use Enum
        if (smsMode === 1) {
            const matches = smsMetaDataLine.match(QUOTED_TEXTS);
            if (matches) {
                const smsMetaData = matches.map(item => item.replace(QUOTES, ''));
                return {
                    senderMsisdn: decodeUtf16(smsMetaData[SMS_METADATA_SENDER_INDEX]),
                    time: +new Date(),
                    smsText: decodeUtf16(smsTextLine),
                };
            } else {
                return {};
            }
        } else {
            const parsedSms = decodePdu(smsTextLine);
            return {
                senderMsisdn: parsedSms.sender,
                time: +new Date(),
                smsText: parsedSms.text,
            };
        }
    },
});
