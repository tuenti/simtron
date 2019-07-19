import {createRequestCatalogSpeech} from './request-catalog';
import {createStartSimDataEditSpeech} from './sim-data-edit';
import {createStartForceSimOperatorSpeech} from './force-sim-operator';
import {createStartSimIdentificationSpeech} from './sim-identification';
import {createRequestSimDetailsSpeech} from './request-sim-details';
import {createStopQuestionarySpeech, createFillQuestionSpeech} from './questionary';
import {createHideSimSpeech, createShowSimSpeech} from './sim-visibility';
import {Store} from '../../store';
import {IncomingMessage, OutgoingMessage} from '../model/message';
import {MessageType} from '../model/message-type';
import {Command} from '../../device-port/model/command';
import {
    createEnablePortActivityNotifications,
    createDisablePortActivityNotifications,
} from './port-activity-notifications';
import {createStartPortIdentificationSpeech} from './port-identification';

export type AnswerMessageCallback = (message: OutgoingMessage, receivedMessage: IncomingMessage) => void;

export type SendCommandCallback = (command: Command, portId: string) => Promise<{[key: string]: any}>;

export interface Speech {
    messageType: MessageType;
    messageIdentifier: (receivedMessage: IncomingMessage, store: Store) => boolean;
    action: (
        receivedMessage: IncomingMessage,
        store: Store,
        answerMessage: AnswerMessageCallback,
        sendCommand: SendCommandCallback
    ) => void;
}

const speeches: Speech[] = [
    createStopQuestionarySpeech(),
    createFillQuestionSpeech(),
    createStartSimIdentificationSpeech(),
    createStartForceSimOperatorSpeech(),
    createStartSimDataEditSpeech(),
    createHideSimSpeech(),
    createShowSimSpeech(),
    createRequestSimDetailsSpeech(),
    createEnablePortActivityNotifications(),
    createDisablePortActivityNotifications(),
    createStartPortIdentificationSpeech(),
    createRequestCatalogSpeech(),
];

const getMessageSpeech = (message: IncomingMessage, store: Store) =>
    speeches.find(speech => speech.messageIdentifier(message, store));

export default getMessageSpeech;
