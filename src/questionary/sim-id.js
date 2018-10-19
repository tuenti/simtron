import createQuestionaryStateMachine from './state-machine';
import {SINGLE_SELECTION_QUESTION, FREE_TEXT_QUESTION} from './question-type';

export const ICC_DATA_KEY = 'icc';
export const MSISDN_DATA_KEY = 'msisdn';
export const BRAND_DATA_KEY = 'brand';
export const COUNTRY_DATA_KEY = 'country';
export const LINE_TYPE_DATA_KEY = 'line-type';

const createIdentifySimQuestionary = ({icc}) =>
    createQuestionaryStateMachine(
        [
            {
                dataId: MSISDN_DATA_KEY,
                type: FREE_TEXT_QUESTION,
                text: 'Ok, can you please tell me the Phone Number of the SIM card ?',
            },
            {
                dataId: BRAND_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Thanks, the brand ?',
                options: ['una', 'dos', 'tres'],
            },
            {
                dataId: COUNTRY_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Ok, of what country ?',
                options: ['pais1', 'pais2', 'pais3'],
            },
            {
                dataId: LINE_TYPE_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Great ! Last, can you please tell me line type ?',
                options: ['pre', 'post', 'control'],
            },
        ],
        [
            {
                dataId: ICC_DATA_KEY,
                value: icc,
            },
        ],
        'Sim successfully registered'
    );

export default createIdentifySimQuestionary;
