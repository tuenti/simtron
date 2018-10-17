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

export const TEXT_MODE = 'text';
export const PDU_MODE = 'pdu';

const createSimStatusHandler = simStore => {
    let pendingRequests = {};

    const configureDevice = async portHandler => {
        const commandsSucceeded = await Promise.all([
            portHandler.sendCommand(createSetEchoModeCommand(true)),
            portHandler.sendCommand(createEnableSmsNotificationsCommand()),
            portHandler.sendCommand(createEnableNetworkStatusNotificationsCommand()),
        ]);
        return commandsSucceeded.every(command => command.isSuccessful);
    };

    const getSimIcc = async portHandler => {
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
        return null;
    };

    const getSimStatus = async portHandler => {
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

    const initilizeSmsMode = async portHandler => {
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
                    enableTextModeCommandResponse.isSuccessful &&
                    setUtf16EncodingCommandResponse.isSuccessful;
                if (textModeConfigured) {
                    return TEXT_MODE;
                }
            } else {
                const enablePduModeCommandResponse = await portHandler.sendCommand(
                    createSetSmsPduModeCommand()
                );
                if (enablePduModeCommandResponse.isSuccessful) {
                    return PDU_MODE;
                }
            }
        }
        return null;
    };

    const syncDevice = portHandler => async () => {
        const deviceConfigured = await configureDevice(portHandler);
        if (deviceConfigured) {
            const smsMode = await initilizeSmsMode(portHandler);
            if (smsMode) {
                const simStatus = await getSimStatus(portHandler);
                if (simStatus) {
                    simStore.setSimInUse(simStatus.icc, simStatus.networkStatus, smsMode, portHandler.portId);
                } else {
                    simStore.setSimRemoved(portHandler.portId);
                }
            }
        }
        pendingRequests[portHandler.portId] = undefined;
    };

    const scheduleSyncDevice = (portHandler, timeOutMs = 0) => {
        if (!pendingRequests[portHandler.portId] || timeOutMs === 0) {
            pendingRequests[portHandler.portId] = setTimeout(syncDevice(portHandler), timeOutMs);
        }
    };

    const storeSimNetworkStatus = (networkStatus, portId) =>
        simStore.updateSimNetworkStatus(networkStatus, portId);

    return {
        scheduleSyncDevice,
        storeSimNetworkStatus,
    };
};

export default createSimStatusHandler;
