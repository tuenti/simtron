"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _serialport = _interopRequireDefault(require("serialport"));

var _bindings = _interopRequireDefault(require("@serialport/bindings"));

var _dataChunk = _interopRequireDefault(require("./data-chunk"));

var _error = _interopRequireWildcard(require("../util/error"));

var _logger = _interopRequireDefault(require("../util/logger"));

var _config = require("../config");

var _portHandler = _interopRequireDefault(require("./port-handler"));

var _commandQueue = _interopRequireDefault(require("./command-queue"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const MODEM_DETECTION_COMMAND = 'AT';
const MODEM_DETECTION_RESPONSE = 'AT';
const portBaudRates = [9600, 115200, 14400, 19200, 38400, 57600, 128000, 256000];
const NO_RESPONSE_REASON = 'no-response';
const NO_TRIED_REASON = 'no-tried';
const MODEM_RESPONSE_TIMEOUT_MS = 1000;
const PORT_SCAN_TIMEOUT_MS = 1000;

const isEligiblePort = (portData, allowedVendorIds) => {
  return portData && portData.manufacturer && allowedVendorIds.find(vendorId => portData.manufacturer.indexOf(vendorId) > -1);
};

const isOpenPort = ({
  portName,
  baudRate
}) => portName && baudRate;

const createOpenPort = (portName, baudRate) => ({
  portName,
  baudRate
});

const createClosedPort = (portName, dataReader, reason) => ({
  portName,
  dataReader,
  reason
});

const portArrayToString = ports => ports.length ? ports.reduce((acc, port) => {
  return `${acc}, ${port.portName}`;
}, '') : 'No ports';

const testPort = (portName, baudRate, dataReader) => new Promise(resolve => {
  const port = new _serialport.default(portName, {
    baudRate
  });
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

const connectToPorts = async ports => Promise.all(ports.map(port => connectToPort(port.portName, port.dataReader)));

const scanPorts = () => new Promise((resolve, reject) => {
  const timeoutHandler = setTimeout(() => {
    reject();
  }, PORT_SCAN_TIMEOUT_MS);

  _bindings.default.list().then(serialPorts => {
    const allowedVendorIds = (0, _config.getVendorIds)();
    const eligibleSimtronPorts = serialPorts.filter(portData => isEligiblePort(portData, allowedVendorIds)).map(({
      comName
    }) => createClosedPort(comName, undefined, NO_TRIED_REASON));
    clearTimeout(timeoutHandler);
    resolve(eligibleSimtronPorts);
  });
});

var _default = {
  createPorts: async () => {
    let connectedPorts = [];
    const eligibleSimtronPorts = await scanPorts();

    if (eligibleSimtronPorts.length > 0) {
      let closedPorts = eligibleSimtronPorts.map(eligibleSimtronPort => ({ ...eligibleSimtronPort,
        dataReader: (0, _dataChunk.default)()
      }));
      const maxRetriesCount = (0, _config.getPortScanMaxRetriesCount)();

      for (let retry = 1; retry <= maxRetriesCount; retry++) {
        const portsConnectionResults = await connectToPorts(closedPorts);
        const newConnectedPorts = portsConnectionResults.filter(portConnectionResult => isOpenPort(portConnectionResult));
        closedPorts = portsConnectionResults.filter(portConnectionResult => !isOpenPort(portConnectionResult));
        connectedPorts = [...connectedPorts, ...newConnectedPorts];

        _logger.default.debug(`Iteration ${retry}, new online ports: ${portArrayToString(newConnectedPorts)}`);

        if (closedPorts.length === 0) {
          _logger.default.debug('Ports scan completed, all ports online.');

          break;
        }
      }

      if (closedPorts.length > 0) {
        _logger.default.warning(`There are some 'not responding' ports: ${portArrayToString(closedPorts)}`);
      }
    }

    if (connectedPorts.length === 0) {
      _logger.default.error((0, _error.default)(_error.NON_RESPONSIVE_PORTS, 'Can not connect to any port'));
    }

    return connectedPorts.map(portData => {
      _logger.default.debug(`Creating instance of port with id: '${portData.portName}' and baud rate: ${portData.baudRate}`);

      const portHandler = (0, _portHandler.default)(portData);
      return (0, _commandQueue.default)(portHandler);
    });
  }
};
exports.default = _default;