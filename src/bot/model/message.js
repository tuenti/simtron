import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_CATALOG_MESSAGE, ANSWER_SIM_STATUS} from './message-type';
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

export const createSimStatusAnswerMessage = (sims) => {
    return {
        type: ANSWER_SIM_STATUS,
        text: Object.keys(sims).map((portId) => {
            const sim = sims[portId];
            const {icc, msisdn = undefined, brand = undefined, country = undefined, lineType = undefined} = sim;
            const simData = msisdn && brand && country && lineType
            ? `${msisdn} ${brand} ${country} ${lineType}`
            : `Unknown sim with icc ${icc}`;
            return sim.networkStatus.isWorking
                ? `${BOLD_TEXT_MARK}${simData}${BOLD_TEXT_MARK}: ${sim.networkStatus.name}`
                : `${BOLD_TEXT_MARK}${STRIKE_TEXT_MARK}${simData}${STRIKE_TEXT_MARK}${BOLD_TEXT_MARK}: ${sim.networkStatus.name}`
        }),
    };
};