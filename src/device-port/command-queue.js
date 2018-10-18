import logger from '../util/logger';
import Error, {COMMAND_NOT_RESPONDING} from '../util/error';

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
            const result = new Promise(resolve => {
                this.lastCommandToExecute
                    .finally(() => {
                        this.portHandler
                            .sendCommand(commandHandler)
                            .then(resolve)
                            .catch(commandResponse => {
                                resolve(commandResponse);
                                logger.error(
                                    Error(
                                        COMMAND_NOT_RESPONDING,
                                        `Command ${commandResponse.command} is not responding`
                                    )
                                );
                            });
                    })
                    .catch(({command}) => {
                        logger.error(Error(COMMAND_NOT_RESPONDING, `Command ${command} is not responding`));
                    });
            });

            this.lastCommandToExecute = result;

            return result;
        },
    };

    return commandQueue;
};

export default createCommandQueue;
