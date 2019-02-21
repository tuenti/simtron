import createQuestionaryHandler, {INVALID_INDEX} from './handler';
import {createSearchOperatorsCommand} from '../device-port/model/command';
import {SimInUse} from '../store/sim-catalog';
import {SendCommandCallback} from '../bot/speech';

const SIM_OPERATOR_DATA_KEY = 'operator';

const ICC_DATA_KEY = 'icc';

const getAvailableOperators = (portId: string, sendCommand: SendCommandCallback) => () => {
    return new Promise(resolve => {
        sendCommand(createSearchOperatorsCommand(), portId).then(({operators}) =>
            resolve(operators.map((operator: string) => ({text: operator, value: operator})))
        );
    });
};

const createForceSimOperatorQuestionary = ({icc, portId}: SimInUse, sendCommand: SendCommandCallback) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: SIM_OPERATOR_DATA_KEY,
                type: 'single-selection',
                text: 'Select the operator you want to force the sim to:',
                optionsCreator: getAvailableOperators(portId, sendCommand),
                errorMessages: {
                    [INVALID_INDEX]:
                        ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !',
                },
            },
        ],
        initialData: [
            {
                dataId: ICC_DATA_KEY,
                value: icc,
            },
        ],
        finishCallback: () => {
            console.log('forcing');
        },
        finishFeedbackText: 'Connecting to selected operator.',
    });

export default createForceSimOperatorQuestionary;
