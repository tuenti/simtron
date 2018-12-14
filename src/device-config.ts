import {
    createSetEchoModeCommand,
    createEnableSmsNotificationsCommand,
    createSetSmsPduModeCommand,
    createEnableNetworkStatusNotificationsCommand,
    createReadIccCommand,
    createGetNetworkStatusCommand,
    createGetAllowedEncodingsCommand,
    createSetSmsTextModeCommand,
    createSetUtf16EncodingCommand,
    createReadIccDirectCardAccessCommand,
} from './device-port/model/command';
import {UTF16_ENCODING} from './device-port/model/parser-token';
import logger from './util/logger';
import {SimStore} from './store/sim-catalog';

export enum SmsMode {
    NONE = 0,
    SMS_TEXT_MODE,
    SMS_PDU_MODE,
}

let pendingRequests: {[key: string]: any} = {};

const getSimIcc = async (portHandler: any) => {
    try {
        const readIccFromSimCommandResponse = await portHandler.sendCommand(
            createReadIccDirectCardAccessCommand()
        );
        if (readIccFromSimCommandResponse.isSuccessful) {
            return readIccFromSimCommandResponse.icc;
        }
        const readIccFromModuleCommandResponse = await portHandler.sendCommand(createReadIccCommand());
        if (readIccFromModuleCommandResponse.isSuccessful) {
            return readIccFromModuleCommandResponse.icc;
        }
    } catch (e) {}
    return null;
};

const getSimStatus = async (portHandler: any) => {
    const icc = await getSimIcc(portHandler);
    if (icc) {
        const getNetworkStatusCommandResponse = await portHandler.sendCommand(
            createGetNetworkStatusCommand()
        );
        if (getNetworkStatusCommandResponse.isSuccessful) {
            return {
                icc,
                networkStatus: getNetworkStatusCommandResponse.networkStatus,
            };
        }
    }
    return null;
};

const configureSmsMode = async (portHandler: any): Promise<SmsMode> => {
    const supportedEncodingsResponse = await portHandler.sendCommand(createGetAllowedEncodingsCommand());
    if (supportedEncodingsResponse.isSuccessful) {
        if (supportedEncodingsResponse.encodings.includes(UTF16_ENCODING)) {
            const enableTextModeCommandResponse = await portHandler.sendCommand(
                createSetSmsTextModeCommand()
            );
            const setUtf16EncodingCommandResponse = await portHandler.sendCommand(
                createSetUtf16EncodingCommand()
            );
            const textModeConfigured =
                enableTextModeCommandResponse.isSuccessful && setUtf16EncodingCommandResponse.isSuccessful;
            if (textModeConfigured) {
                return SmsMode.SMS_TEXT_MODE;
            }
        } else {
            const enablePduModeCommandResponse = await portHandler.sendCommand(createSetSmsPduModeCommand());
            if (enablePduModeCommandResponse.isSuccessful) {
                return SmsMode.SMS_PDU_MODE;
            }
        }
    }
    return SmsMode.NONE;
};

const configureDevice = async (portHandler: any, simStore: SimStore) => {
    const enableEchoResponse = await portHandler.sendCommand(createSetEchoModeCommand());
    if (enableEchoResponse.isSuccessful) {
        const enableNetworkStatusNotificationsResponse = await portHandler.sendCommand(
            createEnableNetworkStatusNotificationsCommand()
        );
        const simStatus = await getSimStatus(portHandler);
        if (enableNetworkStatusNotificationsResponse.isSuccessful && simStatus) {
            const smsMode = await configureSmsMode(portHandler);
            if (smsMode !== SmsMode.NONE) {
                const enableSmsNotificationsResponse = await portHandler.sendCommand(
                    createEnableSmsNotificationsCommand()
                );

                const simConfigured =
                    enableSmsNotificationsResponse.isSuccessful &&
                    enableNetworkStatusNotificationsResponse.isSuccessful;

                if (simConfigured) {
                    simStore.setSimInUse(simStatus.icc, simStatus.networkStatus, smsMode, portHandler.portId);
                    return true;
                }
            }
            logger.error(`Device configuration error on port: ${portHandler.portId}`);
        }
    }
    simStore.setSimRemoved(portHandler.portId);
    return false;
};

const scheduleDeviceConfiguration = (portHandler: any, simStore: SimStore, timeOutMs = 0) => {
    if (!pendingRequests[portHandler.portId] || timeOutMs === 0) {
        pendingRequests[portHandler.portId] = setTimeout(() => {
            configureDevice(portHandler, simStore);
            pendingRequests[portHandler.portId] = undefined;
        }, timeOutMs);
    }
};

export default scheduleDeviceConfiguration;
