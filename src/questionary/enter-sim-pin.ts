import createQuestionaryHandler from './handler';
import {Store} from '../store';
import {PortInUse} from '../store/sim-catalog';
import scanPort from '../port-scan';
import {SendCommandCallback, SendMessageCallback} from '../bot/speech';
import {createEnterPinCommand} from '../device-port/model/command';

const CURRENT_PIN = 'pin';

type PinType = 'pin' | 'puk';

const createEnterPinQuestionary = (
    blockedSim: PortInUse,
    pinType: PinType,
    store: Store,
    sendCommand: SendCommandCallback,
    sendMessage: SendMessageCallback
) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: CURRENT_PIN,
                type: 'free-text',
                text: `Let's start. This *SIM* is blocked, requiring the ${pinType} to be used. To unblock it, please type it.`,
                errorMessages: {},
            },
        ],
        initialData: [],
        finishCallback: async responses => {
            const pin = responses[CURRENT_PIN];
            await sendCommand(createEnterPinCommand(pin), blockedSim.portId);
            store.sim.setPinForImei(pin, blockedSim.imei);
            scanPort(blockedSim.portId, blockedSim.portIndex, sendCommand, store, sendMessage);
        },
        finishFeedbackText: 'Done, the *SIM* should start working in a moment, please wait.',
    });

export default createEnterPinQuestionary;
