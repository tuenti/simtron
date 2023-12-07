import JsonDB from 'node-json-db';

const SETTINGS_DB_FILE = 'data/settings';
const SETTINGS_PATH = '/settings';

const PORT_ACTIVITY_NOTIFICATIONS = 'portActivityNotifications';
const SMS_EMAIL_RECEIVERS = 'smsEmailReceivers';

export interface SettingsStore {
    setPortActivityNotificationsStatus: (isEnabled: boolean) => void;
    arePortActivityNotificationsEnabled: () => boolean;
    setSmsEmailReceivers: (msisdn: string, emailReceivers: string[]) => void;
}

const createSettingsStore = (): SettingsStore => {
    const settingsDb = new JsonDB(SETTINGS_DB_FILE, true, true);

    const readSettings = () => {
        try {
            return settingsDb.getData(SETTINGS_PATH);
        } catch (e) {
            if (e.name === 'DataError') {
                settingsDb.push(SETTINGS_PATH, {});
            }
            return {};
        }
    };

    const writeSettings = (settings: {[key: string]: any}) => {
        settingsDb.push(SETTINGS_PATH, settings);
    };

    let settings = readSettings();

    return {
        setPortActivityNotificationsStatus: (isEnabled: boolean) => {
            settings[PORT_ACTIVITY_NOTIFICATIONS] = isEnabled;
            writeSettings(settings);
        },
        arePortActivityNotificationsEnabled: (): boolean => settings[PORT_ACTIVITY_NOTIFICATIONS],
        setSmsEmailReceivers: (msisdn, emailReceivers: string[]) => {
            if (!settings[SMS_EMAIL_RECEIVERS]) {
                settings[SMS_EMAIL_RECEIVERS] = {};
            }
            settings[SMS_EMAIL_RECEIVERS][msisdn] = emailReceivers;
            writeSettings(settings);
        },
    };
};

export default createSettingsStore;
