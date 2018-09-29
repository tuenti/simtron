var JsonDB = require('node-json-db');

const CONFIG_DB_FILE = 'data/config';

const PORTS_SCAN_MAX_RETRIES_PATH = '/ports/scanMaxRetries'
const DEFAULT_PORTS_SCAN_MAX_RETRIES = 5;
const PORT_VENDORS_IDS_PATH = '/ports/vendors'
const DEFAULT_PORT_VENDORS_IDS = ['FTDI'];

const db = new JsonDB(CONFIG_DB_FILE, true, true);
console.log('otro objeto DB');

const readPath = (path, defaultValue) => {
    try {
        return db.getData(path);
    } catch(e) {
        return defaultValue;
    }
}

export const getPortScanMaxRetriesCount = () => readPath(PORTS_SCAN_MAX_RETRIES_PATH, DEFAULT_PORTS_SCAN_MAX_RETRIES);
export const getVendorIds = () => readPath(PORT_VENDORS_IDS_PATH, DEFAULT_PORT_VENDORS_IDS);