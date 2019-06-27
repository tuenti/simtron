import createQuestionaryHandler, {INVALID_INDEX, NO_ERROR, Answers} from './handler';
import libPhoneNumber from 'google-libphonenumber';
import {
    getSupportedCountries,
    getCountryFlag,
    getCountryName,
    getSupportedBrands,
    getSupportedLineTypes,
} from '../config';
import {NON_DIGITS} from '../util/matcher';
import {Store} from '../store';

const ICC_DATA_KEY = 'icc';
const MSISDN_DATA_KEY = 'msisdn';
const BRAND_DATA_KEY = 'brand';
const COUNTRY_DATA_KEY = 'country';
const LINE_TYPE_DATA_KEY = 'line-type';
const IS_VISIBLE_DATA_KEY = 'is-visible';

const INVALID_MSISDN_ERROR = 'invalid-msisdn';

interface PhoneNumberInfo {
    national: string;
    international: string;
}

const getCountryQuestionOptions = () =>
    getSupportedCountries().map(country => ({
        text: `${getCountryFlag(country)} ${getCountryName(country)}`,
        value: country,
    }));

const getBrandQuestionOptions = (country: string) =>
    getSupportedBrands(country).map(brand => ({
        text: brand,
        value: brand,
    }));

const getLineTypeQuestionOptions = (country: string, brand: string) =>
    getSupportedLineTypes(country, brand).map((lineType: string) => ({
        text: lineType,
        value: lineType,
    }));

const createIdentifySimQuestionary = ({icc}: {icc: string}, store: Store) =>
    createQuestionaryHandler({
        questions: [
            {
                dataId: COUNTRY_DATA_KEY,
                type: 'single-selection',
                text: "Let's start. Can you please select the *country* of the SIM card ?",
                optionsCreator: getCountryQuestionOptions,
                errorMessages: {
                    [INVALID_INDEX]:
                        ':face_with_rolling_eyes: Select an option please ... type the number of the selected option !',
                },
            },
            {
                dataId: BRAND_DATA_KEY,
                type: 'single-selection',
                text: '... and the *brand* is ?',
                optionsCreator: (previousAnswers: Answers) =>
                    getBrandQuestionOptions(previousAnswers[COUNTRY_DATA_KEY]),
                errorMessages: {
                    [INVALID_INDEX]:
                        ':unamused: Select one please ... type the number of the selected option !',
                },
            },
            {
                dataId: MSISDN_DATA_KEY,
                type: 'free-text',
                text: 'Thanks dude! Can you please tell me the *phone number* ?',
                validator: (msisdn, previousAnswers) => {
                    const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parseAndKeepRawInput(msisdn, previousAnswers[COUNTRY_DATA_KEY]);
                    return phoneUtil.isValidNumber(number) ? NO_ERROR : INVALID_MSISDN_ERROR;
                },
                answerFormatter: (msisdn, previousAnswers): PhoneNumberInfo => {
                    const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();
                    const number = phoneUtil.parseAndKeepRawInput(msisdn, previousAnswers[COUNTRY_DATA_KEY]);
                    const phoneNumberFormat = libPhoneNumber.PhoneNumberFormat;
                    return {
                        national: phoneUtil
                            .format(number, phoneNumberFormat.NATIONAL)
                            .replace(NON_DIGITS, ''),
                        international: phoneUtil
                            .format(number, phoneNumberFormat.INTERNATIONAL)
                            .replace(NON_DIGITS, ''),
                    };
                },
                errorMessages: {
                    [INVALID_MSISDN_ERROR]: ':sleepy: Ops, you must enter a valid *phone number*.',
                },
            },
            {
                dataId: LINE_TYPE_DATA_KEY,
                type: 'single-selection',
                text: 'Great! Now I need to know the *line type*',
                optionsCreator: (previousAnswers: Answers) =>
                    getLineTypeQuestionOptions(
                        previousAnswers[COUNTRY_DATA_KEY],
                        previousAnswers[BRAND_DATA_KEY]
                    ),
                errorMessages: {
                    [INVALID_INDEX]:
                        ":tired_face: I can't accept that! It must be one of these options ... type the number of the selected option !",
                },
            },
            {
                dataId: IS_VISIBLE_DATA_KEY,
                type: 'single-selection',
                text: 'Finally ... Do you want to make this sim *available* to allowed users groups ?',
                optionsCreator: () => [
                    {text: 'Yes, make it available', value: true},
                    {text: 'No, hide this sim by now', value: false},
                ],
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
                responses[MSISDN_DATA_KEY].international,
                responses[MSISDN_DATA_KEY].national,
                responses[BRAND_DATA_KEY],
                responses[COUNTRY_DATA_KEY],
                responses[LINE_TYPE_DATA_KEY],
                responses[IS_VISIBLE_DATA_KEY]
            ),
        finishFeedbackText: '*Sim* successfully registered :tada:',
    });

export default createIdentifySimQuestionary;
