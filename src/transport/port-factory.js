import childProcess from 'child_process';
import SerialPort from 'serialport';
import readDataChunk from './data-chunk';

const MANUFACTURER_AT_COMMAND = 'AT+CGMI';
const portBaudRates = [9600, 115200, 14400, 19200, 38400, 57600, 128000, 256000];
const NO_RESPONSE_REASON = 'no-response';
const MODEM_RESPONSE_TIMEOUT_MS = 3000;
const PORT_DISCOVERY_TIMEOUT_MS = 30000;

const selectPort = portData =>
    portData && portData.manufacturer && portData.manufacturer.indexOf('FTDI') > -1;

const isValidPort = ({port, portName, baudRate}) => port && portName && baudRate;

const testPort = (portName, baudRate) =>
    new Promise((resolve, reject) => {
        const port = new SerialPort(portName, {baudRate});
        port.on('data', data => {
            const decodedData = data.toString('utf8');
            readDataChunk(decodedData, line => {
                if (line === MANUFACTURER_AT_COMMAND) {
                    resolve({port, portName, baudRate});
                }
            });
        });
        port.write(`${MANUFACTURER_AT_COMMAND}\r\n`);
        setTimeout(() => {
            port.close();
            resolve({reason: NO_RESPONSE_REASON});
        }, MODEM_RESPONSE_TIMEOUT_MS);
    });

const connectToPort = async portName => {
    for (let baudRate of portBaudRates) {
        try {
            const testPortResult = await testPort(portName, baudRate);
            if (isValidPort(testPortResult)) {
                return await testPortResult;
            }
        } catch (e) {}
    }
    return false;
};

const createSimtronPorts = () =>
    new Promise((resolve, reject) => {
        childProcess.exec('./node_modules/serialport/bin/list.js -f json', (error, stdout) => {
            const elegibleSimtronPorts = JSON.parse(stdout).filter(selectPort);
            Promise.all(
                elegibleSimtronPorts.map(elegibleSimtronPort => connectToPort(elegibleSimtronPort.comName))
            ).then(connectionResults => {
                resolve(connectionResults);
            });
            setTimeout(() => {
                reject();
            }, PORT_DISCOVERY_TIMEOUT_MS);
        });
    });

export default createSimtronPorts;
