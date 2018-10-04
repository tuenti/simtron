import createDataChunkReader from './data-chunk';
import logger from '../logger';
import {getDevicesCommandsTimeout} from '../config';

const createOngoingCommandResolver = (commandHandler, resolve, reject, timeoutCallback) => ({
    commandHandler,
    resolve,
    reject,
    timeoutHandler: setTimeout(timeoutCallback, getDevicesCommandsTimeout()),
    timeoutCallback,
});

const parseCommandResponse = (isSuccessful, responseLines, responseParser) =>
    responseParser && isSuccessful ? responseParser(responseLines) : {};

const createCommandResponse = (isSuccessful, commandHandler, responseLines) => ({
    isSuccessful,
    responseLines,
    ...parseCommandResponse(isSuccessful, responseLines, commandHandler.responseParser),
});

const isExecutionStatusLine = line => line === 'OK' || line === 'ERROR';

const isSuccessfulStatusLine = line => line === 'OK';

const isOngoingCommandResponse = (ongoingCommand, responseLines) =>
    ongoingCommand && responseLines.length > 0 && responseLines[0] === ongoingCommand.commandHandler.command;

const hasPendingCommand = portHandler => !!portHandler.ongoingCommand;

const resetOngoingCommandTimeoutHandler = ongoingCommand => {
    clearTimeout(ongoingCommand.timeoutHandler);
    return createOngoingCommandResolver(
        ongoingCommand.commandHandler,
        ongoingCommand.resolve,
        ongoingCommand.reject,
        ongoingCommand.timeoutCallback
    );
};

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

        async sendCommand(commandHandler) {
            return new Promise((resolve, reject) => {
                port.write(`${commandHandler.command}\r`);
                const handleCommandTimedOut = () => {
                    reject();
                    this.ongoingCommand = null;
                };
                this.ongoingCommand = createOngoingCommandResolver(
                    commandHandler,
                    resolve,
                    reject,
                    handleCommandTimedOut
                );
                logger.info(`Sending command '${commandHandler.command}' to port '${this.portId}'`);
            });
        },
    };

    const dataReader = createDataChunkReader();

    port.on('data', data => {
        const decodedData = data.toString('utf8');
        dataReader.read(decodedData, line => {
            portHandler.commandResponseLines.push(line);

            if (isExecutionStatusLine(line)) {
                logCompleteMessageReceived(portHandler.portId, portHandler.commandResponseLines);

                if (isOngoingCommandResponse(portHandler.ongoingCommand, portHandler.commandResponseLines)) {
                    const commandResponse = createCommandResponse(
                        isSuccessfulStatusLine(line),
                        portHandler.ongoingCommand.commandHandler,
                        portHandler.commandResponseLines
                    );
                    portHandler.ongoingCommand.resolve(commandResponse);
                } else {
                    if (hasPendingCommand(portHandler)) {
                        portHandler.ongoingCommand = resetOngoingCommandTimeoutHandler(
                            portHandler.ongoingCommand
                        );
                    }
                    triggerNotificationReceived(portHandler);
                }

                portHandler.commandResponseLines = [];
            }
        });
    });
    return portHandler;
};

export default createPortHandler;
