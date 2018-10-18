import {LAST_DIGITS} from '../../util/matcher';

export const NOT_REGISTERED = 0;
export const REGISTERED_HOME = 1;
export const SEARCHING = 2;
export const REGISTRATION_DENIED = 3;
export const UNKNOWN = 4;
export const REGISTERED_ROAMING = 5;
export const REGISTERED_HOME_SMS_ONLY = 6;
export const REGISTERED_ROAMING_SMS_ONLY = 7;
export const REGISTERED_FOR_EMERGENCY_ONLY = 8;
export const REGISTERED_HOME_FOR_CSFB = 9;
export const REGISTERED_ROAMING_FOR_CSFB = 10;

const networkStatusName = {
    [NOT_REGISTERED]: 'Not registered',
    [REGISTERED_HOME]: 'Registered in home network',
    [SEARCHING]: 'Searching network',
    [REGISTRATION_DENIED]: 'Registration denied',
    [UNKNOWN]: 'Unknown registration status',
    [REGISTERED_ROAMING]: 'Registered in roaming',
    [REGISTERED_HOME_SMS_ONLY]: 'Registered in home, SMS only',
    [REGISTERED_ROAMING_SMS_ONLY]: 'Registered in roaming, SMS only',
    [REGISTERED_FOR_EMERGENCY_ONLY]: 'Registered, only for emergency',
    [REGISTERED_HOME_FOR_CSFB]: 'Registered in home network, only CSFB',
    [REGISTERED_ROAMING_FOR_CSFB]: 'Registered in roaming, only CSFB',
};

export const getNetworkStatusName = networkStatus => networkStatusName[networkStatus];

export const createNetworkStatus = networkStatusLine => {
    const networkStatusId = parseInt(networkStatusLine.match(LAST_DIGITS)[0]);
    return {
        id: networkStatusId,
        name: getNetworkStatusName(networkStatusId),
        isWorking: [
            REGISTERED_HOME,
            REGISTERED_ROAMING,
            REGISTERED_HOME_SMS_ONLY,
            REGISTERED_ROAMING_SMS_ONLY,
        ].includes(networkStatusId),
    };
};
