import readDataChunk from './data-chunk';
import logger from '../logger';
import {getDevicesCommandsTimeout} from '../config';

const createOngoingCommandResolver = (command, resolve, reject, timeoutHandler) => ({
    command,
    resolve,
    reject,
    timeoutHandler,
});

const createCommandResponse = (isSuccessful, responseLines) => ({
    isSuccessful,
    responseLines,
});

const isExecutionStatusLine = line => line === 'OK' || line === 'ERROR';

const isSuccessfulStatusLine = line => line === 'OK';

const isOngoingCommandResponse = (ongoingCommand, responseLines) =>
    ongoingCommand && responseLines.length > 0 && responseLines[0] === ongoingCommand.command;

const logCompleteMessageReceived = (portId, lines) => {
    lines.forEach(responseLine => {
        logger.info(`Receiving command response line '${responseLine}' to port '${portId}'`);
    });
};

const triggerNotificationReceived = portHandler => {
    portHandler.listeners.forEach(listener => {
        listener(portHandler, portHandler.commandResponseLines);
    });
};

const createPortHandler = ({port, portName, baudRate}) => {
    const portHandler = {
        port,
        portId: portName,
        baudRate,

        ongoingCommand: null,
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
                    this.ongoingCommand = null;
                };
                const timeoutHandler = setTimeout(handleCommandTimedOut, getDevicesCommandsTimeout());
                this.ongoingCommand = createOngoingCommandResolver(command, resolve, reject, timeoutHandler);
                logger.info(`Sending command '${command}' to port '${this.portId}'`);
            });
        },
    };
    port.on('data', data => {
        const decodedData = data.toString('utf8');
        readDataChunk(decodedData, line => {
            portHandler.commandResponseLines.push(line);

            if (isExecutionStatusLine(line)) {
                logCompleteMessageReceived(portHandler.portId, portHandler.commandResponseLines);

                if (isOngoingCommandResponse(portHandler.ongoingCommand, portHandler.commandResponseLines)) {
                    const commandResponse = createCommandResponse(
                        isSuccessfulStatusLine(line),
                        portHandler.commandResponseLines
                    );
                    portHandler.ongoingCommand.resolve(commandResponse);
                } else {
                    triggerNotificationReceived(portHandler);
                }

                portHandler.commandResponseLines = [];
            }
        });
    });
    return portHandler;
};

export default createPortHandler;
