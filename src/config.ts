import JsonDB from 'node-json-db';

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

const SIM_STATUS_SCHEDULE_TIME_PATH = '/sim/statusScheduleMs';
const DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS = 30000; // 30 sec.
const SIM_STATUS_POLLING_TIME_PATH = '/sim/statusPollingMs';
const DEFAULT_SIM_STATUS_POLLING_TIME_MS = 600000; // 10 min

const SLACK_BOT_TOKEN_PATH = '/bot/slack/token';
const SLACK_BOT_ID_PATH = '/bot/slack/botId';
const DEFAULT_SLACK_BOT_ID = 'B9EBK9YCT';
const SLACK_CHANNEL_ID_PATH = '/bot/slack/channelName';
const DEFAULT_SLACK_CHANNEL_ID = 'C9HRTJ44F';
const DEVELOPMENT_SLACK_CHANNEL_ID_PATH = '/bot/slack/developmentChannelId';
const SLACK_BOT_ADMIN_USER_IDS_PATH = '/bot/slack/adminUserIds';
const DEFAULT_SLACK_BOT_ADMIN_USER_IDS: string[] = [];

const BOT_NAMES_PATH = '/bot/names';
const DEFAULT_BOT_NAMES = ['simtron', '@simtron', '<@U9EEFTDKL>'];
const BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH = '/bot/sequenceWaitTime';
const DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME = 750;

const COUNTRIES_DATA_PATH = '/countries';
const DEFAULT_FLAG_REPRESENTATION = ':flag-aq:';

const PHONE_NUMBER_FORMATTER_PATH = '/phoneNumber/formatters';

const OTP_GMAIL_SENDER_ADDRESS_PATH = '/notifications/senderGmailAddress';
const OTP_GMAIL_SENDER_PASSWORD_PATH = '/notifications/senderPassword';
const OTP_MAIL_RECEIVERS_PATH = '/notifications/receivers';

const db = new JsonDB(CONFIG_DB_FILE, true, true);

const readPath = (path: string, defaultValue: any) => {
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
export const getSearchOperatorsCommandsTimeout = () =>
    readPath(DEVICES_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS_PATH, DEFAULT_SEARCH_OPERATORS_COMMAND_TIMEOUT_MS);
export const getDevicesCommandsResolveDelay = () =>
    readPath(DEVICES_COMMANDS_RESOLVE_DELAY_PATH, DEFAULT_DEVICES_COMMANDS_RESOLVE_DELAY);

export const getSimStatusRequestScheduleTime = () =>
    readPath(SIM_STATUS_SCHEDULE_TIME_PATH, DEFAULT_SIM_STATUS_SCHEDULE_TIME_MS);

export const getSimStatusPollingTime = () =>
    readPath(SIM_STATUS_POLLING_TIME_PATH, DEFAULT_SIM_STATUS_POLLING_TIME_MS);

export const getSlackBotToken = () => readPath(SLACK_BOT_TOKEN_PATH, undefined);
export const getSlackBotId = () => readPath(SLACK_BOT_ID_PATH, DEFAULT_SLACK_BOT_ID);
export const getSlackChannelId = () => readPath(SLACK_CHANNEL_ID_PATH, DEFAULT_SLACK_CHANNEL_ID);
export const getDevelopmentSlackChannelId = () => readPath(DEVELOPMENT_SLACK_CHANNEL_ID_PATH, undefined);
export const getSlackBotAdminUserIds = () =>
    readPath(SLACK_BOT_ADMIN_USER_IDS_PATH, DEFAULT_SLACK_BOT_ADMIN_USER_IDS);

export const getBotNames = () => readPath(BOT_NAMES_PATH, DEFAULT_BOT_NAMES);
export const getBotDisplayName = () => getBotNames()[0];
export const getBotMessageSequenceEnsuringTime = () =>
    readPath(BOT_MESSAGE_SEQUENCE_ENSURING_TIME_PATH, DEFAULT_BOT_MESSAGE_SEQUENCE_ENSURING_TIME);

export const getCountryName = (country: string) =>
    readPath(`${COUNTRIES_DATA_PATH}/${country}/name`, country);
export const getCountryFlag = (country: string | undefined) =>
    readPath(`${COUNTRIES_DATA_PATH}/${country ? country : 'none'}/flag`, DEFAULT_FLAG_REPRESENTATION);
export const getSupportedCountries = () => Object.keys(readPath(COUNTRIES_DATA_PATH, {}));
export const getSupportedBrands = (country: string) =>
    Object.keys(readPath(`${COUNTRIES_DATA_PATH}/${country}/lineTypes`, {}));
export const getSupportedLineTypes = (country: string, brand: string) =>
    readPath(`${COUNTRIES_DATA_PATH}/${country}/lineTypes/${brand}`, []);

export const getPhoneNumberCustomFormatters = (
    country: string,
    brand: string
): {regexp: string; replaceValue: string} | null =>
    readPath(`${PHONE_NUMBER_FORMATTER_PATH}/${brand}/${country}`, null);

export const getOtpGMailSenderAddress = () => readPath(OTP_GMAIL_SENDER_ADDRESS_PATH, null);
export const getOtpGMailSenderPassword = () => readPath(OTP_GMAIL_SENDER_PASSWORD_PATH, null);
export const getOtpMailReceivers = (): string[] => readPath(OTP_MAIL_RECEIVERS_PATH, null);
