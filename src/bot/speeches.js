import {REQUEST_CATALOG} from "./model/message-type";
import {createCatalogAnswerMessage, createSimStatusAnswerMessage} from "./model/message";
import {getBotMessageSequenceEnsuringTime} from "../config";

const speeches = [
    {
        messageType: REQUEST_CATALOG,
        messageIdentifier: () => true,
        action: (bot, message, store) => {
            bot.sendMessage(createCatalogAnswerMessage(), message);
            setTimeout(
                () => bot.sendMessage(createSimStatusAnswerMessage(store.sim.getAllSimsInUse()), message),
                getBotMessageSequenceEnsuringTime()
            );
        }
    }
];

const getMessageSpeech = message =>
    speeches.find(speech => speech.messageIdentifier(message));

export default getMessageSpeech;