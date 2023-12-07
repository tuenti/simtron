import {createSimInsertedNotificationMessage, createSimRemovedNotificationMessage} from './bot/model/message';
import {getBotMessageSequenceEnsuringTime, getSimStatusRequestScheduleTime} from './config';
import delayed from './util/delay';
import scheduleDeviceConfiguration, {SimDiff} from './device-config';
import {Store} from './store';
import { SendCommandCallback, SendMessageCallback } from './bot/types';

const SIM_READY_TIMEOUT_MS = 5000;

const handleSimManipulation = (simDiff: SimDiff, sendMessage: SendMessageCallback) => {
    if (simDiff.oldSim === null && simDiff.newSim !== null) {
        sendMessage(createSimInsertedNotificationMessage(simDiff.newSim));
    } else if (simDiff.oldSim !== null && simDiff.newSim === null) {
        sendMessage(createSimRemovedNotificationMessage(simDiff.oldSim));
    } else if (
        simDiff.oldSim !== null &&
        simDiff.newSim !== null &&
        simDiff.oldSim.icc !== simDiff.newSim.icc
    ) {
        const oldSim = simDiff.oldSim;
        const newSim = simDiff.newSim;
        sendMessage(createSimRemovedNotificationMessage(oldSim));
        delayed(() => {
            sendMessage(createSimInsertedNotificationMessage(newSim));
        }, getBotMessageSequenceEnsuringTime());
    }
};

const scanPort = (
    portId: string,
    portIndex: number,
    sendCommand: SendCommandCallback,
    store: Store,
    sendMessage: SendMessageCallback
) =>
    setTimeout(async () => {
        handleSimManipulation(
            await scheduleDeviceConfiguration(portId, portIndex, store.sim, sendCommand),
            sendMessage
        );
        handleSimManipulation(
            await scheduleDeviceConfiguration(
                portId,
                portIndex,
                store.sim,
                sendCommand,
                getSimStatusRequestScheduleTime()
            ),
            sendMessage
        );
    }, SIM_READY_TIMEOUT_MS);

export default scanPort;
