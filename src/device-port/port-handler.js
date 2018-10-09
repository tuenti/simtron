import SerialPort from 'serialport';
import createDataChunkReader from './data-chunk';
import logger from '../logger';
import {getDevicesCommandsTimeout, getDevicesCommandsResolveDelay} from '../config';
import notifications from './model/notification';

const createOngoingCommandResolver = (commandHandler, resolve, reject, timeoutCallback) => ({
    commandHandler,
    resolve,
    reject,
    timeoutHandler: setTimeout(timeoutCallback, getDevicesCommandsTimeout()),
    timeoutCallback,
});

const createOngoingNotification = notification => ({...notification});

const parseCommandResponse = (isSuccessful, responseLines, responseParser) =>
    responseParser && isSuccessful ? responseParser(responseLines) : {};

const createCommandResponse = (isSuccessful, commandHandler, responseLines) => ({
    isSuccessful,
    responseLines,
    ...parseCommandResponse(isSuccessful, responseLines, commandHandler.responseParser),
});

const isNotificationStartLine = (line, ongoingNotification) =>
    !ongoingNotification && notifications.find(notification => line.startsWith(notification.id));

const isNotificationLine = (line, ongoingCommand, ongoingNotification) =>
    !ongoingCommand && (ongoingNotification || isNotificationStartLine(line));

const isNotificationEndLine = ongoingNotification =>
    ongoingNotification && ongoingNotification.lineCount === 1;

const isCommandExecutionStatusLine = line =>
    line === 'OK' || line === 'ERROR' || line.startsWith('+CMS ERROR');

const isSuccessfulStatusLine = line => line === 'OK';

const isOngoingCommandResponse = (ongoingCommand, responseLines) =>
    ongoingCommand && responseLines.length > 0 && responseLines[0] === ongoingCommand.commandHandler.command;

const createNotificationFromLines = (notification, notificationLines) => {
    const notificationPayload = notification.notificationParser(notificationLines);
    return {
        id: notification.id,
        ...notificationPayload,
    };
};

const triggerNotificationReceived = (portHandler, notification) => {
    portHandler.listeners.forEach(async listener => {
        await listener(portHandler, notification);
    });
};

const debugCompleteMessageReceived = (portId, lines) => {
    lines.forEach(responseLine => {
        logger.debug(`Receiving command response line '${responseLine}' on port '${portId}'`);
    });
};

const resolveCommand = (commandHandler, commandResponse) =>
    setTimeout(() => commandHandler.resolve(commandResponse), getDevicesCommandsResolveDelay());

const createPortHandler = ({portName, baudRate}) => {
    const port = new SerialPort(portName, {baudRate});

    const portHandler = {
        port,
        portId: portName,

        ongoingCommand: null,
        ongoingNotification: null,
        commandResponseLines: [],
        notificationLines: [],

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

    port.on('data', async data => {
        const decodedData = data.toString('utf8');
        dataReader.read(decodedData, line => {
            if (isNotificationLine(line, portHandler.ongoingCommand, portHandler.ongoingNotification)) {
                portHandler.notificationLines.push(line);
                if (isNotificationStartLine(line, portHandler.ongoingNotification)) {
                    portHandler.ongoingNotification = createOngoingNotification(
                        notifications.find(n => line.startsWith(n.id))
                    );
                }
                if (isNotificationEndLine(portHandler.ongoingNotification)) {
                    const notification = createNotificationFromLines(
                        portHandler.ongoingNotification,
                        portHandler.notificationLines
                    );
                    debugCompleteMessageReceived(portHandler.portId, portHandler.notificationLines);
                    triggerNotificationReceived(portHandler, notification);
                    portHandler.ongoingNotification = null;
                    portHandler.notificationLines = [];
                } else {
                    portHandler.ongoingNotification.lineCount--;
                }
            } else {
                if (isCommandExecutionStatusLine(line, portHandler.ongoingCommand)) {
                    portHandler.commandResponseLines.push(line);
                    const commandResponse = createCommandResponse(
                        isSuccessfulStatusLine(line),
                        portHandler.ongoingCommand.commandHandler,
                        portHandler.commandResponseLines
                    );
                    debugCompleteMessageReceived(portHandler.portId, portHandler.commandResponseLines);
                    resolveCommand(portHandler.ongoingCommand, commandResponse);
                    portHandler.ongoingCommand = null;
                    portHandler.commandResponseLines = [];
                } else {
                    portHandler.commandResponseLines.push(line);
                }
            }
        });
    });
    return portHandler;
};

export default createPortHandler;
