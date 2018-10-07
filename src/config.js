import JsonDB from 'node-json-db';

const CONFIG_DB_FILE = 'data/config';

const PORTS_SCAN_MAX_RETRIES_PATH = '/ports/scanMaxRetries';
const DEFAULT_PORTS_SCAN_MAX_RETRIES = 5;
const PORT_VENDORS_IDS_PATH = '/ports/vendors';
const DEFAULT_PORT_VENDORS_IDS = ['FTDI'];
const DEVICES_COMMANDS_TIMEOUT_MS_PATH = '/ports/commands/timeout';
const DEFAULT_DEVICES_COMMANDS_TIMEOUT_MS = 5000;
const SLACK_BOT_TOKEN_PATH = '/slackBot/token';
const DEVELOPMENT_SLACK_CHANNEL_NAME_PATH = '/slackBot/developmentChannelName';

const db = new JsonDB(CONFIG_DB_FILE, true, true);

const readPath = (path, defaultValue) => {
    try {
        return db.getData(path);
    } catch (e) {
        return defaultValue;
    }
};

export const getPortScanMaxRetriesCount = () =>
    readPath(PORTS_SCAN_MAX_RETRIES_PATH, DEFAULT_PORTS_SCAN_MAX_RETRIES);
export const getVendorIds = () => readPath(PORT_VENDORS_IDS_PATH, DEFAULT_PORT_VENDORS_IDS);
export const getDevicesCommandsTimeout = () =>
    readPath(DEVICES_COMMANDS_TIMEOUT_MS_PATH, DEFAULT_DEVICES_COMMANDS_TIMEOUT_MS);

export const getSlackBotToken = () => readPath(SLACK_BOT_TOKEN_PATH, undefined);
export const getDevelopmentSlackChannelName = () =>
    readPath(DEVELOPMENT_SLACK_CHANNEL_NAME_PATH, undefined);
