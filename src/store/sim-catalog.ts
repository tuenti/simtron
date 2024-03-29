import JsonDB from 'node-json-db';
import logger from '../util/logger';
import Error, {INVALID_SIM_STATUS_DATA} from '../util/error';
import {NetworkStatus} from '../device-port/model/network-status';
import {compareNullableStrings} from '../util/text';

interface Sim {
    icc: string;
}

interface SimPin {
    pin: string;
    imei: string;
}

type SimPins = {[key: string]: SimPin};

interface SimData extends Sim {
    msisdn: string;
    displayNumber: string;
    brand: string;
    country: string;
    lineType: string;
    isVisible: boolean;
}

export enum SmsMode {
    NONE = 0,
    SMS_TEXT_MODE,
    SMS_PDU_MODE,
}

export interface SimInUse extends Sim {
    networkStatus: NetworkStatus;
    smsMode: SmsMode;
    portId: string;
    portIndex: number;
    msisdn?: string;
    displayNumber?: string;
    brand?: string;
    country?: string;
    lineType?: string;
    imei: string;
}

export const isSimInUse = (arg: any): arg is SimInUse =>
    !!arg.icc && !!arg.networkStatus && !!arg.smsMode && !!arg.portId && arg.portIndex !== undefined;

export interface PortInUse {
    portId: string;
    portIndex: number;
    imei: string;
    icc?: string;
}

export interface SimStore {
    getSimCatalog: () => SimData[];

    findSimInCatalogByIcc: (icc: string) => SimData | null;

    findSimInCatalogByMsisdn: (msisdn: string) => SimData | null;

    saveSimInCatalog: (
        icc: string,
        msisdn: string,
        displayNumber: string,
        brand: string,
        country: string,
        lineType: string,
        isVisible: boolean
    ) => void;

    getPinForImei: (imei: string) => SimPin | undefined;

    getAllSimsInUse: (showHiddenSims: boolean) => SimInUse[];

    getAllPortsWithBlockedSims: () => PortInUse[];

    findSimInUseByMsisdn: (msisdn: string, returnHiddenSim: boolean) => SimInUse | null;

    findSimsInUseByDisplayNumber: (displayNumber: string, returnHiddenSim: boolean) => SimInUse[];

    findSimInUseByIcc: (icc: string, returnHiddenSim: boolean) => SimInUse | null;

    getAllUnknownSimsInUse: () => SimInUse[];

    findSimInUseByPortId: (portId: string) => SimInUse | null;

    getBlockedSimByPortId: (portId: string) => PortInUse | null;

    setPinForImei: (pin: string, imei: string) => void;

    setSimInUse: (
        icc: string,
        networkStatus: NetworkStatus,
        smsMode: SmsMode,
        portId: string,
        portIndex: number,
        imei: string
    ) => void;

    setSimBlockedInPort: (portId: string, portIndex: number, imei: string, icc?: string) => void;

    setSimRemoved: (portId: string) => void;

    updateSimNetworkStatus: (networkStatus: NetworkStatus, portId: string, portIndex: number) => void;
}

const CATALOG_DB_FILE = 'data/sim-catalog';
const PINS_DB_FILE = 'data/sim-pins';
const SIM_CATALOG_PATH = '/catalog';
const SIM_PINS_PATH = '/pins';

const catalogDb = new JsonDB(CATALOG_DB_FILE, true, true);
const pinsDb = new JsonDB(PINS_DB_FILE, true, true);

const createSimPinForImei = (pin: string, imei: string) => ({pin, imei});

const createSimData = (
    icc: string,
    msisdn: string,
    displayNumber: string,
    brand: string,
    country: string,
    lineType: string,
    isVisible: boolean
): SimData => ({
    msisdn,
    displayNumber,
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
    portId: string,
    portIndex: number,
    imei: string
): SimInUse => ({
    icc,
    networkStatus,
    smsMode,
    portId,
    portIndex,
    imei,
});

const createPortInUse = (portId: string, portIndex: number, imei: string, icc?: string): PortInUse => ({
    portId,
    portIndex,
    imei,
    icc,
});

const readSimCatalog = (): SimData[] => {
    try {
        return catalogDb.getData(SIM_CATALOG_PATH);
    } catch (e: any) {
        if (e.name === 'DataError') {
            catalogDb.push(SIM_CATALOG_PATH, []);
        }
        return [];
    }
};

const readSimPins = (): SimPins => {
    try {
        return pinsDb.getData(SIM_PINS_PATH);
    } catch (e: any) {
        if (e.name === 'DataError') {
            catalogDb.push(SIM_PINS_PATH, []);
        }
        return {};
    }
};

const findSimByIcc = <T extends Sim>(icc: string, simList: T[]): T | null =>
    simList.find(sim => sim.icc === icc) || null;

let catalog: SimData[] = readSimCatalog();
let simPins: SimPins = readSimPins();
let simsInUse: {[key: string]: SimInUse} = {};
let portsInUse: {[key: string]: PortInUse} = {};

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
        displayNumber: string,
        brand: string,
        country: string,
        lineType: string,
        isVisible: boolean
    ) {
        const newSimData = createSimData(icc, msisdn, displayNumber, brand, country, lineType, isVisible);
        if (this.findSimInCatalogByIcc(icc)) {
            const updatedSims = readSimCatalog().map(sim => (sim.icc === icc ? newSimData : sim));
            catalogDb.push(SIM_CATALOG_PATH, updatedSims, true);
        } else {
            catalogDb.push(SIM_CATALOG_PATH, [newSimData], false);
        }
        catalog = readSimCatalog();
    },

    getPinForImei(imei: string): SimPin | undefined {
        return simPins[imei];
    },

    getAllSimsInUse(showHiddenSims: boolean): SimInUse[] {
        const sims = Object.values(simsInUse)
            .map((simInUse: SimInUse) => {
                const simData = findSimByIcc(simInUse.icc, catalog);
                return showHiddenSims || !simData || simData.isVisible
                    ? {...simInUse, ...(simData ? simData : {})}
                    : undefined;
            })
            .filter(Boolean) as SimInUse[];
        return sims.sort((simA, simB) => compareNullableStrings(simA.msisdn, simB.msisdn));
    },

    getAllPortsWithBlockedSims(): PortInUse[] {
        return Object.values(portsInUse).filter(port => !simsInUse[port.portId]);
    },

    getBlockedSimByPortId(portId: string) {
        return portsInUse[portId] && !simsInUse[portId] ? portsInUse[portId] : null;
    },

    findSimInUseByMsisdn(msisdn: string, returnHiddenSim: boolean) {
        return this.getAllSimsInUse(returnHiddenSim).find((sim: SimInUse) => sim.msisdn === msisdn) || null;
    },

    findSimsInUseByDisplayNumber(displayNumber: string, returnHiddenSim: boolean) {
        return this.getAllSimsInUse(returnHiddenSim).filter(
            (sim: SimInUse) => sim.displayNumber === displayNumber
        );
    },

    findSimInUseByIcc(icc: string, returnHiddenSim: boolean) {
        return this.getAllSimsInUse(returnHiddenSim).find((sim: SimInUse) => sim.icc === icc) || null;
    },

    getAllUnknownSimsInUse(): SimInUse[] {
        return [...Object.values(simsInUse)].filter(simInUse => !findSimByIcc(simInUse.icc, catalog));
    },

    findSimInUseByPortId(portId: string): SimInUse | null {
        const simInUse = simsInUse[portId];
        if (simInUse) {
            const simData = findSimByIcc(simInUse.icc, catalog);
            return {...simInUse, ...(simData ? simData : {})};
        }
        return null;
    },

    setPinForImei(pin: string, imei: string) {
        const newSimPin = createSimPinForImei(pin, imei);
        const pins = readSimPins();
        pins[imei] = newSimPin;
        pinsDb.push(SIM_PINS_PATH, pins, true);
        simPins = readSimPins();
    },

    setSimInUse(
        icc: string,
        networkStatus: NetworkStatus,
        smsMode: SmsMode,
        portId: string,
        portIndex: number,
        imei: string
    ) {
        if (icc && networkStatus && smsMode) {
            simsInUse[portId] = createSimInUse(icc, networkStatus, smsMode, portId, portIndex, imei);
            portsInUse[portId] = createPortInUse(portId, portIndex, imei, icc);
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

    setSimBlockedInPort(portId: string, portIndex: number, imei: string, icc?: string) {
        portsInUse[portId] = createPortInUse(portId, portIndex, imei, icc);
    },

    setSimRemoved(portId: string) {
        delete simsInUse[portId];
        delete portsInUse[portId];
    },

    updateSimNetworkStatus(networkStatus: NetworkStatus, portId: string, portIndex: number) {
        const sim = simsInUse[portId];
        if (sim) {
            this.setSimInUse(sim.icc, networkStatus, sim.smsMode, portId, portIndex, sim.imei);
        }
    },
});

export default createSimStore;
