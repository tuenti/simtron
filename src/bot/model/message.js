import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_CATALOG_MESSAGE, ANSWER_SIM_STATUS, NOTIFY_SMS_RECEIVED} from './message-type';
import {USER_MENTION, BOLD_TEXT_MARK, STRIKE_TEXT_MARK} from './message-placeholder';
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
    text: `${BOLD_TEXT_MARK}${USER_MENTION}${BOLD_TEXT_MARK} getting catalog info.`,
});

const createSimIdentityLine = ({icc, msisdn = undefined, brand = undefined, country = undefined, lineType = undefined}) =>
    msisdn && brand && country && lineType
        ? `${msisdn} ${brand} ${country} ${lineType}`
        : `Unknown sim with icc ${icc}`;

export const createSimStatusAnswerMessage = (sims) => {
    return {
        type: ANSWER_SIM_STATUS,
        text: Object.keys(sims).map((portId) => {
            const sim = sims[portId];
            const simData = createSimIdentityLine(sim);
            return sim.networkStatus.isWorking
                ? `${BOLD_TEXT_MARK}${simData}${BOLD_TEXT_MARK}: ${sim.networkStatus.name}`
                : `${BOLD_TEXT_MARK}${STRIKE_TEXT_MARK}${simData}${STRIKE_TEXT_MARK}${BOLD_TEXT_MARK}: ${sim.networkStatus.name}`
        }),
    };
};

export const createNewSmsNotificationMessage = (sim, smsText) => {
    const simData = createSimIdentityLine(sim);
    return {
        type: NOTIFY_SMS_RECEIVED,
        text: [
            `New SMS from ${simData}`,
            smsText,
        ],
    };
};