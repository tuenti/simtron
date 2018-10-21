import {
    NOTIFY_BOOTING,
    NOTIFY_BOOT_DONE,
    ANSWER_CATALOG_MESSAGE,
    ANSWER_SIM_STATUS,
    NOTIFY_SMS_RECEIVED,
    NOTIFY_UNKNOWN_SIM_EXISTENCE,
    ERROR,
    SUCCESS,
    FREE_TEXT_QUESTION,
    SINGLE_SELECTION_QUESTION,
} from './message-type';
import {getCountryFlag} from '../../config';
import * as Questionary from '../../questionary/handler/question-type';
import {QUESTION_OPTION_TEXT} from '../../questionary/handler/question-field';

export const USER_MENTION = '[USER_MENTION]';

export const createBootingMessage = () => ({
    type: NOTIFY_BOOTING,
    text: 'Booting ...',
});

export const createBootDoneMessage = () => ({
    type: NOTIFY_BOOT_DONE,
    text: 'Ready',
});

export const createCatalogAnswerMessage = () => ({
    type: ANSWER_CATALOG_MESSAGE,
    text: `:+1: *${USER_MENTION}* getting catalog info.`,
});

const createSimIdentityLine = ({
    icc,
    msisdn = undefined,
    brand = undefined,
    country = undefined,
    lineType = undefined,
}) =>
    msisdn && brand && country && lineType
        ? `${msisdn} ${brand} ${country} ${lineType}`
        : `Unknown sim with icc ${icc}`;

export const createSimStatusAnswerMessage = sims => {
    return {
        type: ANSWER_SIM_STATUS,
        textLines: Object.keys(sims).map(portId => {
            const sim = sims[portId];
            const simData = createSimIdentityLine(sim);
            return sim.networkStatus.isWorking
                ? `${getCountryFlag(sim.country)} *${simData}* ${sim.networkStatus.name}`
                : `${getCountryFlag(sim.country)} *~${simData}~* ${sim.networkStatus.name}`;
        }),
    };
};

export const createUnknownSimsExistenceNotificationMessage = unknownSims => {
    return {
        type: NOTIFY_UNKNOWN_SIM_EXISTENCE,
        textLines: unknownSims.map(sim => `Icc: *${sim.icc}*`),
    };
};

export const createNewSmsNotificationMessage = (sim, smsText) => {
    const simData = createSimIdentityLine(sim);
    return {
        type: NOTIFY_SMS_RECEIVED,
        textLines: [`${getCountryFlag(sim.country)} *${simData}*`, smsText],
    };
};

export const createQuestionMessage = question => {
    switch (question.type) {
        case Questionary.FREE_TEXT_QUESTION:
            return {
                type: FREE_TEXT_QUESTION,
                textLines: [question.text],
            };
        case Questionary.SINGLE_SELECTION_QUESTION:
            return {
                type: SINGLE_SELECTION_QUESTION,
                textLines: [question.text, ...question.options.map(option => option[QUESTION_OPTION_TEXT])],
            };
        default:
            return {};
    }
};

export const createSuccessFeedbackMessage = text => ({
    type: SUCCESS,
    text,
});

export const createErrorMessage = text => ({
    type: ERROR,
    text,
});
