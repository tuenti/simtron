import {LAST_DIGITS} from '../../util/matcher';

const UNKNOWN_NETWORK_STATUS_NAME = 'Unknown registration status';

enum NetworkStatusId {
    NOT_REGISTERED = 0,
    REGISTERED_HOME = 1,
    SEARCHING = 2,
    REGISTRATION_DENIED = 3,
    UNKNOWN = 4,
    REGISTERED_ROAMING = 5,
    REGISTERED_HOME_SMS_ONLY = 6,
    REGISTERED_ROAMING_SMS_ONLY = 7,
    REGISTERED_FOR_EMERGENCY_ONLY = 8,
    REGISTERED_HOME_FOR_CSFB = 9,
    REGISTERED_ROAMING_FOR_CSFB = 10,
}

export interface NetworkStatus {
    id: NetworkStatusId;
    name: string;
    isWorking: boolean;
}

const networkStatusName = new Map<number, string>([
    [NetworkStatusId.NOT_REGISTERED, 'Not registered'],
    [NetworkStatusId.REGISTERED_HOME, 'Registered in home network'],
    [NetworkStatusId.SEARCHING, 'Searching network'],
    [NetworkStatusId.REGISTRATION_DENIED, 'Registration denied'],
    [NetworkStatusId.REGISTERED_ROAMING, 'Registered in roaming'],
    [NetworkStatusId.REGISTERED_HOME_SMS_ONLY, 'Registered in home, SMS only'],
    [NetworkStatusId.REGISTERED_ROAMING_SMS_ONLY, 'Registered in roaming, SMS only'],
    [NetworkStatusId.REGISTERED_FOR_EMERGENCY_ONLY, 'Registered, only for emergency'],
    [NetworkStatusId.REGISTERED_HOME_FOR_CSFB, 'Registered in home network, only CSFB'],
    [NetworkStatusId.REGISTERED_ROAMING_FOR_CSFB, 'Registered in roaming, only CSFB'],
    [NetworkStatusId.UNKNOWN, UNKNOWN_NETWORK_STATUS_NAME],
]);

export const getNetworkStatusName = (networkStatusId: NetworkStatusId): string =>
    networkStatusName.get(networkStatusId) || UNKNOWN_NETWORK_STATUS_NAME;

export const createNetworkStatus = (networkStatusLine: string): NetworkStatus => {
    const matches = networkStatusLine.match(LAST_DIGITS);
    const networkStatusId = matches ? parseInt(matches[0]) : NetworkStatusId.UNKNOWN;
    return {
        id: networkStatusId,
        name: getNetworkStatusName(networkStatusId),
        isWorking: [
            NetworkStatusId.REGISTERED_HOME,
            NetworkStatusId.REGISTERED_ROAMING,
            NetworkStatusId.REGISTERED_HOME_SMS_ONLY,
            NetworkStatusId.REGISTERED_ROAMING_SMS_ONLY,
        ].includes(networkStatusId),
    };
};
