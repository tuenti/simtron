import readDataChunk from './data-chunk';
import logger from '../logger';

const COMMAND_TIMEOUT_MS = 3000;

const createOngoingCommandResolver = (resolve, reject, timeoutHandler) => ({
    resolve,
    reject,
    timeoutHandler,
});

const createSuccessfulCommandResponse = responseLines => ({
    isSuccessful: true,
    responseLines,
});

const createPortHandler = ({port, portName, baudRate}) => {
    const portHandler = {
        port,
        portId: portName,
        baudRate,

        ongoingCommands: [],
        commandResponseLines: [],

        listeners: [],

        addListener(listener) {
            this.listeners.push(listener);
        },
        clearListeners() {
            this.listeners = [];
        },

        async sendCommand(command) {
            return new Promise((resolve, reject) => {
                port.write(`${command}\r`);
                const handleCommandTimedOut = () => {
                    reject();
                    this.ongoingCommands.pop();
                };
                const timeoutHandler = setTimeout(handleCommandTimedOut, COMMAND_TIMEOUT_MS);
                this.ongoingCommands.push(createOngoingCommandResolver(resolve, reject, timeoutHandler));
                logger.info(`Sending command '${command}' to port '${this.portId}'`);
            });
        },
    };
    port.on('data', data => {
        const decodedData = data.toString('utf8');
        readDataChunk(decodedData, line => {
            portHandler.commandResponseLines.push(line);
            if (line === 'OK') {
                portHandler.listeners.forEach(listener => {
                    listener(portHandler, portHandler.commandResponseLines);
                });
                const ongoingCommand = portHandler.ongoingCommands.pop();
                if (ongoingCommand) {
                    portHandler.commandResponseLines.forEach(responseLine => {
                        logger.info(
                            `Receiving command response line '${responseLine}' to port '${
                                portHandler.portId
                            }'`
                        );
                    });
                    ongoingCommand.resolve(createSuccessfulCommandResponse(portHandler.commandResponseLines));
                }
                portHandler.commandResponseLines = [];
            }
        });
    });
    return portHandler;
};

export default createPortHandler;
