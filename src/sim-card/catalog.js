import JsonDB from 'node-json-db';
import logger from '../logger';
import Error, {INVALID_ICC} from '../error';

const CONFIG_DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';

const catalogDb = new JsonDB(CONFIG_DB_FILE, true, true);

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

const createUnknownSimInUse = (icc, networkStatus, portId) => {
    const {id, name} = networkStatus;
    return {
        icc,
        networkStatus: {id, name},
        portId,
    };
};

const createKnownSimInUse = (sim, networkStatus, portId) => {
    const {id, name} = networkStatus;
    return {
        ...sim,
        networkStatus: {id, name},
        portId,
    };
};

const createSimCatalog = () => ({
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

    setSimInUse(icc, networkStatus, portId) {
        if (icc && networkStatus) {
            const sim = findSimByIcc(icc, this.catalog);
            this.inUse[portId] = sim
                ? createKnownSimInUse(sim, networkStatus, portId)
                : createUnknownSimInUse(icc, networkStatus, portId); 
        } else {
            logger.error(Error(INVALID_ICC, `Invalid icc: ${icc}`));
        }
    },
});

export default createSimCatalog;