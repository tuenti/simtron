export interface SettingsStore {
    setPortActivityNotificationsStatus: (isEnabled: boolean) => void;
    arePortActivityNotificationsEnabled: () => boolean;
}

const createSettingsStore = (): SettingsStore => {
    let portActivityNotificationsEnabled = false;

    return {
        setPortActivityNotificationsStatus: (isEnabled: boolean) => {
            portActivityNotificationsEnabled = isEnabled;
        },
        arePortActivityNotificationsEnabled: () => portActivityNotificationsEnabled,
    };
};

export default createSettingsStore;
