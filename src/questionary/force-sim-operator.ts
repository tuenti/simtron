import createQuestionaryHandler, {INVALID_INDEX, NO_ERROR, Answers} from './handler';
import {Store} from '../store';

const SIM_OPERATOR_DATA_KEY = 'operator';

const ICC_DATA_KEY = 'icc';

const getAvailableOperators = () => {
    return new Promise(resolve => {
        setTimeout(() => resolve([1, 2, 3]), 1000);
    });
};

const createForceSimOperatorQuestionary = ({icc}: {icc: string}, store: Store) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: SIM_OPERATOR_DATA_KEY,
                type: 'single-selection',
                text: 'Select the operator you want to force the sim to:',
                optionsCreator: getAvailableOperators,
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
