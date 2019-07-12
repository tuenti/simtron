import {createNetworkStatus} from './network-status';
import {
    ICC_LINE_PREFIX,
    NETWORK_STATUS_LINE_PREFIX,
    ENCODINGS_LINE_PREFIX,
    SIM_CARD_ICC_LINE_PREFIX,
    OPERATORS_LINE_PREFIX,
    PIN_STATUS_LINE_PREFIX,
} from './parser-token';
import {NON_DIGITS, QUOTED_TEXTS, QUOTES, PARENTHESIS_GROUP} from '../../util/matcher';
import decodeUtf16 from '../encoding/utf16';
import decodePdu from '../encoding/pdu';
import {getSearchOperatorsCommandsTimeout} from '../../config';

const SMS_METADATA_SENDER_INDEX = 1;

export interface Command {
    command: string;
    timeout?: number;
    responseParser?: (responseLines: string[]) => {[key: string]: any};
}

export enum OperatorStatus {
    Unknown = 0,
    Available = 1,
    Current = 2,
    Forbidden = 3,
}

enum AccessTechnology {
    Gsm = 0,
    GsmCompact = 1,
    UTRAN = 2,
}

enum OperatorMode {
    Automatic = 0,
    Manual = 1,
    forceDeregister = 2,
    SetOnlyFormat = 3,
    ManualAautomatic = 4,
    manualNotChangeAccessTechnology = 5,
}

enum OperatorFormat {
    LongName = 0,
    ShortName = 1,
    id = 2,
}

export interface Operator {
    status: OperatorStatus;
    longName: string;
    shortName: string;
    id: string;
    accessTechnology: AccessTechnology;
    format: OperatorFormat;
    applicableId: string;
}

interface SupportedOperatorsMetadata {
    modes: OperatorMode[];
    formats: OperatorFormat[];
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

const removeContainerChars = (value: string): string => value.substring(1, value.length - 1);

const parseSupportedOperatorsMetadata = (metadata: string): SupportedOperatorsMetadata => {
    const metadataParts = metadata.match(PARENTHESIS_GROUP);
    const [modes = [], formats = []] = metadataParts
        ? metadataParts.map(part =>
              removeContainerChars(part)
                  .split(',')
                  .map(parseInt)
          )
        : [];
    return {
        modes,
        formats,
    };
};

const selectPrefferedOperatorFormat = (
    longName: string,
    shortName: string,
    id: string,
    availableFormats: OperatorFormat[]
) => {
    if (availableFormats.includes(OperatorFormat.id) && id !== '') {
        return {format: OperatorFormat.id, applicableId: id};
    } else if (availableFormats.includes(OperatorFormat.ShortName) && shortName !== '') {
        return {format: OperatorFormat.ShortName, applicableId: shortName};
    } else if (id !== '') {
        return {format: OperatorFormat.id, applicableId: id};
    } else if (shortName !== '') {
        return {format: OperatorFormat.ShortName, applicableId: shortName};
    } else {
        return {format: OperatorFormat.LongName, applicableId: longName};
    }
};

const parseOperator = (metadata: SupportedOperatorsMetadata) => (operator: string): Operator => {
    const [status, longName, shortName, id, accessTechnology] = removeContainerChars(operator).split(',');
    const {format, applicableId} = selectPrefferedOperatorFormat(longName, shortName, id, metadata.formats);
    return {
        status: parseInt(status),
        longName: removeContainerChars(longName),
        shortName: removeContainerChars(shortName),
        id: removeContainerChars(id),
        accessTechnology: parseInt(accessTechnology),
        format,
        applicableId,
    };
};

export const createSearchOperatorsCommand = () => ({
    command: 'AT+COPS=?',
    timeout: getSearchOperatorsCommandsTimeout(),
    responseParser: (responseLines: string[]) => {
        const [, operatorsLine] = responseLines;
        if (operatorsLine.startsWith(OPERATORS_LINE_PREFIX)) {
            const [operatorsPart, metadataPart] = operatorsLine
                .substring(OPERATORS_LINE_PREFIX.length)
                .trim()
                .split(',,');
            const metadata = parseSupportedOperatorsMetadata(metadataPart);
            const operators = operatorsPart.match(PARENTHESIS_GROUP);
            return operators ? {operators: operators.map(parseOperator(metadata))} : {operators: []};
        } else {
            return {
                operators: null,
            };
        }
    },
});

export const createForceOperatorCommand = (operator: Operator) => ({
    command: `AT+COPS=${OperatorMode.Manual},${operator.format},${operator.applicableId},${
        operator.accessTechnology
    }`,
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

export const createReadPinStatusCommand = () => ({
    command: 'AT+CPIN?',
    responseParser: (responseLines: string[]) => {
        const [pinStatusLine] = responseLines;
        if (pinStatusLine) {
            if (pinStatusLine.startsWith(PIN_STATUS_LINE_PREFIX)) {
                const pinStatus = pinStatusLine.substring(PIN_STATUS_LINE_PREFIX.length).trim();
                return {
                    pinStatus,
                    requiresPin: pinStatus !== 'READY',
                    requiresPuk: pinStatus === 'SIM PUK' || pinStatus === 'SIM PUK2',
                };
            }
        }
        return {
            requiresPin: false,
            requiresPuk: false,
        };
    },
});
