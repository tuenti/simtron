import {createRequestCatalogSpeech} from './request-catalog';
import {createStartSimDataEditSpeech} from './sim-data-edit';
import {createStartSimIdentificationSpeech} from './sim-identification';
import {createRequestSimDetails} from './request-sim-details';
import {createStopQuestionarySpeech, createFillQuestionSpeech} from './questionary';
import {createForceSimOperatorSpeech} from './force-sim-operator';
import {Store} from '../../store';
import {IncomingMessage} from '../model/message';

const speeches = [
    createStopQuestionarySpeech(),
    createFillQuestionSpeech(),
    createStartSimIdentificationSpeech(),
    createStartSimDataEditSpeech(),
    createForceSimOperatorSpeech(),
    createRequestSimDetails(),
    createRequestCatalogSpeech(),
];

const getMessageSpeech = (message: IncomingMessage, store: Store) =>
    speeches.find(speech => speech.messageIdentifier(message, store));

export default getMessageSpeech;
