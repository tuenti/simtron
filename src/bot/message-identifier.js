import {REQUEST_CATALOG} from "./model/message-type";

const speeches = [
    {
        messageType: REQUEST_CATALOG,
        messageIdentifier: () => true,
    }
];

const identifyMessage = messageData =>
    speeches.find(speech => speech.messageIdentifier(messageData)).messageType;

export default identifyMessage;