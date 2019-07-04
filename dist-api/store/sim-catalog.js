"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _nodeJsonDb = _interopRequireDefault(require("node-json-db"));

var _logger = _interopRequireDefault(require("../util/logger"));

var _error = _interopRequireWildcard(require("../util/error"));

var _text = require("../util/text");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';
const catalogDb = new _nodeJsonDb.default(DB_FILE, true, true);

const createSimData = (icc, msisdn, displayNumber, brand, country, lineType, isVisible) => ({
  msisdn,
  displayNumber,
  icc,
  brand,
  country,
  lineType,
  isVisible
});

const createSimInUse = (icc, networkStatus, smsMode, portId) => ({
  icc,
  networkStatus,
  smsMode,
  portId
});

const readSimCatalog = () => {
  try {
    return catalogDb.getData(SIM_CATALOG_PATH);
  } catch (e) {
    if (e.name === 'DataError') {
      catalogDb.push(SIM_CATALOG_PATH, []);
    }

    return [];
  }
};

const findSimByIcc = (icc, simList) => simList.find(sim => sim.icc === icc) || null;

let catalog = readSimCatalog();
let inUse = {};

const createSimStore = () => ({
  getSimCatalog() {
    return catalog;
  },

  findSimInCatalogByIcc(icc) {
    return findSimByIcc(icc, catalog);
  },

  findSimInCatalogByMsisdn(msisdn) {
    return catalog.find(sim => sim.msisdn === msisdn) || null;
  },

  saveSimInCatalog(icc, msisdn, displayNumber, brand, country, lineType, isVisible) {
    const newSimData = createSimData(icc, msisdn, displayNumber, brand, country, lineType, isVisible);

    if (this.findSimInCatalogByIcc(icc)) {
      const updatedSims = readSimCatalog().map(sim => sim.icc === icc ? newSimData : sim);
      catalogDb.push(SIM_CATALOG_PATH, updatedSims, true);
    } else {
      catalogDb.push(SIM_CATALOG_PATH, [newSimData], false);
    }

    catalog = readSimCatalog();
  },

  getAllSimsInUse(showHiddenSims) {
    const sims = Object.values(inUse).map(simInUse => {
      const simData = findSimByIcc(simInUse.icc, catalog);
      return showHiddenSims || !simData || simData.isVisible ? { ...simInUse,
        ...(simData ? simData : {})
      } : undefined;
    }).filter(Boolean);
    return sims.sort((simA, simB) => (0, _text.compareNullableStrings)(simA.msisdn, simB.msisdn));
  },

  findSimInUseByMsisdn(msisdn, returnHiddenSim) {
    return this.getAllSimsInUse(returnHiddenSim).find(sim => sim.msisdn === msisdn) || null;
  },

  findSimsInUseByDisplayNumber(displayNumber, returnHiddenSim) {
    return this.getAllSimsInUse(returnHiddenSim).filter(sim => sim.displayNumber === displayNumber);
  },

  getAllUnknownSimsInUse() {
    return [...Object.values(inUse)].filter(simInUse => !findSimByIcc(simInUse.icc, catalog));
  },

  findSimInUseByPortId(portId) {
    const simInUse = inUse[portId];

    if (simInUse) {
      const simData = findSimByIcc(simInUse.icc, catalog);
      return { ...simInUse,
        ...(simData ? simData : {})
      };
    }

    return null;
  },

  setSimInUse(icc, networkStatus, smsMode, portId) {
    if (icc && networkStatus && smsMode) {
      inUse[portId] = createSimInUse(icc, networkStatus, smsMode, portId);
    } else {
      _logger.default.error((0, _error.default)(_error.INVALID_SIM_STATUS_DATA, `Invalid sim data icc: ${icc}, network status: ${networkStatus ? networkStatus.name : undefined}, sms mode: ${smsMode}`));
    }
  },

  setSimRemoved(portId) {
    delete inUse[portId];
  },

  updateSimNetworkStatus(networkStatus, portId) {
    const sim = inUse[portId];

    if (sim) {
      this.setSimInUse(sim.icc, networkStatus, sim.smsMode, portId);
    }
  }

});

var _default = createSimStore;
exports.default = _default;