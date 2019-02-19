import {createRequestCatalogSpeech} from './request-catalog';
import {createStartSimDataEditSpeech} from './sim-data-edit';
import {createStartForceSimOperatorSpeech} from './force-sim-operator';
import {createStartSimIdentificationSpeech} from './sim-identification';
import {createRequestSimDetails} from './request-sim-details';
import {createStopQuestionarySpeech, createFillQuestionSpeech} from './questionary';
import {Store} from '../../store';
import {IncomingMessage} from '../model/message';

const speeches = [
    createStopQuestionarySpeech(),
    createFillQuestionSpeech(),
    createStartSimIdentificationSpeech(),
    createStartForceSimOperatorSpeech(),
    createStartSimDataEditSpeech(),
    createRequestSimDetails(),
    createRequestCatalogSpeech(),
];

const getMessageSpeech = (message: IncomingMessage, store: Store) =>
    speeches.find(speech => speech.messageIdentifier(message, store));

export default getMessageSpeech;
