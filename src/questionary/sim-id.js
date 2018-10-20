import createQuestionaryStateMachine from './state-machine';
import {SINGLE_SELECTION_QUESTION, FREE_TEXT_QUESTION} from './question-type';
import {NO_ERROR} from './state-machine';
import libPhoneNumber from 'google-libphonenumber';

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
                dataId: BRAND_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: "*Okay* let's start. Can you tell me the *brand* of the SIM card please ?",
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
                dataId: MSISDN_DATA_KEY,
                type: FREE_TEXT_QUESTION,
                text: 'Thanks dude! Can you please tell me the *phone number* ?',
                validator: (msisdn, previousAnswers) => {
                    const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parseAndKeepRawInput(msisdn, previousAnswers[COUNTRY_DATA_KEY]);
                    return phoneUtil.isValidNumber(number) ? NO_ERROR : INVALID_MSISDN_ERROR;
                },
                answerFormatter: (msisdn, previousAnswers) => {
                    const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parseAndKeepRawInput(msisdn, previousAnswers[COUNTRY_DATA_KEY]);
                    const phoneNumberFormat = libPhoneNumber.PhoneNumberFormat;
                    return phoneUtil.format(number, phoneNumberFormat.INTERNATIONAL);
                },
                errorMessages: {
                    [INVALID_MSISDN_ERROR]: ':sleepy: Ops, you must enter a valid *phone number* dude !',
                },
            },
            {
                dataId: LINE_TYPE_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: 'Great! finally ... I need to know the *line type*',
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
