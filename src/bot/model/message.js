import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE, ANSWER_CATALOG_MESSAGE, ANSWER_SIM_STATUS} from './message-type';
import {USER_MENTION, BOLD_TEXT_MARK, STROKE_TEXT_MARK} from './message-placeholder';
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
    text: `${USER_MENTION} getting catalog info ...`,
});

export const createSimStatusAnswerMessage = (sims) => {
    return {
        type: ANSWER_SIM_STATUS,
        text: Object.keys(sims).map((portId) => {
            const sim = sims[portId];
            const {icc, msisdn = undefined, provider = undefined, lineType = undefined} = sim;
            const simData = msisdn && provider && lineType
            ? `${msisdn} ${provider} ${lineType}`
            : `Unknown sim with icc ${icc}`;
            return sim.networkStatus.isWorking
                ? `${BOLD_TEXT_MARK}${simData}${BOLD_TEXT_MARK}: ${sim.networkStatus.name}`
                : `${STROKE_TEXT_MARK}${simData}:${STROKE_TEXT_MARK} ${sim.networkStatus.name}`
        }),
    };
};