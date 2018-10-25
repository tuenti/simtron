import createQuestionaryHandler, {INVALID_INDEX, NO_ERROR} from './handler';
import {SINGLE_SELECTION_QUESTION, FREE_TEXT_QUESTION} from './handler/question-type';
import libPhoneNumber from 'google-libphonenumber';
import {
    getSupportedCountries,
    getCountryFlag,
    getCountryName,
    getSupportedBrands,
    getSupportedLineTypes,
} from '../config';
import {QUESTION_OPTION_TEXT, QUESTION_OPTION_VALUE} from './handler/question-field';
import {SPACES} from '../util/matcher';

const ICC_DATA_KEY = 'icc';
const MSISDN_DATA_KEY = 'msisdn';
const BRAND_DATA_KEY = 'brand';
const COUNTRY_DATA_KEY = 'country';
const LINE_TYPE_DATA_KEY = 'line-type';

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

const getLineTypeQuestionOptions = (country, brand) =>
    getSupportedLineTypes(country, brand).map(lineType => ({
        [QUESTION_OPTION_TEXT]: lineType,
        [QUESTION_OPTION_VALUE]: lineType,
    }));

const createIdentifySimQuestionary = ({icc}, store) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: COUNTRY_DATA_KEY,
                type: SINGLE_SELECTION_QUESTION,
                text: "Let's start. Can you please select the *country* of the SIM card ?",
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
                    return phoneUtil.format(number, phoneNumberFormat.INTERNATIONAL).replace(SPACES, '');
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
        initialData: [
            {
                dataId: ICC_DATA_KEY,
                value: icc,
            },
        ],
        finishCallback: responses =>
            store.sim.saveSimInCatalog(
                responses[ICC_DATA_KEY],
                responses[MSISDN_DATA_KEY],
                responses[BRAND_DATA_KEY],
                responses[COUNTRY_DATA_KEY],
                responses[LINE_TYPE_DATA_KEY]
            ),
        finishFeedbackText: '*Sim* successfully registered :tada:',
    });

export default createIdentifySimQuestionary;
