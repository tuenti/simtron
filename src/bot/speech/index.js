import {createRequestCatalogSpeech} from './request-catalog';
import {createStartSimDataEditSpeech} from './sim-data-edit';
import {createStartSimIdentificationSpeech} from './sim-identification';
import {createStopQuestionarySpeech, createFillQuestionSpeech} from './questionary';

const speeches = [
    createStopQuestionarySpeech(),
    createFillQuestionSpeech(),
    createStartSimIdentificationSpeech(),
    createStartSimDataEditSpeech(),
    createRequestCatalogSpeech(),
];

const getMessageSpeech = (receivedMessage, store) =>
    speeches.find(speech => speech.messageIdentifier(receivedMessage, store));

export default getMessageSpeech;
