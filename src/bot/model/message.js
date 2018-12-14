import {
    NOTIFY_BOOTING,
    NOTIFY_BOOT_DONE,
    ANSWER_CATALOG,
    ANSWER_CATALOG_CONTENT,
    NOTIFY_SMS_RECEIVED,
    NOTIFY_UNKNOWN_SIM_EXISTENCE,
    ERROR,
    SUCCESS,
    FREE_TEXT_QUESTION,
    SINGLE_SELECTION_QUESTION,
    ANSWER_SIM_DETAILS,
    ANSWER_SIM_DETAILS_CONTENT,
} from './message-type';
import {getCountryFlag} from '../../config';

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
    type: ANSWER_CATALOG,
    text: `:+1: *${USER_MENTION}* getting catalog info.`,
});

export const createSimDetailsAnswerMessage = sim => ({
    type: ANSWER_SIM_DETAILS,
    text: `:+1: *${USER_MENTION}* getting details.`,
});

const createSimIdentityLine = ({icc, msisdn}) => (msisdn ? msisdn : `Unknown sim with icc ${icc}`);

const createLineInfo = ({brand, lineType}) => (brand && lineType ? `${brand} ${lineType}` : '');

export const createCatalogAnswerContentMessage = sims => {
    return {
        type: ANSWER_CATALOG_CONTENT,
        textLines: Object.keys(sims).map(portId => {
            const sim = sims[portId];
            const simId = createSimIdentityLine(sim);
            const lineInfo = createLineInfo(sim);
            return sim.networkStatus.isWorking
                ? `${getCountryFlag(sim.country)} *${simId}* ${lineInfo}`
                : `${getCountryFlag(sim.country)} *~${simId}~* ${lineInfo}`;
        }),
    };
};

export const createSimDetailsAnswerContentMessage = sim => {
    const simId = createSimIdentityLine(sim);
    return {
        type: ANSWER_SIM_DETAILS_CONTENT,
        text: sim.networkStatus.isWorking
            ? `${getCountryFlag(sim.country)} *${simId}* icc: ${sim.icc}`
            : `${getCountryFlag(sim.country)} *~${simId}~* icc: ${sim.icc}`,
        attachments: [
            {
                fields: [
                    {
                        name: 'Line Info',
                        value: createLineInfo(sim),
                    },
                    {
                        name: 'Network Status',
                        value: sim.networkStatus.name,
                    },
                ],
            },
        ],
    };
};

export const createUnknownSimsExistenceNotificationMessage = unknownSims => {
    return {
        type: NOTIFY_UNKNOWN_SIM_EXISTENCE,
        textLines: unknownSims.map(sim => `Icc: *${sim.icc}*`),
    };
};

export const createNewSmsNotificationMessage = (sim, smsText) => {
    const simId = createSimIdentityLine(sim);
    const lineInfo = createLineInfo(sim);
    return {
        type: NOTIFY_SMS_RECEIVED,
        textLines: [`${getCountryFlag(sim.country)} *${simId}* ${lineInfo}`, smsText],
    };
};

export const createQuestionMessage = question => {
    switch (question.type) {
        case 'free-text':
            return {
                type: FREE_TEXT_QUESTION,
                textLines: [question.text],
            };
        case 'single-selection':
            return {
                type: SINGLE_SELECTION_QUESTION,
                textLines: [question.text, ...question.options.map(option => option['text'])],
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
