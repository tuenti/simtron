import createQuestionaryHandler, {INVALID_INDEX} from './handler';
import {
    createSearchOperatorsCommand,
    Operator,
    OperatorStatus,
    createForceOperatorCommand,
} from '../device-port/model/command';
import {SimInUse} from '../store/sim-catalog';
import {SendCommandCallback} from '../bot/speech';

const SIM_OPERATOR_DATA_KEY = 'operator';

const ICC_DATA_KEY = 'icc';

const getOperatorStatusText = (operatorStatus: OperatorStatus): string => {
    switch (operatorStatus) {
        case OperatorStatus.Current:
            return 'Currently selected';
        case OperatorStatus.Available:
            return 'Available';
        case OperatorStatus.Forbidden:
            return 'Forbidden';
        default:
            return 'Unknown status';
    }
};

const createSelectOperatorQuestionOptions = (operators: Operator[]) =>
    operators.map(operator => ({
        text: operator.longName
            ? `${operator.longName} (${getOperatorStatusText(operator.status)})`
            : `${operator.shortName} (${getOperatorStatusText(operator.status)})`,
        value: operator,
    }));

const getAvailableOperators = (portId: string, sendCommand: SendCommandCallback) => () => {
    return new Promise(resolve => {
        sendCommand(createSearchOperatorsCommand(), portId).then(({operators}) =>
            resolve(createSelectOperatorQuestionOptions(operators))
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
        finishCallback: responses => {
            const operator = responses[SIM_OPERATOR_DATA_KEY];
            sendCommand(createForceOperatorCommand(operator), portId);
        },
        finishFeedbackText: 'Connecting to selected operator.',
    });

export default createForceSimOperatorQuestionary;
