import {createRequestCatalogSpeech} from './request-catalog';
import {createStartSimDataEditSpeech} from './sim-data-edit';
import {createStartSimIdentificationSpeech} from './sim-identification';
import {createRequestSimDetails} from './request-sim-details';
import {createStopQuestionarySpeech, createFillQuestionSpeech} from './questionary';

const speeches = [
    createStopQuestionarySpeech(),
    createFillQuestionSpeech(),
    createStartSimIdentificationSpeech(),
    createStartSimDataEditSpeech(),
    createRequestSimDetails(),
    createRequestCatalogSpeech(),
];

const getMessageSpeech = (receivedMessage, store) =>
    speeches.find(speech => speech.messageIdentifier(receivedMessage, store));

export default getMessageSpeech;
