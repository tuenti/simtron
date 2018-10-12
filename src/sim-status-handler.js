import {createReadIccCommand, createGetNetworkStatusCommand} from './device-port/model/command';

const createSimStatusHandler = (simsCatalog) => {

    let pendingStatusRequests = {};

    const updateSimStatus = async (portHandler, simsCatalog) => {
        const readIccCommandResponse = await portHandler.sendCommand(createReadIccCommand());
        if (readIccCommandResponse.isSuccessful) {
            const getNetworkStatusCommandResponse = await portHandler.sendCommand(
                createGetNetworkStatusCommand()
            );
            if (getNetworkStatusCommandResponse.isSuccessful) {
                simsCatalog.setSimInUse(
                    readIccCommandResponse.icc,
                    getNetworkStatusCommandResponse.networkStatus,
                    portHandler.portId
                );
            }
        }
        return {
            success: readIccCommandResponse.isSuccessful,
        };
    };

    const scheduleStatusRequest = (portHandler, timeOutMs = 0) => {
        if (!pendingStatusRequests[portHandler.portId] || timeOutMs === 0) {
            pendingStatusRequests[portHandler.portId] = setTimeout(async () => {
                await updateSimStatus(portHandler, simsCatalog);
                pendingStatusRequests[portHandler.portId] = undefined;
            }, timeOutMs);
        }
    };

    const storeSimNetworkStatus = (networkStatus, portId) =>
        simsCatalog.updateSimNetworkStatus(networkStatus, portId);

    return {
        scheduleStatusRequest,
        storeSimNetworkStatus,
    };
}

export default createSimStatusHandler;