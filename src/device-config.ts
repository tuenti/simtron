import { SendCommandCallback } from './bot/types';
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
    createReadPasswordStatusCommand,
    isSuccessfulSimPasswordStatusCommandResponse,
    createGetImeiCommand,
    isSuccessFulImeiResponse,
    createEnterPinCommand,
} from './device-port/model/command';
import {UTF16_ENCODING} from './device-port/model/parser-token';
import {SimStore, SimInUse, PortInUse, SmsMode} from './store/sim-catalog';

export interface SimDiff {
    oldSim: SimInUse | PortInUse | null;
    newSim: SimInUse | PortInUse | null;
}

let pendingRequests: {[key: string]: any} = {};

const getSimIcc = async (portId: string, sendCommand: SendCommandCallback) => {
    try {
        const readIccFromSimCommandResponse = await sendCommand(
            createReadIccDirectCardAccessCommand(),
            portId
        );
        if (readIccFromSimCommandResponse.isSuccessful) {
            return readIccFromSimCommandResponse.icc;
        }
        const readIccFromModuleCommandResponse = await sendCommand(createReadIccCommand(), portId);
        if (readIccFromModuleCommandResponse.isSuccessful) {
            return readIccFromModuleCommandResponse.icc;
        }
    } catch (e) {}
    return null;
};

const getSimStatus = async (portId: string, sendCommand: SendCommandCallback) => {
    const icc = await getSimIcc(portId, sendCommand);
    if (icc) {
        const getNetworkStatusCommandResponse = await sendCommand(createGetNetworkStatusCommand(), portId);
        if (getNetworkStatusCommandResponse.isSuccessful) {
            return {
                icc,
                networkStatus: getNetworkStatusCommandResponse.networkStatus,
            };
        }
    }
    return null;
};

const configureSmsMode = async (portId: string, sendCommand: SendCommandCallback): Promise<SmsMode> => {
    const supportedEncodingsResponse = await sendCommand(createGetAllowedEncodingsCommand(), portId);
    if (supportedEncodingsResponse.isSuccessful) {
        if (supportedEncodingsResponse.encodings.includes(UTF16_ENCODING)) {
            const enableTextModeCommandResponse = await sendCommand(createSetSmsTextModeCommand(), portId);
            const setUtf16EncodingCommandResponse = await sendCommand(
                createSetUtf16EncodingCommand(),
                portId
            );
            const textModeConfigured =
                enableTextModeCommandResponse.isSuccessful && setUtf16EncodingCommandResponse.isSuccessful;
            if (textModeConfigured) {
                return SmsMode.SMS_TEXT_MODE;
            }
        } else {
            const enablePduModeCommandResponse = await sendCommand(createSetSmsPduModeCommand(), portId);
            if (enablePduModeCommandResponse.isSuccessful) {
                return SmsMode.SMS_PDU_MODE;
            }
        }
    }
    return SmsMode.NONE;
};

const configureDevice = async (
    portId: string,
    portIndex: number,
    simStore: SimStore,
    sendCommand: SendCommandCallback
): Promise<boolean> => {
    const enableEchoResponse = await sendCommand(createSetEchoModeCommand(), portId);
    if (enableEchoResponse.isSuccessful) {
        const readImeiResponse = await sendCommand(createGetImeiCommand(), portId);
        const imei = isSuccessFulImeiResponse(readImeiResponse) ? readImeiResponse.imei : '';
        const enableNetworkStatusNotificationsResponse = await sendCommand(
            createEnableNetworkStatusNotificationsCommand(),
            portId
        );
        if (enableNetworkStatusNotificationsResponse.isSuccessful) {
            const simPasswordStatus = await sendCommand(createReadPasswordStatusCommand(), portId);
            if (
                isSuccessfulSimPasswordStatusCommandResponse(simPasswordStatus) &&
                (simPasswordStatus.requiresPin || simPasswordStatus.requiresPuk)
            ) {
                const simPin = simStore.getPinForImei(imei);
                if (simPin) {
                    await sendCommand(createEnterPinCommand(simPin.pin), portId);
                }
                simStore.setSimBlockedInPort(portId, portIndex, imei);
                return true;
            } else {
                const simStatus = await getSimStatus(portId, sendCommand);
                if (simStatus) {
                    const smsMode = await configureSmsMode(portId, sendCommand);
                    if (smsMode !== SmsMode.NONE) {
                        const enableSmsNotificationsResponse = await sendCommand(
                            createEnableSmsNotificationsCommand(),
                            portId
                        );

                        const simConfigured =
                            enableSmsNotificationsResponse.isSuccessful &&
                            enableNetworkStatusNotificationsResponse.isSuccessful;

                        if (simConfigured) {
                            simStore.setSimInUse(
                                simStatus.icc,
                                simStatus.networkStatus,
                                smsMode,
                                portId,
                                portIndex,
                                imei
                            );
                            return true;
                        }
                    }
                }
            }
        }
    }
    simStore.setSimRemoved(portId);
    return false;
};

const scheduleDeviceConfiguration = async (
    portId: string,
    portIndex: number,
    simStore: SimStore,
    sendCommand: SendCommandCallback,
    timeOutMs: number = 0
): Promise<SimDiff> =>
    new Promise(resolve => {
        if (!pendingRequests[portId] || timeOutMs === 0) {
            pendingRequests[portId] = setTimeout(async () => {
                const oldSim =
                    simStore.findSimInUseByPortId(portId) || simStore.getBlockedSimByPortId(portId);
                await configureDevice(portId, portIndex, simStore, sendCommand);
                const newSim =
                    simStore.findSimInUseByPortId(portId) || simStore.getBlockedSimByPortId(portId);
                pendingRequests[portId] = undefined;
                resolve({oldSim, newSim});
            }, timeOutMs);
        } else {
            const currentSim = simStore.findSimInUseByPortId(portId);
            resolve({oldSim: currentSim, newSim: currentSim});
        }
    });

export default scheduleDeviceConfiguration;
