"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPhoneNumberCustomFormatters = exports.getSupportedLineTypes = exports.getSupportedBrands = exports.getSupportedCountries = exports.getCountryFlag = exports.getCountryName = exports.getBotMessageSequenceEnsuringTime = exports.getBotDisplayName = exports.getBotNames = exports.getSlackBotAdminUserIds = exports.getDevelopmentSlackChannelId = exports.getSlackBotToken = exports.getSimStatusPollingTime = exports.getSimStatusRequestScheduleTime = exports.getSmsMemoryMaxCount = exports.getDevicesCommandsResolveDelay = exports.getSearchOperatorsCommandsTimeout = exports.getDevicesCommandsTimeout = exports.getVendorIds = exports.getPortScanMaxRetriesCount = void 0;

var _nodeJsonDb = _interopRequireDefault(require("node-json-db"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const CONFIG_DB_FILE = 'data/config';
const PORTS_SCAN_MAX_RETRIES_PATH = '/ports/scanMaxRetries';
const DEFAULT_PORTS_SCAN_MAX_RETRIES = 5;
const PORT_VENDORS_IDS_PATH = '/ports/vendors';
const DEFAULT_PORT_VENDORS_IDS = ['FTDI'];
const DEVICES_COMMANDS_TIMEOUT_MS_PATH = '/ports/commands/timeout';
const DEVICES_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS_PATH = '/ports/commands/searchOperatorTimeout';
const DEFAULT_DEVICES_COMMANDS_TIMEOUT_MS = 7000;
const DEFAULT_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS = 120000;
const DEVICES_COMMANDS_RESOLVE_DELAY_PATH = '/ports/commands/resolveDelay';
const DEFAULT_DEVICES_COMMANDS_RESOLVE_DELAY = 100;
const SMS_MEMORY_MAX_COUNT_PATH = '/sms/memoryMaxCount';
const DEFAULT_SMS_MEMORY_MAX_COUNT = 25;
const SIM_STATUS_SCHEDULE_TIME_PATH = '/sim/statusScheduleMs';
const DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS = 30000; // 30 sec.

const SIM_STATUS_POLLING_TIME_PATH = '/sim/statusPollingMs';
const DEFAULT_SIM_STATUS_POLLING_TIME_MS = 600000; // 10 min

const SLACK_BOT_TOKEN_PATH = '/bot/slack/token';
const DEVELOPMENT_SLACK_CHANNEL_ID_PATH = '/bot/slack/developmentChannelId';
const SLACK_BOT_ADMIN_USER_IDS_PATH = '/bot/slack/adminUserIds';
const DEFAULT_SLACK_BOT_ADMIN_USER_IDS = [];
const BOT_NAMES_PATH = '/bot/names';
const DEFAULT_BOT_NAMES = ['simtron', '@simtron', '<@U9EEFTDKL>'];
const BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH = '/bot/sequenceWaitTime';
const DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME = 750;
const COUNTRIES_DATA_PATH = '/countries';
const DEFAULT_FLAG_REPRESENTATION = ':flag-aq:';
const PHONE_NUMBER_FORMATTER_PATH = '/phoneNumber/formatters';
const db = new _nodeJsonDb.default(CONFIG_DB_FILE, true, true);

const readPath = (path, defaultValue) => {
  try {
    return db.getData(path);
  } catch (e) {
    return defaultValue;
  }
};

const getPortScanMaxRetriesCount = () => readPath(PORTS_SCAN_MAX_RETRIES_PATH, DEFAULT_PORTS_SCAN_MAX_RETRIES);

exports.getPortScanMaxRetriesCount = getPortScanMaxRetriesCount;

const getVendorIds = () => readPath(PORT_VENDORS_IDS_PATH, DEFAULT_PORT_VENDORS_IDS);

exports.getVendorIds = getVendorIds;

const getDevicesCommandsTimeout = () => readPath(DEVICES_COMMANDS_TIMEOUT_MS_PATH, DEFAULT_DEVICES_COMMANDS_TIMEOUT_MS);

exports.getDevicesCommandsTimeout = getDevicesCommandsTimeout;

const getSearchOperatorsCommandsTimeout = () => readPath(DEVICES_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS_PATH, DEFAULT_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS);

exports.getSearchOperatorsCommandsTimeout = getSearchOperatorsCommandsTimeout;

const getDevicesCommandsResolveDelay = () => readPath(DEVICES_COMMANDS_RESOLVE_DELAY_PATH, DEFAULT_DEVICES_COMMANDS_RESOLVE_DELAY);

exports.getDevicesCommandsResolveDelay = getDevicesCommandsResolveDelay;

const getSmsMemoryMaxCount = () => readPath(SMS_MEMORY_MAX_COUNT_PATH, DEFAULT_SMS_MEMORY_MAX_COUNT);

exports.getSmsMemoryMaxCount = getSmsMemoryMaxCount;

const getSimStatusRequestScheduleTime = () => readPath(SIM_STATUS_SCHEDULE_TIME_PATH, DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS);

exports.getSimStatusRequestScheduleTime = getSimStatusRequestScheduleTime;

const getSimStatusPollingTime = () => readPath(SIM_STATUS_POLLING_TIME_PATH, DEFAULT_SIM_STATUS_POLLING_TIME_MS);

exports.getSimStatusPollingTime = getSimStatusPollingTime;

const getSlackBotToken = () => readPath(SLACK_BOT_TOKEN_PATH, undefined);

exports.getSlackBotToken = getSlackBotToken;

const getDevelopmentSlackChannelId = () => readPath(DEVELOPMENT_SLACK_CHANNEL_ID_PATH, undefined);

exports.getDevelopmentSlackChannelId = getDevelopmentSlackChannelId;

const getSlackBotAdminUserIds = () => readPath(SLACK_BOT_ADMIN_USER_IDS_PATH, DEFAULT_SLACK_BOT_ADMIN_USER_IDS);

exports.getSlackBotAdminUserIds = getSlackBotAdminUserIds;

const getBotNames = () => readPath(BOT_NAMES_PATH, DEFAULT_BOT_NAMES);

exports.getBotNames = getBotNames;

const getBotDisplayName = () => getBotNames()[0];

exports.getBotDisplayName = getBotDisplayName;

const getBotMessageSequenceEnsuringTime = () => readPath(BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH, DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME);

exports.getBotMessageSequenceEnsuringTime = getBotMessageSequenceEnsuringTime;

const getCountryName = country => readPath(`${COUNTRIES_DATA_PATH}/${country}/name`, country);

exports.getCountryName = getCountryName;

const getCountryFlag = country => readPath(`${COUNTRIES_DATA_PATH}/${country ? country : 'none'}/flag`, DEFAULT_FLAG_REPRESENTATION);

exports.getCountryFlag = getCountryFlag;

const getSupportedCountries = () => Object.keys(readPath(COUNTRIES_DATA_PATH, {}));

exports.getSupportedCountries = getSupportedCountries;

const getSupportedBrands = country => Object.keys(readPath(`${COUNTRIES_DATA_PATH}/${country}/lineTypes`, {}));

exports.getSupportedBrands = getSupportedBrands;

const getSupportedLineTypes = (country, brand) => readPath(`${COUNTRIES_DATA_PATH}/${country}/lineTypes/${brand}`, []);

exports.getSupportedLineTypes = getSupportedLineTypes;

const getPhoneNumberCustomFormatters = (country, brand) => readPath(`${PHONE_NUMBER_FORMATTER_PATH}/${brand}/${country}`, null);

exports.getPhoneNumberCustomFormatters = getPhoneNumberCustomFormatters;