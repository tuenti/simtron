import createQuestionaryStateMachine from './state-machine';
import {SINGLE_SELECTION_QUESTION, FREE_TEXT_QUESTION} from './question-type';
import {NO_ERROR} from './state-machine';

export const ICC_DATA_KEY = 'icc';
export const MSISDN_DATA_KEY = 'msisdn';
export const BRAND_DATA_KEY = 'brand';
export const COUNTRY_DATA_KEY = 'country';
export const LINE_TYPE_DATA_KEY = 'line-type';

const INVALID_MSISDN_ERROR = 'invalid-msisdn';
const INVALID_BRAND_OPTION_ERROR = 'invalid-brand';
const INVALID_COUNTRY_OPTION_ERROR = 'invalid-brand';
const INVALID_LINE_TYPE_OPTION_ERROR = 'invalid-line-type';

const createIdentifySimQuestionary = ({icc}) =>
    createQuestionaryStateMachine(
        [
            {
                dataId: MSISDN_DATA_KEY,
                type: FREE_TEXT_QUESTION,
                text: "*Okay* let's start. Can you please tell me the *phone number* of the SIM card ?",
                validator: msisdn => {
                    return NO_ERROR;
                },
                errorMessages: {
                    [INVALID_MSISDN_ERROR]: ':sleepy: Ops, you must enter a valid *phone number* dude !',
                },
            },
            {
                dataId: BRAND_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Thanks dude! What about the *brand* ?',
                options: ['una', 'dos', 'tres'],
                validator: brandOption => {
                    return NO_ERROR;
                },
                errorMessages: {
                    [INVALID_BRAND_OPTION_ERROR]:
                        ':unamused: Select one please ... type the number of the selected option !',
                },
            },
            {
                dataId: COUNTRY_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: '... of what *country* ?',
                options: ['pais1', 'pais2', 'pais3'],
                validator: countryOption => {
                    return NO_ERROR;
                },
                errorMessages: {
                    [INVALID_COUNTRY_OPTION_ERROR]:
                        ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !',
                },
            },
            {
                dataId: LINE_TYPE_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Great, we are almost there! Can you please tell me the *line type* of the SIM card ?',
                options: ['pre', 'post', 'control'],
                validator: lineTypeOption => {
                    return NO_ERROR;
                },
                errorMessages: {
                    [INVALID_LINE_TYPE_OPTION_ERROR]:
                        ":tired_face: I can't accept that! It must be one of these options ... type the number of the selected option !",
                },
            },
        ],
        [
            {
                dataId: ICC_DATA_KEY,
                value: icc,
            },
        ],
        '*Sim* successfully registered :tada:'
    );

export default createIdentifySimQuestionary;
