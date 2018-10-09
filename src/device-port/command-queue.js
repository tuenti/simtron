import logger from '../logger';
import Error from '../error';

const createCommandQueue = portHandler => {
    const commandQueue = {
        portId: portHandler.portId,
        portHandler,

        lastCommandToExecute: Promise.resolve(),

        addListener(listener) {
            portHandler.addListener(listener);
        },

        clearListeners() {
            portHandler.clearListeners();
        },

        sendCommand(commandHandler) {
            const result = new Promise((resolve, reject) => {
                this.lastCommandToExecute
                    .finally(() => {
                        this.portHandler
                            .sendCommand(commandHandler)
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

    return commandQueue;
};

export default createCommandQueue;
