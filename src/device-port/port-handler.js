import createDataChunkReader from './data-chunk';
import logger from '../logger';
import {getDevicesCommandsTimeout} from '../config';
import notifications from './model/notification';
import {createReadVendorCommand} from './model/command';

const notificationEndCommand = createReadVendorCommand();

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

const isNotificationStartLine = (line, ongoingCommand) => !ongoingCommand && notifications.find(notification => line.startsWith(notification.id));

const isNotificationEndLine = (line, ongoingNotification) =>
    line === notificationEndCommand.command && ongoingNotification !== null;

const isCommandExecutionStatusLine = line =>
    line === 'OK' || line === 'ERROR' || line.startsWith('+CMS ERROR');

const isSuccessfulStatusLine = line => line === 'OK';

const isOngoingCommandResponse = (ongoingCommand, responseLines) =>
    ongoingCommand && responseLines.length > 0 && responseLines[0] === ongoingCommand.commandHandler.command;

const createNotificationFromLines = (notification, notificationLines) => {
    notificationLines.pop();
    return notification.notificationParser(notificationLines);
};

const triggerNotificationReceived = (portHandler, notification) => {
    portHandler.listeners.forEach(listener => {
        listener(portHandler, notification);
    });
};

const debugCompleteMessageReceived = (portId, lines) => {
    lines.forEach(responseLine => {
        logger.debug(`Receiving command response line '${responseLine}' on port '${portId}'`);
    });
};

const createPortHandler = ({port, portName, baudRate}) => {
    const portHandler = {
        port,
        portId: portName,
        baudRate,

        ongoingCommand: null,
        ongoingNotification: null,
        responseLines: [],

        listeners: [],

        addListener(listener) {
            this.listeners.push(listener);
        },
        clearListeners() {
            this.listeners = [];
        },

        async sendCommand(commandHandler, options = {}) {
            const {waitForResponse = true} = options;
            return new Promise((resolve, reject) => {
                port.write(`${commandHandler.command}\r`);
                if (waitForResponse) {
                    const handleCommandTimedOut = () => {
                        reject(commandHandler.command);
                        this.ongoingCommand = null;
                    };
                    this.ongoingCommand = createOngoingCommandResolver(
                        commandHandler,
                        resolve,
                        reject,
                        handleCommandTimedOut
                    );
                } else {
                    resolve();
                }
                logger.debug(`Sending command '${commandHandler.command}' on port '${this.portId}'`);
            });
        },
    };

    const dataReader = createDataChunkReader();

    port.on('data', data => {
        const decodedData = data.toString('utf8');
        dataReader.read(decodedData, line => {
            portHandler.responseLines.push(line);

            if (isNotificationStartLine(line, portHandler.ongoingCommand)) {
                portHandler.ongoingNotification = notifications.find(n => line.startsWith(n.id));
                portHandler.sendCommand(notificationEndCommand, {waitForResponse: false});
            } else if (isNotificationEndLine(line, portHandler.ongoingNotification)) {
                const notification = createNotificationFromLines(
                    portHandler.ongoingNotification,
                    portHandler.responseLines
                );
                triggerNotificationReceived(portHandler, notification);
                debugCompleteMessageReceived(portHandler.portId, portHandler.responseLines);
            } else if (isCommandExecutionStatusLine(line)) {
                if (portHandler.ongoingNotification) {
                    portHandler.ongoingNotification = null;
                } else {
                    if (isOngoingCommandResponse(portHandler.ongoingCommand, portHandler.responseLines)) {
                        const commandResponse = createCommandResponse(
                            isSuccessfulStatusLine(line),
                            portHandler.ongoingCommand.commandHandler,
                            portHandler.responseLines
                        );
                        portHandler.ongoingCommand.resolve(commandResponse);
                        debugCompleteMessageReceived(portHandler.portId, portHandler.responseLines);
                    }
                }
                portHandler.responseLines = [];
            }
        });
    });
    return portHandler;
};

export default createPortHandler;
