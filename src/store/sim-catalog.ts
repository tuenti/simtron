import JsonDB from 'node-json-db';
import logger from '../util/logger';
import Error, {INVALID_SIM_STATUS_DATA} from '../util/error';
import {NetworkStatus} from '../device-port/model/network-status';
import {SmsMode} from '../device-config';
import {compareNullableStrings} from '../util/text';

interface Sim {
    icc: string;
}

interface SimData extends Sim {
    msisdn: string;
    brand: string;
    country: string;
    lineType: string;
    isVisible: boolean;
}

export interface SimInUse extends Sim {
    networkStatus: NetworkStatus;
    smsMode: SmsMode;
    portId: string;
    msisdn?: string;
    brand?: string;
    country?: string;
    lineType?: string;
}

export interface SimStore {
    getSimCatalog: () => SimData[];

    findSimInCatalogByIcc: (icc: string) => SimData | null;

    findSimInCatalogByMsisdn: (msisdn: string) => SimData | null;

    saveSimInCatalog: (
        icc: string,
        msisdn: string,
        brand: string,
        country: string,
        lineType: string,
        isVisible: boolean
    ) => void;

    getAllSimsInUse: (showHiddenSims: boolean) => SimInUse[];

    findSimInUseByMsisdn: (msisdn: string, returnHiddenSim: boolean) => SimInUse | null;

    getAllUnknownSimsInUse: () => SimInUse[];

    findSimInUseByPortId: (portId: string) => SimInUse | null;

    setSimInUse: (icc: string, networkStatus: NetworkStatus, smsMode: SmsMode, portId: string) => void;

    setSimRemoved: (portId: string) => void;

    updateSimNetworkStatus: (networkStatus: NetworkStatus, portId: string) => void;
}

const DB_FILE = 'data/sim-catalog';
const SIM_CATALOG_PATH = '/catalog';

const catalogDb = new JsonDB(DB_FILE, true, true);

const createSimData = (
    icc: string,
    msisdn: string,
    brand: string,
    country: string,
    lineType: string,
    isVisible: boolean
): SimData => ({
    msisdn,
    icc,
    brand,
    country,
    lineType,
    isVisible,
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

let catalog: SimData[] = readSimCatalog();
let inUse: {[key: string]: SimInUse} = {};

const createSimStore = (): SimStore => ({
    getSimCatalog(): SimData[] {
        return catalog;
    },

    findSimInCatalogByIcc(icc: string): SimData | null {
        return findSimByIcc(icc, catalog);
    },

    findSimInCatalogByMsisdn(msisdn: string): SimData | null {
        return catalog.find(sim => sim.msisdn === msisdn) || null;
    },

    saveSimInCatalog(
        icc: string,
        msisdn: string,
        brand: string,
        country: string,
        lineType: string,
        isVisible: boolean
    ) {
        const newSimData = createSimData(icc, msisdn, brand, country, lineType, isVisible);
        if (this.findSimInCatalogByIcc(icc)) {
            const updatedSims = readSimCatalog().map(sim => (sim.icc === icc ? newSimData : sim));
            catalogDb.push(SIM_CATALOG_PATH, updatedSims, true);
        } else {
            catalogDb.push(SIM_CATALOG_PATH, [newSimData], false);
        }
        catalog = readSimCatalog();
    },

    getAllSimsInUse(showHiddenSims: boolean): SimInUse[] {
        const sims = Object.values(inUse)
            .map((simInUse: SimInUse) => {
                const simData = findSimByIcc(simInUse.icc, catalog);
                return showHiddenSims || !simData || simData.isVisible
                    ? {...simInUse, ...(simData ? simData : {})}
                    : undefined;
            })
            .filter(Boolean) as SimInUse[];
        return sims.sort((simA, simB) => compareNullableStrings(simA.msisdn, simB.msisdn));
    },

    findSimInUseByMsisdn(msisdn: string, returnHiddenSim: boolean) {
        return this.getAllSimsInUse(returnHiddenSim).find((sim: SimInUse) => sim.msisdn === msisdn) || null;
    },

    getAllUnknownSimsInUse(): SimInUse[] {
        return [...Object.values(inUse)].filter(simInUse => !findSimByIcc(simInUse.icc, catalog));
    },

    findSimInUseByPortId(portId: string): SimInUse | null {
        const simInUse = inUse[portId];
        if (simInUse) {
            const simData = findSimByIcc(simInUse.icc, catalog);
            return {...simInUse, ...(simData ? simData : {})};
        }
        return null;
    },

    setSimInUse(icc: string, networkStatus: NetworkStatus, smsMode: SmsMode, portId: string) {
        if (icc && networkStatus && smsMode) {
            inUse[portId] = createSimInUse(icc, networkStatus, smsMode, portId);
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
        delete inUse[portId];
    },

    updateSimNetworkStatus(networkStatus: NetworkStatus, portId: string) {
        const sim = inUse[portId];
        if (sim) {
            this.setSimInUse(sim.icc, networkStatus, sim.smsMode, portId);
        }
    },
});

export default createSimStore;
