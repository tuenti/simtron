import {getCountryFlag, getBotDisplayName} from '../../config';
import {SimInUse, PortInUse, isSimInUse} from '../../store/sim-catalog';
import {Question, isSelectionQuestion} from '../../questionary/handler';
import {MessageType} from './message-type';
import {SIM_IDENTIFICATION_COMMAND} from '../speech/sim-identification';
import {SIM_PIN_REMOVE_COMMAND} from '../speech/enter-sim-pin';

export const USER_MENTION = '[USER_MENTION]';

interface Field {
    name: string;
    value: string;
}

interface Attachment {
    fields: Field[];
}

export interface OutgoingMessage {
    type: MessageType;
    text?: string;
    textLines?: string[];
    attachments?: Attachment[];
}

export interface IncomingMessage {
    botId: string;
    userName: string;
    userId: string;
    isFromAdmin: boolean;
    channel: string;
    messageText: string;
}

export const createBootingMessage = (): OutgoingMessage => ({
    type: MessageType.NOTIFY_BOOTING,
    text: 'Booting ...',
});

export const createBootDoneMessage = (): OutgoingMessage => ({
    type: MessageType.NOTIFY_BOOT_DONE,
    text: 'Ready',
});

export const createCatalogAnswerMessage = (): OutgoingMessage => ({
    type: MessageType.ANSWER_CATALOG,
    text: `:+1: *${USER_MENTION}* getting catalog info.`,
});

export const createSimDetailsAnswerMessage = (): OutgoingMessage => ({
    type: MessageType.ANSWER_SIM_DETAILS,
    text: `:+1: *${USER_MENTION}* getting details.`,
});

const createSimIdentityLine = ({icc, displayNumber}: SimInUse) =>
    displayNumber ? displayNumber : `Unknown sim with icc ${icc}`;

const createLineInfo = ({brand, lineType}: SimInUse) => (brand && lineType ? `${brand} ${lineType}` : '');

export const createCatalogAnswerContentMessage = (
    sims: {sim: SimInUse; isVisible: boolean}[]
): OutgoingMessage => {
    return {
        type: MessageType.ANSWER_CATALOG_CONTENT,
        textLines: sims.map(({sim, isVisible}) => {
            const simId = createSimIdentityLine(sim);
            const lineInfo = createLineInfo(sim);
            const visibility = isVisible ? '' : ':no_entry_sign:';
            return sim.networkStatus.isWorking
                ? `${getCountryFlag(sim.country)} *${simId}* ${lineInfo} ${visibility}`
                : `${getCountryFlag(sim.country)} *~${simId}~* ${lineInfo}  ${visibility}`;
        }),
    };
};

const createUnknownSimExistenceText = (portIndex: number) =>
    `Blocked *SIM* requiring pin or puk in port *${portIndex}*`;

export const createSimDetailsContentMessage = (
    simData: SimInUse | PortInUse,
    notificationText?: string
): OutgoingMessage => {
    if (isSimInUse(simData)) {
        const simId = createSimIdentityLine(simData);
        const lineInfo = createLineInfo(simData);
        const simDataPart = lineInfo ? `icc: ${simData.icc}, msisdn: ${simData.msisdn} ` : '';
        const fields = lineInfo
            ? [
                  {
                      name: 'Line Info',
                      value: lineInfo,
                  },
                  {
                      name: 'Network Status',
                      value: simData.networkStatus.name,
                  },
              ]
            : [
                  {
                      name: 'Network Status',
                      value: simData.networkStatus.name,
                  },
              ];
        return {
            type: MessageType.SIM_DETAILS_CONTENT,
            text: `${
                simData.networkStatus.isWorking
                    ? `${getCountryFlag(simData.country)} *${simId}* ${simDataPart}`
                    : `${getCountryFlag(simData.country)} *~${simId}~* ${simDataPart}`
            } ${notificationText ? notificationText : ''}`,
            attachments: [
                {
                    fields,
                },
            ],
        };
    } else {
        return {
            type: MessageType.SIM_DETAILS_CONTENT,
            text: `${createUnknownSimExistenceText(simData.portIndex)} ${
                notificationText ? notificationText : ''
            }`,
        };
    }
};

export const createSimInsertedNotificationMessage = (sim: SimInUse | PortInUse): OutgoingMessage =>
    createSimDetailsContentMessage(sim, 'inserted !');

export const createSimRemovedNotificationMessage = (sim: SimInUse | PortInUse): OutgoingMessage =>
    createSimDetailsContentMessage(sim, 'removed !');

export const createSimNetworkStatusChangedNotificationMessage = (sim: SimInUse): OutgoingMessage =>
    createSimDetailsContentMessage(sim, 'network status changed');

export const createUnknownSimsExistenceNotificationMessage = (
    unknownSims: SimInUse[],
    portsWithBlockedSims: PortInUse[]
): OutgoingMessage => {
    const unknownSimsLines = unknownSims.map(
        (sim) =>
            `Icc: *${
                sim.icc
            }* |To identify this SIM, type: *${getBotDisplayName()} ${SIM_IDENTIFICATION_COMMAND} ${
                sim.portIndex
            }*`
    );
    const portsWithBlockedSimsLines = portsWithBlockedSims.map(
        (port) =>
            `${createUnknownSimExistenceText(
                port.portIndex
            )} |To unblock this SIM, type: *${getBotDisplayName()} ${SIM_PIN_REMOVE_COMMAND} ${
                port.portIndex
            }*`
    );
    return {
        type: MessageType.NOTIFY_UNKNOWN_SIM_EXISTENCE,
        textLines: [...unknownSimsLines, ...portsWithBlockedSimsLines],
    };
};

export const createNewSmsNotificationMessage = (sim: SimInUse, smsText: string): OutgoingMessage => {
    const simId = createSimIdentityLine(sim);
    const lineInfo = createLineInfo(sim);
    return {
        type: MessageType.NOTIFY_SMS_RECEIVED,
        textLines: [`${getCountryFlag(sim.country)} *${simId}* ${lineInfo}`, smsText],
    };
};

export const createPortActivityNotificationMessage = (sim: SimInUse): OutgoingMessage => {
    const simId = createSimIdentityLine(sim);
    const lineInfo = createLineInfo(sim);
    return {
        type: MessageType.NOTIFY_PORT_ACTIVITY_DETECTED,
        textLines: [`${getCountryFlag(sim.country)} *${simId}* ${lineInfo}`],
    };
};

export const createQuestionMessage = (question: Question): OutgoingMessage => {
    if (isSelectionQuestion(question)) {
        return {
            type: MessageType.SINGLE_SELECTION_QUESTION,
            textLines: [
                question.text,
                ...(question.options ? question.options.map((option) => option['text']) : []),
            ],
        };
    } else {
        return {
            type: MessageType.FREE_TEXT_QUESTION,
            textLines: [question.text],
        };
    }
};

export const createSuccessFeedbackMessage = (text: string): OutgoingMessage => ({
    type: MessageType.SUCCESS,
    text,
});

export const createErrorMessage = (text: string): OutgoingMessage => ({
    type: MessageType.ERROR,
    text,
});
