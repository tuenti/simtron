import SerialPort from 'serialport';
import serialPortBindings from '@serialport/bindings';
import readDataChunk from './data-chunk';
import Error, {NON_RESPONSIVE_PORTS, SOME_NON_RESPONSIVE_PORTS} from '../error';
import logger from '../logger';
import {getVendorIds, getPortScanMaxRetriesCount} from '../config';
import createPortHandler from './port-handler';

const MANUFACTURER_AT_COMMAND = 'AT+CGMI';
const portBaudRates = [9600, 115200, 14400, 19200, 38400, 57600, 128000, 256000];
const NO_RESPONSE_REASON = 'no-response';
const NO_TRIED_REASON = 'no-tried';
const MODEM_RESPONSE_TIMEOUT_MS = 1000;
const PORT_SCAN_TIMEOUT_MS = 1000;

const isElegiblePort = (portData, allowedVendorIds) => {
    return (
        portData &&
        portData.manufacturer &&
        allowedVendorIds.find(vendorId => portData.manufacturer.indexOf(vendorId) > -1)
    );
};

const isOpenPort = ({port, portName, baudRate}) => port && portName && baudRate;

const openPort = (port, portName, baudRate) => ({
    port,
    portName,
    baudRate,
});

const closedPort = (portName, reason) => ({
    portName,
    reason,
});

const portArrayToString = ports =>
    ports.length
        ? ports.reduce((acc, port) => {
              return `${acc}, ${port.portName}`;
          }, '')
        : 'No ports';

const testPort = (portName, baudRate) =>
    new Promise((resolve, reject) => {
        const port = new SerialPort(portName, {baudRate});
        const timeoutHandler = setTimeout(() => {
            port.close();
            resolve(closedPort(portName, NO_RESPONSE_REASON));
        }, MODEM_RESPONSE_TIMEOUT_MS);
        port.on('data', data => {
            const decodedData = data.toString('utf8');
            readDataChunk(decodedData, line => {
                if (line === MANUFACTURER_AT_COMMAND) {
                    clearTimeout(timeoutHandler);
                    resolve(openPort(port, portName, baudRate));
                }
            });
        });
        port.write(`${MANUFACTURER_AT_COMMAND}\r`);
    });

const connectToPort = async portName => {
    for (let baudRate of portBaudRates) {
        try {
            const testPortResult = await testPort(portName, baudRate);
            if (isOpenPort(testPortResult)) {
                return testPortResult;
            }
        } catch (e) {}
    }
    return closedPort(portName, NO_RESPONSE_REASON);
};

const connectToPorts = async ports => Promise.all(ports.map(port => connectToPort(port.portName)));

const scanPorts = () =>
    new Promise((resolve, reject) => {
        const timeoutHandler = setTimeout(() => {
            reject();
        }, PORT_SCAN_TIMEOUT_MS);
        serialPortBindings.list().then(serialPorts => {
            const allowedVendorIds = getVendorIds();
            const elegibleSimtronPorts = serialPorts
                .filter(portData => isElegiblePort(portData, allowedVendorIds))
                .map(({comName}) => closedPort(comName, NO_TRIED_REASON));
            clearTimeout(timeoutHandler);
            resolve(elegibleSimtronPorts);
        });
    });

export default {
    createPorts: async () => {
        let connectedPorts = [];
        const elegibleSimtronPorts = await scanPorts();

        if (elegibleSimtronPorts.length > 0) {
            let closedPorts = elegibleSimtronPorts;

            const maxRetriesCount = getPortScanMaxRetriesCount();
            for (let retry = 1; retry <= maxRetriesCount; retry++) {
                const portsConnectionResults = await connectToPorts(closedPorts);
                const newConnectedPorts = portsConnectionResults.filter(portConnectionResult =>
                    isOpenPort(portConnectionResult)
                );
                closedPorts = portsConnectionResults.filter(
                    portConnectionResult => !isOpenPort(portConnectionResult)
                );
                connectedPorts = [...connectedPorts, ...newConnectedPorts];
                logger.info(`Iteration ${retry}, new online ports: ${portArrayToString(newConnectedPorts)}`);
                if (closedPorts.length === 0) {
                    logger.info('Ports scan completed, all ports online.');
                    break;
                }
            }
            if (closedPorts.length > 0) {
                logger.warning(`There are some 'not responding' ports: ${portArrayToString(closedPorts)}`);
            }
        }

        if (connectedPorts.length === 0) {
            logger.error(Error(NON_RESPONSIVE_PORTS, 'Can not connect to any port'));
        }

        return connectedPorts.map(portData => {
            return createPortHandler(portData);
        });
    },
};
