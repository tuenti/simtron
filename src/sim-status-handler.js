import {
    createSetEchoModeCommand,
    createEnableSmsNotificationsCommand,
    createSetSmsPduModeCommand,
    createEnableNetworkStatusNotificationsCommand,
    createReadIccCommand,
    createGetNetworkStatusCommand
} from './device-port/model/command';

const createSimStatusHandler = (simsCatalog) => {

    let pendingRequests = {};

    const initializeDevice = async portHandler => {
        const commandsSucceeded = await Promise.all([
            portHandler.sendCommand(createSetEchoModeCommand(true)),
            portHandler.sendCommand(createSetSmsPduModeCommand()),
            portHandler.sendCommand(createEnableSmsNotificationsCommand()),
            portHandler.sendCommand(createEnableNetworkStatusNotificationsCommand()),
        ]);
        return commandsSucceeded.every(command => command.isSuccessful);
    };

    const getSimStatus = async portHandler => {
        const readIccCommandResponse = await portHandler.sendCommand(createReadIccCommand());
        if (readIccCommandResponse.isSuccessful) {
            const getNetworkStatusCommandResponse = await portHandler.sendCommand(
                createGetNetworkStatusCommand()
            );
            if (getNetworkStatusCommandResponse.isSuccessful) {
                return {
                    icc: readIccCommandResponse.icc,
                    networkStatus: getNetworkStatusCommandResponse.networkStatus,
                };
            }
        }
        return null;
    };

    const scheduleDeviceInit = (portHandler, timeOutMs = 0) => {
        if (!pendingRequests[portHandler.portId] || timeOutMs === 0) {
            pendingRequests[portHandler.portId] = setTimeout(async () => {
                const deviceInitialized = await initializeDevice(portHandler);
                if (deviceInitialized) {
                    const simStatus = await getSimStatus(portHandler);
                    if (simStatus) {
                        simsCatalog.setSimInUse(
                            simStatus.icc,
                            simStatus.networkStatus,
                            portHandler.portId
                        );
                    } else {
                        simsCatalog.setSimRemoved(portHandler.portId);
                    }
                }
                pendingRequests[portHandler.portId] = undefined;
            }, timeOutMs);
        }
    };

    const storeSimNetworkStatus = (networkStatus, portId) =>
        simsCatalog.updateSimNetworkStatus(networkStatus, portId);

    const getAllSimsInUse = () => simsCatalog.getAllSimsInUse();

    return {
        scheduleDeviceInit,
        storeSimNetworkStatus,
        getAllSimsInUse,
    };
}

export default createSimStatusHandler;