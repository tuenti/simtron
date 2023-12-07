import SerialPort from 'serialport';
import { autoDetect } from '@serialport/bindings-cpp'
import createDataChunkReader from './data-chunk';
import Error, {NON_RESPONSIVE_PORTS} from '../util/error';
import logger from '../util/logger';
import {getVendorIds, getPortScanMaxRetriesCount} from '../config';
import createPortHandler from './port-handler';
import createMessageQueue from './command-queue';

const serialPortBindings = autoDetect();

const MODEM_DETECTION_COMMAND = 'AT';
const MODEM_DETECTION_RESPONSE = 'AT';

const portBaudRates = [9600, 115200, 14400, 19200, 38400, 57600, 128000, 256000];
const NO_RESPONSE_REASON = 'no-response';
const NO_TRIED_REASON = 'no-tried';
const MODEM_RESPONSE_TIMEOUT_MS = 1000;
const PORT_SCAN_TIMEOUT_MS = 1000;

let currentPortIndex = 1;
const getNextPortIndex = () => currentPortIndex++;

const isEligiblePort = (portData, allowedVendorIds) => {
    return (
        portData &&
        portData.manufacturer &&
        allowedVendorIds.find(vendorId => portData.manufacturer.indexOf(vendorId) > -1)
    );
};

const isOpenPort = ({portName, baudRate}) => portName && baudRate;

const createOpenPort = (portName, baudRate) => ({
    portName,
    baudRate,
});

const createClosedPort = (portName, dataReader, reason) => ({
    portName,
    dataReader,
    reason,
});

const portArrayToString = ports =>
    ports.length
        ? ports.reduce((acc, port) => {
              return `${acc}, ${port.portName}`;
          }, '')
        : 'No ports';

const testPort = (portName, baudRate, dataReader) =>
    new Promise(resolve => {
        const port = new SerialPort(portName, {baudRate});
        const timeoutHandler = setTimeout(() => {
            port.close();
            dataReader.clear();
            resolve(createClosedPort(portName, dataReader, NO_RESPONSE_REASON));
        }, MODEM_RESPONSE_TIMEOUT_MS);
        port.on('data', data => {
            const decodedData = data.toString('utf8');
            dataReader.read(decodedData, line => {
                if (line === MODEM_DETECTION_RESPONSE) {
                    clearTimeout(timeoutHandler);
                    port.removeAllListeners();
                    port.close();
                    resolve(createOpenPort(portName, baudRate));
                }
            });
        });
        port.write(`${MODEM_DETECTION_COMMAND}\r`);
    });

const connectToPort = async (portName, dataReader) => {
    for (let baudRate of portBaudRates) {
        try {
            const testPortResult = await testPort(portName, baudRate, dataReader);
            if (isOpenPort(testPortResult)) {
                return testPortResult;
            }
        } catch (e) {}
    }
    return createClosedPort(portName, dataReader, NO_RESPONSE_REASON);
};

const connectToPorts = async ports =>
    Promise.all(ports.map(port => connectToPort(port.portName, port.dataReader)));

const scanPorts = () =>
    new Promise((resolve, reject) => {
        const timeoutHandler = setTimeout(() => {
            reject();
        }, PORT_SCAN_TIMEOUT_MS);
        serialPortBindings.list().then(serialPorts => {
            const allowedVendorIds = getVendorIds();
            const eligibleSimtronPorts = serialPorts
                .filter(portData => isEligiblePort(portData, allowedVendorIds))
                .map(({comName}) => createClosedPort(comName, undefined, NO_TRIED_REASON));
            clearTimeout(timeoutHandler);
            resolve(eligibleSimtronPorts);
        });
    });

export default {
    createPorts: async () => {
        let connectedPorts = [];
        const eligibleSimtronPorts = await scanPorts();

        if (eligibleSimtronPorts.length > 0) {
            let closedPorts = eligibleSimtronPorts.map(eligibleSimtronPort => ({
                ...eligibleSimtronPort,
                dataReader: createDataChunkReader(),
            }));

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
                logger.debug(`Iteration ${retry}, new online ports: ${portArrayToString(newConnectedPorts)}`);
                if (closedPorts.length === 0) {
                    logger.debug('Ports scan completed, all ports online.');
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
            logger.debug(
                `Creating instance of port with id: '${portData.portName}' and baud rate: ${
                    portData.baudRate
                }`
            );
            const portHandler = createPortHandler(portData, getNextPortIndex());
            return createMessageQueue(portHandler);
        });
    },
};
