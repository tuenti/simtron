import JsonDB from 'node-json-db';
import logger from '../util/logger';
import Error, {INVALID_SIM_STATUS_DATA} from '../util/error';
import {NetworkStatus} from '../device-port/model/network-status';
import {SmsMode} from '../device-config';

interface Sim {
    icc: string;
}

interface SimData extends Sim {
    msisdn: string;
    brand: string;
    country: string;
    lineType: string;
}

interface SimInUse extends Sim {
    networkStatus: NetworkStatus;
    smsMode: SmsMode;
    portId: string;
    msisdn?: string;
    brand?: string;
    country?: string;
    lineType?: string;
}

const DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';

const catalogDb = new JsonDB(DB_FILE, true, true);

const createSimData = (
    icc: string,
    msisdn: string,
    brand: string,
    country: string,
    lineType: string
): SimData => ({
    msisdn,
    icc,
    brand,
    country,
    lineType,
});

const createSimInUse = (
    icc: string,
    networkStatus: NetworkStatus,
    smsMode: SmsMode,
    portId: string
): SimInUse => ({
    icc,
    networkStatus,
    smsMode,
    portId,
});

const readSimCatalog = (): SimData[] => {
    try {
        return catalogDb.getData(SIM_CATALOG_PATH);
    } catch (e) {
        if (e.name === 'DataError') {
            catalogDb.push(SIM_CATALOG_PATH, []);
        }
        return [];
    }
};

const findSimByIcc = <T extends Sim>(icc: string, simList: T[]): T | null =>
    simList.find(sim => sim.icc === icc) || null;

const createSimStore = () => ({
    catalog: readSimCatalog(),
    inUse: new Map<string, SimInUse>(),

    getSimCatalog(): SimData[] {
        return this.catalog;
    },

    findSimInCatalogByIcc(icc: string): SimData | null {
        return findSimByIcc(icc, this.catalog);
    },

    findSimInCatalogByMsisdn(msisdn: string): SimData | null {
        return this.catalog.find(sim => sim.msisdn === msisdn) || null;
    },

    saveSimInCatalog(icc: string, msisdn: string, brand: string, country: string, lineType: string) {
        const newSimData = createSimData(icc, msisdn, brand, country, lineType);
        if (this.findSimInCatalogByIcc(icc)) {
            const updatedSims = readSimCatalog().map(sim => (sim.icc === icc ? newSimData : sim));
            catalogDb.push(SIM_CATALOG_PATH, updatedSims, true);
        } else {
            catalogDb.push(SIM_CATALOG_PATH, [newSimData], false);
        }
        this.catalog = readSimCatalog();
    },

    getAllSimsInUse(): SimInUse[] {
        return [...this.inUse.values()].map((simInUse: SimInUse) => {
            const simData = findSimByIcc(simInUse.icc, this.catalog);
            return {...simInUse, ...(simData ? simData : {})};
        });
    },

    findSimInUseByMsisdn(msisdn: string) {
        return this.getAllSimsInUse().find((sim: SimInUse) => sim.msisdn === msisdn);
    },

    getAllUnknownSimsInUse(): SimInUse[] {
        return [...this.inUse.values()].filter(simInUse => !findSimByIcc(simInUse.icc, this.catalog));
    },

    findSimInUseByPortId(portId: string): SimInUse | null {
        const simInUse = this.inUse.get(portId);
        if (simInUse) {
            const simData = findSimByIcc(simInUse.icc, this.catalog);
            return {...simInUse, ...(simData ? simData : {})};
        }
        return null;
    },

    setSimInUse(icc: string, networkStatus: NetworkStatus, smsMode: SmsMode, portId: string) {
        if (icc && networkStatus && smsMode) {
            this.inUse.set(portId, createSimInUse(icc, networkStatus, smsMode, portId));
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

    setSimRemoved(portId: string) {
        this.inUse.delete(portId);
    },

    updateSimNetworkStatus(networkStatus: NetworkStatus, portId: string) {
        const sim = this.inUse.get(portId);
        if (sim) {
            this.setSimInUse(sim.icc, networkStatus, sim.smsMode, portId);
        }
    },
});

export default createSimStore;
