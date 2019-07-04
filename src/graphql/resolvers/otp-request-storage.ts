export type OtpRequestsStorage = {[apiToken: string]: {[phoneNumber: string]: string[]}};

export type OtpRequestStorageAddOperation = (apiToken: string, phoneNumber: string) => void;
export type OtpGetterOperation = (apiToken: string, phoneNumber: string) => string[];
export type OtpStoreOperation = (phoneNumber: string, otp: string) => void;

let pendingReqests: OtpRequestsStorage = {};

export const addOtpRequest = (apiToken: string, phoneNumber: string) => {
    if (pendingReqests[apiToken]) {
        if (!pendingReqests[apiToken][phoneNumber]) {
            pendingReqests[apiToken][phoneNumber] = [];
        }
    } else {
        pendingReqests[apiToken] = {[phoneNumber]: []};
    }
};

export const storeOtp = (phoneNumber: string, otp: string) => {
    for (let apiKey in pendingReqests) {
        for (let phoneNumberKey in pendingReqests[apiKey]) {
            if (phoneNumber === phoneNumberKey) {
                pendingReqests[apiKey][phoneNumberKey].push(otp);
            }
        }
    }
};

export const readOtp = (apiToken: string, phoneNumber: string) => {
    if (pendingReqests[apiToken] && pendingReqests[apiToken][phoneNumber]) {
        const otps = pendingReqests[apiToken][phoneNumber];
        if (otps.length > 0) {
            delete pendingReqests[apiToken][phoneNumber];
            delete pendingReqests[apiToken];
        }
        return otps;
    }
    return [];
};
