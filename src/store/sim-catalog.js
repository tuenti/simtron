import JsonDB from 'node-json-db';
import logger from '../util/logger';
import Error, {INVALID_SIM_STATUS_DATA} from '../util/error';

const DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';

const catalogDb = new JsonDB(DB_FILE, true, true);

const createSim = (icc, msisdn, brand, country, lineType) => ({
    msisdn,
    icc,
    brand,
    country,
    lineType,
});

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

const createSimInUse = (icc, networkStatus, smsMode, portId) => ({
    icc,
    networkStatus,
    smsMode,
    portId,
});

const createSimStore = () => ({
    catalog: readSimCatalog(),
    inUse: {},

    getSimCatalog() {
        return this.catalog;
    },

    registerSimInCatalog(icc, msisdn, brand, country, lineType) {
        catalogDb.push(SIM_CATALOG_PATH, [createSim(icc, msisdn, brand, country, lineType)], false);
        this.catalog = readSimCatalog();
    },

    getAllSimsInUse() {
        return Object.keys(this.inUse).map(portId => {
            const inUseSim = this.inUse[portId];
            const simData = findSimByIcc(inUseSim.icc, this.catalog);
            return {...this.inUse[portId], ...(simData ? simData : {})};
        });
    },

    getAllUnknownSimsInUse() {
        return Object.keys(this.inUse)
            .map(portId => this.inUse[portId])
            .filter(sim => !findSimByIcc(sim.icc, this.catalog));
    },

    findSimInUseByPortId(portId) {
        return this.inUse[portId];
    },

    setSimInUse(icc, networkStatus, smsMode, portId) {
        if (icc && networkStatus && smsMode) {
            this.inUse[portId] = createSimInUse(icc, networkStatus, smsMode, portId);
        } else {
            logger.error(
                Error(
                    INVALID_SIM_STATUS_DATA,
                    `Invalid sim data icc: ${icc}, network status: ${
                        networkStatus ? networkStatus.name : undefined
                    }, sms mode: ${smsMode}`
                )
            );
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
