import createQuestionaryHandler, {INVALID_INDEX} from './handler';
import {Store} from '../store';
import {createSetLedStatusCommand} from '../device-port/model/command';
import {Command} from '../device-port/model/command';
import {SimInUse} from '../store/sim-catalog';

const SEARCH_CRITERIA = 'criteria';
const SEARCH_VALUE = 'value';

type Port = {portId: string; sendCommand: (command: Command) => void};

const highlightPorts = async (ports: string[], allPorts: Port[]) =>
    new Promise(async resolve => {
        await Promise.all(
            allPorts.map(p => p.sendCommand(createSetLedStatusCommand(ports.includes(p.portId))))
        );
        setTimeout(async () => {
            await Promise.all(allPorts.map(p => p.sendCommand(createSetLedStatusCommand(true))));
            resolve();
        }, 10000);
    });

const findPorts = (
    criteria: PortSearchCriteriaConcept,
    value: string,
    store: Store,
    includeHiddenSims: boolean
): string[] => {
    switch (criteria) {
        case PortSearchCriteriaConcept.ByIndex: {
            const foundPort = store.ports.findPortByIndex(parseInt(value)) as Port;
            return foundPort ? [foundPort.portId] : [];
        }
        case PortSearchCriteriaConcept.ByIcc: {
            const foundSim = store.sim.findSimInUseByIcc(value, includeHiddenSims) as SimInUse;
            return foundSim ? [foundSim.portId] : [];
        }
        case PortSearchCriteriaConcept.ByPhoneNumber: {
            return store.sim.findSimsInUseByDisplayNumber(value, includeHiddenSims).map(sim => sim.portId);
        }
    }
};

enum PortSearchCriteriaConcept {
    ByIndex = 'index',
    ByIcc = 'icc',
    ByPhoneNumber = 'phone number',
}

const getCriteriaQuestionOptions = () => [
    {
        text: 'By Index',
        value: PortSearchCriteriaConcept.ByIndex,
    },
    {
        text: 'By Icc',
        value: PortSearchCriteriaConcept.ByIcc,
    },
    {
        text: 'By phone number',
        value: PortSearchCriteriaConcept.ByPhoneNumber,
    },
];

const createIdentifyPortQuestionary = (store: Store, includeHiddenSims: boolean) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: SEARCH_CRITERIA,
                type: 'single-selection',
                text:
                    'Ok. Select the search criteria, This will be used to identify the port you want to see fisically identified by a *blinking light*',
                optionsCreator: getCriteriaQuestionOptions,
                errorMessages: {
                    [INVALID_INDEX]:
                        ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !',
                },
            },
            {
                dataId: SEARCH_VALUE,
                type: 'free-text',
                text: 'Ok, type the search criteria',
                errorMessages: {},
            },
        ],
        initialData: [],
        finishCallback: responses => {
            const ports = findPorts(
                responses[SEARCH_CRITERIA],
                responses[SEARCH_VALUE],
                store,
                includeHiddenSims
            );
            if (ports.length > 0) {
                highlightPorts(ports, store.ports.getAll());
            }
        },
        finishFeedbackText: `Take a look to hardware, it should be a blinking light somewhere, this is the SIM port you're identifying.`,
    });

export default createIdentifyPortQuestionary;
