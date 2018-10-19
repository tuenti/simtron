import JsonDB from 'node-json-db';

const CONFIG_DB_FILE = 'data/config';

const PORTS_SCAN_MAX_RETRIES_PATH = '/ports/scanMaxRetries';
const DEFAULT_PORTS_SCAN_MAX_RETRIES = 5;
const PORT_VENDORS_IDS_PATH = '/ports/vendors';
const DEFAULT_PORT_VENDORS_IDS = ['FTDI'];
const DEVICES_COMMANDS_TIMEOUT_MS_PATH = '/ports/commands/timeout';
const DEFAULT_DEVICES_COMMANDS_TIMEOUT_MS = 7000;
const DEVICES_COMMANDS_RESOLVE_DELAY_PATH = '/ports/commands/resolveDelay';
const DEFAULT_DEVICES_COMMANDS_RESOLVE_DELAY = 100;

const SMS_MEMORY_MAX_COUNT_PATH = '/sms/memoryMaxCount';
const DEFAULT_SMS_MEMORY_MAX_COUNT = 25;

const SIM_STATUS_SCHEDULE_TIME_PATH = '/sim/statusScheduleMs';
const DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS = 30000; // 30 sec.
const SIM_STATUS_POLLING_TIME_PATH = '/sim/statusPollingMs';
const DEFAULT_SIM_STATUS_POLLING_TIME_MS = 600000; // 10 min

const SLACK_BOT_TOKEN_PATH = '/bot/slack/token';
const DEVELOPMENT_SLACK_CHANNEL_NAME_PATH = '/bot/slack/developmentChannelName';
const SLACK_BOT_ADMIN_USER_IDS_PATH = '/bot/slack/adminUserIds';
const DEFAULT_SLACK_BOT_ADMIN_USER_IDS = ['U6XTUAV7X', 'U41NYS5EZ'];

const BOT_NAMES_PATH = '/bot/names';
const DEFAULT_BOT_NAMES = ['simtron', '@simtron', '<@U9EEFTDKL>'];
const BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH = '/bot/sequenceWaitTime';
const DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME = 500;
const BOT_FLAG_REPRESENTATION_PATH = '/bot/flags';
const DEFAULT_FLAG_REPRESENTATION = ':waving_white_flag:';

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
export const getDevicesCommandsResolveDelay = () =>
    readPath(DEVICES_COMMANDS_RESOLVE_DELAY_PATH, DEFAULT_DEVICES_COMMANDS_RESOLVE_DELAY);

export const getSmsMemoryMaxCount = () => readPath(SMS_MEMORY_MAX_COUNT_PATH, DEFAULT_SMS_MEMORY_MAX_COUNT);

export const getSimStatusRequestScheduleTime = () =>
    readPath(SIM_STATUS_SCHEDULE_TIME_PATH, DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS);

export const getSimStatusPollingTime = () =>
    readPath(SIM_STATUS_POLLING_TIME_PATH, DEFAULT_SIM_STATUS_POLLING_TIME_MS);

export const getSlackBotToken = () => readPath(SLACK_BOT_TOKEN_PATH, undefined);
export const getDevelopmentSlackChannelName = () => readPath(DEVELOPMENT_SLACK_CHANNEL_NAME_PATH, undefined);
export const getSlackBotAdminUserIds = () =>
    readPath(SLACK_BOT_ADMIN_USER_IDS_PATH, DEFAULT_SLACK_BOT_ADMIN_USER_IDS);

export const getBotNames = () => readPath(BOT_NAMES_PATH, DEFAULT_BOT_NAMES);
export const getBotDisplayName = () => getBotNames()[0];
export const getBotMessageSequenceEnsuringTime = () =>
    readPath(BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH, DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME);
export const getCountryFlag = country =>
    readPath(`${BOT_FLAG_REPRESENTATION_PATH}/${country}`, DEFAULT_FLAG_REPRESENTATION);
