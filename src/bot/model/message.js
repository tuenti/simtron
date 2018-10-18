import {
    NOTIFY_BOOTING,
    NOTIFY_BOOT_DONE,
    ANSWER_CATALOG_MESSAGE,
    ANSWER_SIM_STATUS,
    NOTIFY_SMS_RECEIVED,
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

export const createNewSmsNotificationMessage = (sim, smsText) => {
    const simData = createSimIdentityLine(sim);
    return {
        type: NOTIFY_SMS_RECEIVED,
        text: [`${getCountryFlag(sim.country)} *${simData}*`, smsText],
    };
};
