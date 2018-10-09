import logger from '../logger';
import Error from '../error';

const createMessageQueue = portHandler => {
    const messageQueue = {
        portId: portHandler.portId,
        portHandler,

        lastCommandToExecute: Promise.resolve(),

        addListener(listener) {
            portHandler.addListener(listener);
        },
        clearListeners() {
            portHandler.clearListeners();
        },

        sendCommand(commandHandler, options = {}) {
            const result = new Promise((resolve, reject) => {
                this.lastCommandToExecute
                    .finally(() => {
                        this.portHandler
                            .sendCommand(commandHandler, options)
                            .then(resolve)
                            .catch(reject);
                    })
                    .catch(e => {
                        logger.error(Error(...e));
                    });
            });

            this.lastCommandToExecute = result;

            return result;
        },
    };

    return messageQueue;
};

export default createMessageQueue;
