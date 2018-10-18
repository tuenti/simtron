import JsonDB from 'node-json-db';
import logger from '../../util/logger';
import Error, {INVALID_ICC} from '../../util/error';

const DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';

const catalogDb = new JsonDB(DB_FILE, true, true);

/**
 * @typedef {Object} Sim
 * @property {String} msisdn sim's msisdn
 * @property {String} icc sim's icc
 * @property {String} brand sim's brand
 * @property {String} country sim' scountry
 * @property {String} lineType sim's line type
 * @returns {[Sim]} array of Sim objects
 */
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

const findSimByIcc = (icc, catalog) => catalog.find(sim => sim.icc === icc);

const createUnknownSimInUse = (icc, networkStatus, smsMode, portId) => ({
    icc,
    networkStatus,
    smsMode,
    portId,
});

const createKnownSimInUse = (sim, networkStatus, smsMode, portId) => ({
    ...sim,
    networkStatus,
    smsMode,
    portId,
});

const createSimStore = () => ({
    catalog: readSimCatalog(),
    inUse: {},

    getAllSims() {
        return this.catalog;
    },

    getAllSimsInUse() {
        return this.inUse;
    },

    findSimInUseByPortId(portId) {
        return this.inUse[portId];
    },

    setSimInUse(icc, networkStatus, smsMode, portId) {
        if (icc && networkStatus && smsMode) {
            const sim = findSimByIcc(icc, this.catalog);
            this.inUse[portId] = sim
                ? createKnownSimInUse(sim, networkStatus, smsMode, portId)
                : createUnknownSimInUse(icc, networkStatus, smsMode, portId);
        } else {
            logger.error(Error(INVALID_ICC, `Invalid icc: ${icc}`));
        }
    },

    setSimRemoved(portId) {
        delete this.inUse[portId];
    },

    updateSimNetworkStatus(networkStatus, portId) {
        const sim = this.inUse[portId];
        if (sim) {
            this.setSimInUse(sim.icc, networkStatus, sim.smsMode, portId);
        }
    },
});

export default createSimStore;
