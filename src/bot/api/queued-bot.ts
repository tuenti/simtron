import {ApiBot} from '.';
import {Sim} from '../../graphql/types';

let lastRequest: Promise<Sim[]> = Promise.resolve([]);

const createQueuedBot = (bot: ApiBot): ApiBot => {
    const queuedBot = {
        getSims: () => {
            const result = new Promise<Sim[]>(resolve => {
                lastRequest.finally(() => {
                    bot.getSims().then(resolve);
                });
            });
            lastRequest = result;
            return result;
        },

        addListener: bot.addListener,
        clearListeners: bot.clearListeners,
        start: bot.start,
    };

    return queuedBot;
};

export default createQueuedBot;
