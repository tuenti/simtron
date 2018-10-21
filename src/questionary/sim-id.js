import createQuestionaryStateMachine, {INVALID_INDEX} from './state-machine';
import {SINGLE_SELECTION_QUESTION, FREE_TEXT_QUESTION} from './question-type';
import {NO_ERROR} from './state-machine';
import libPhoneNumber from 'google-libphonenumber';
import {
    getSupportedCountries,
    getCountryFlag,
    getCountryName,
    getSupportedBrands,
    getSupportedLineTypes,
} from '../config';
import {QUESTION_OPTION_TEXT, QUESTION_OPTION_VALUE} from './question-field';

export const ICC_DATA_KEY = 'icc';
export const MSISDN_DATA_KEY = 'msisdn';
export const BRAND_DATA_KEY = 'brand';
export const COUNTRY_DATA_KEY = 'country';
export const LINE_TYPE_DATA_KEY = 'line-type';

const INVALID_MSISDN_ERROR = 'invalid-msisdn';

const getCountryQuestionOptions = () =>
    getSupportedCountries().map(country => ({
        [QUESTION_OPTION_TEXT]: `${getCountryFlag(country)} ${getCountryName(country)}`,
        [QUESTION_OPTION_VALUE]: country,
    }));

const getBrandQuestionOptions = country =>
    getSupportedBrands(country).map(brand => ({
        [QUESTION_OPTION_TEXT]: brand,
        [QUESTION_OPTION_VALUE]: brand,
    }));

const getLineTypeQuestionOptions = (country, brand) => {
    console.log(country, brand);
    console.log(getSupportedLineTypes(country, brand));
    return getSupportedLineTypes(country, brand).map(lineType => ({
        [QUESTION_OPTION_TEXT]: lineType,
        [QUESTION_OPTION_VALUE]: lineType,
    }));
};

const createIdentifySimQuestionary = ({icc}) =>
    createQuestionaryStateMachine(
        [
            {
                dataId: COUNTRY_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: "*Okay* let's start. Can you please select the *country* of the SIM card ?",
                options: () => getCountryQuestionOptions(),
                errorMessages: {
                    [INVALID_INDEX]:
                        ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !',
                },
            },
            {
                dataId: BRAND_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: '... and the *brand* is ?',
                options: previousAnswers => getBrandQuestionOptions(previousAnswers[COUNTRY_DATA_KEY]),
                errorMessages: {
                    [INVALID_INDEX]:
                        ':unamused: Select one please ... type the number of the selected option !',
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
                options: previousAnswers =>
                    getLineTypeQuestionOptions(
                        previousAnswers[COUNTRY_DATA_KEY],
                        previousAnswers[BRAND_DATA_KEY]
                    ),
                errorMessages: {
                    [INVALID_INDEX]:
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
