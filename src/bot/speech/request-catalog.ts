import {MessageType} from '../model/message-type';
import {existSomeWordInText} from '../../util/text';
import {getBotNames, getBotMessageSequenceEnsuringTime} from '../../config';
import {
    createCatalogAnswerMessage,
    createCatalogAnswerContentMessage,
    createUnknownSimsExistenceNotificationMessage,
    IncomingMessage,
} from '../model/message';
import delayed from '../../util/delay';
import {Store} from '../../store';
import {AnswerMessageCallback} from '.';

export const createRequestCatalogSpeech = () => ({
    messageType: MessageType.REQUEST_CATALOG,
    messageIdentifier: (receivedMessage: IncomingMessage) =>
        existSomeWordInText(getBotNames(), receivedMessage.messageText),
    action: (receivedMessage: IncomingMessage, store: Store, answerMessage: AnswerMessageCallback) => {
        answerMessage(createCatalogAnswerMessage(), receivedMessage);
        const allSimData = store.sim.getSimCatalog();
        const allInUseSims = store.sim
            .getAllSimsInUse(receivedMessage.isFromAdmin)
            .filter(sim => !!sim.msisdn)
            .map(simInUse => {
                const foundSimData = allSimData.find(simData => simInUse.icc === simData.icc);
                return {
                    sim: simInUse,
                    isVisible: !foundSimData || (foundSimData && foundSimData.isVisible),
                };
            });
        delayed(
            () => answerMessage(createCatalogAnswerContentMessage(allInUseSims), receivedMessage),
            getBotMessageSequenceEnsuringTime()
        ).then(() =>
            delayed(() => {
                const allUnknownSims = store.sim.getAllUnknownSimsInUse();
                const allPortsWithBlockedSims = store.sim.getAllPortsWithBlockedSims();
                if (
                    receivedMessage.isFromAdmin &&
                    (allUnknownSims.length > 0 || allPortsWithBlockedSims.length > 0)
                ) {
                    answerMessage(
                        createUnknownSimsExistenceNotificationMessage(
                            allUnknownSims,
                            allPortsWithBlockedSims
                        ),
                        receivedMessage
                    );
                }
            }, getBotMessageSequenceEnsuringTime())
        );
    },
});
