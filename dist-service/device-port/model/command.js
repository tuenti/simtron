'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.createReadSmsCommand = exports.createForceOperatorCommand = exports.createSearchOperatorsCommand = exports.createDeleteAllSmsCommand = exports.createSetSmsTextModeCommand = exports.createSetSmsPduModeCommand = exports.createEnableSmsNotificationsCommand = exports.createGetNetworkStatusCommand = exports.createEnableNetworkStatusNotificationsCommand = exports.createSetUtf16EncodingCommand = exports.createGetAllowedEncodingsCommand = exports.createReadIccDirectCardAccessCommand = exports.createReadIccCommand = exports.createSetEchoModeCommand = exports.OperatorStatus = void 0;

var _networkStatus = require('./network-status');

var _parserToken = require('./parser-token');

var _matcher = require('../../util/matcher');

var _utf = _interopRequireDefault(require('../encoding/utf16'));

var _pdu = _interopRequireDefault(require('../encoding/pdu'));

var _config = require('../../config');

function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {default: obj};
}

const SMS_METADATA_SENDER_INDEX = 1;
let OperatorStatus;
exports.OperatorStatus = OperatorStatus;

(function(OperatorStatus) {
    OperatorStatus[(OperatorStatus['Unknown'] = 0)] = 'Unknown';
    OperatorStatus[(OperatorStatus['Available'] = 1)] = 'Available';
    OperatorStatus[(OperatorStatus['Current'] = 2)] = 'Current';
    OperatorStatus[(OperatorStatus['Forbidden'] = 3)] = 'Forbidden';
})(OperatorStatus || (exports.OperatorStatus = OperatorStatus = {}));

var AccessTechnology;

(function(AccessTechnology) {
    AccessTechnology[(AccessTechnology['Gsm'] = 0)] = 'Gsm';
    AccessTechnology[(AccessTechnology['GsmCompact'] = 1)] = 'GsmCompact';
    AccessTechnology[(AccessTechnology['UTRAN'] = 2)] = 'UTRAN';
})(AccessTechnology || (AccessTechnology = {}));

var OperatorMode;

(function(OperatorMode) {
    OperatorMode[(OperatorMode['Automatic'] = 0)] = 'Automatic';
    OperatorMode[(OperatorMode['Manual'] = 1)] = 'Manual';
    OperatorMode[(OperatorMode['forceDeregister'] = 2)] = 'forceDeregister';
    OperatorMode[(OperatorMode['SetOnlyFormat'] = 3)] = 'SetOnlyFormat';
    OperatorMode[(OperatorMode['ManualAautomatic'] = 4)] = 'ManualAautomatic';
    OperatorMode[(OperatorMode['manualNotChangeAccessTechnology'] = 5)] = 'manualNotChangeAccessTechnology';
})(OperatorMode || (OperatorMode = {}));

var OperatorFormat;

(function(OperatorFormat) {
    OperatorFormat[(OperatorFormat['LongName'] = 0)] = 'LongName';
    OperatorFormat[(OperatorFormat['ShortName'] = 1)] = 'ShortName';
    OperatorFormat[(OperatorFormat['id'] = 2)] = 'id';
})(OperatorFormat || (OperatorFormat = {}));

const createSetEchoModeCommand = () => ({
    command: 'ATE1',
});

exports.createSetEchoModeCommand = createSetEchoModeCommand;

const createReadIccCommand = () => ({
    command: 'AT+CCID',
    responseParser: responseLines => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(_parserToken.ICC_LINE_PREFIX) || line.length > 18;
        });

        if (iccLine) {
            return {
                icc: iccLine.replace(_matcher.NON_DIGITS, ''),
            };
        }

        return {};
    },
});

exports.createReadIccCommand = createReadIccCommand;

const createReadIccDirectCardAccessCommand = () => ({
    command: 'AT+CICCID',
    responseParser: responseLines => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(_parserToken.SIM_CARD_ICC_LINE_PREFIX) || line.length > 18;
        });

        if (iccLine) {
            return {
                icc: iccLine.replace(_matcher.NON_DIGITS, ''),
            };
        }

        return {};
    },
});

exports.createReadIccDirectCardAccessCommand = createReadIccDirectCardAccessCommand;

const createGetAllowedEncodingsCommand = () => ({
    command: 'AT+CSCS=?',
    responseParser: responseLines => {
        const encodingsLine = responseLines.find(line => {
            return line.startsWith(_parserToken.ENCODINGS_LINE_PREFIX);
        });

        if (encodingsLine) {
            const matches = encodingsLine.match(_matcher.QUOTED_TEXTS);
            return matches
                ? {
                      encodings: matches.map(item => item.replace(_matcher.QUOTES, '')),
                  }
                : {};
        }

        return {};
    },
});

exports.createGetAllowedEncodingsCommand = createGetAllowedEncodingsCommand;

const createSetUtf16EncodingCommand = () => ({
    command: 'AT+CSCS="UCS2"',
});

exports.createSetUtf16EncodingCommand = createSetUtf16EncodingCommand;

const createEnableNetworkStatusNotificationsCommand = () => ({
    command: 'AT+CREG=1',
});

exports.createEnableNetworkStatusNotificationsCommand = createEnableNetworkStatusNotificationsCommand;

const createGetNetworkStatusCommand = () => ({
    command: 'AT+CREG?',
    responseParser: responseLines => {
        const statusLine = responseLines.find(line => {
            return line.startsWith(_parserToken.NETWORK_STATUS_LINE_PREFIX);
        });
        return statusLine
            ? {
                  networkStatus: (0, _networkStatus.createNetworkStatus)(statusLine),
              }
            : {};
    },
});

exports.createGetNetworkStatusCommand = createGetNetworkStatusCommand;

const createEnableSmsNotificationsCommand = () => ({
    command: 'AT+CNMI=2,1,0,0,0',
});

exports.createEnableSmsNotificationsCommand = createEnableSmsNotificationsCommand;

const createSetSmsPduModeCommand = () => ({
    command: 'AT+CMGF=0',
});

exports.createSetSmsPduModeCommand = createSetSmsPduModeCommand;

const createSetSmsTextModeCommand = () => ({
    command: 'AT+CMGF=1',
});

exports.createSetSmsTextModeCommand = createSetSmsTextModeCommand;

const createDeleteAllSmsCommand = () => ({
    command: 'AT+CMGD=1,4',
});

exports.createDeleteAllSmsCommand = createDeleteAllSmsCommand;

const removeContainerChars = value => value.substring(1, value.length - 1);

const parseSupportedOperatorsMetadata = metadata => {
    const metadataParts = metadata.match(_matcher.PARENTHESIS_GROUP);
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

const selectPrefferedOperatorFormat = (longName, shortName, id, availableFormats) => {
    if (availableFormats.includes(OperatorFormat.id) && id !== '') {
        return {
            format: OperatorFormat.id,
            applicableId: id,
        };
    } else if (availableFormats.includes(OperatorFormat.ShortName) && shortName !== '') {
        return {
            format: OperatorFormat.ShortName,
            applicableId: shortName,
        };
    } else if (id !== '') {
        return {
            format: OperatorFormat.id,
            applicableId: id,
        };
    } else if (shortName !== '') {
        return {
            format: OperatorFormat.ShortName,
            applicableId: shortName,
        };
    } else {
        return {
            format: OperatorFormat.LongName,
            applicableId: longName,
        };
    }
};

const parseOperator = metadata => operator => {
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

const createSearchOperatorsCommand = () => ({
    command: 'AT+COPS=?',
    timeout: (0, _config.getSearchOperatorsCommandsTimeout)(),
    responseParser: responseLines => {
        const [, operatorsLine] = responseLines;

        if (operatorsLine.startsWith(_parserToken.OPERATORS_LINE_PREFIX)) {
            const [operatorsPart, metadataPart] = operatorsLine
                .substring(_parserToken.OPERATORS_LINE_PREFIX.length)
                .trim()
                .split(',,');
            const metadata = parseSupportedOperatorsMetadata(metadataPart);
            const operators = operatorsPart.match(_matcher.PARENTHESIS_GROUP);
            return operators
                ? {
                      operators: operators.map(parseOperator(metadata)),
                  }
                : {
                      operators: [],
                  };
        } else {
            return {
                operators: null,
            };
        }
    },
});

exports.createSearchOperatorsCommand = createSearchOperatorsCommand;

const createForceOperatorCommand = operator => ({
    command: `AT+COPS=${OperatorMode.Manual},${operator.format},${operator.applicableId},${
        operator.accessTechnology
    }`,
});

exports.createForceOperatorCommand = createForceOperatorCommand;

const createReadSmsCommand = (smsIndex, smsMode) => ({
    command: `AT+CMGR=${smsIndex}`,
    responseParser: responseLines => {
        const [, smsMetaDataLine, smsTextLine] = responseLines; // fixme use Enum

        if (smsMode === 1) {
            const matches = smsMetaDataLine.match(_matcher.QUOTED_TEXTS);

            if (matches) {
                const smsMetaData = matches.map(item => item.replace(_matcher.QUOTES, ''));
                return {
                    senderMsisdn: (0, _utf.default)(smsMetaData[SMS_METADATA_SENDER_INDEX]),
                    time: +new Date(),
                    smsText: (0, _utf.default)(smsTextLine),
                };
            } else {
                return {};
            }
        } else {
            const parsedSms = (0, _pdu.default)(smsTextLine);
            return {
                senderMsisdn: parsedSms.sender,
                time: +new Date(),
                smsText: parsedSms.text,
            };
        }
    },
});

exports.createReadSmsCommand = createReadSmsCommand;
