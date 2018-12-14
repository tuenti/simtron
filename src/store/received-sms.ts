import logger from '../util/logger';
import Error, {MISSING_SMS_FIELDS} from '../util/error';
import {getSmsMemoryMaxCount} from '../config';

const createSms = (senderMsisdn: string, time: string, smsText: string) => {
    return {
        senderMsisdn,
        time,
        smsText,
    };
};

interface Sms {
    senderMsisdn: string;
    time: string;
    smsText: string;
}

export interface SmsStore {
    getAllSms: (portId: string) => Sms[];
    addSms: (senderMsisdn: string, time: string, smsText: string, portId: string) => void;
}

let store: {[key: string]: Sms[]} = {};

const createSmsStore = (): SmsStore => ({
    getAllSms(portId: string) {
        return store[portId];
    },

    addSms(senderMsisdn, time, smsText, portId) {
        if (senderMsisdn && time && smsText) {
            const sms = createSms(senderMsisdn, time, smsText);
            if (store[portId]) {
                store[portId].push(sms);
            } else {
                store[portId] = [sms];
            }
            if (store[portId].length > getSmsMemoryMaxCount()) {
                store[portId].shift();
            }
        } else {
            logger.error(
                Error(
                    MISSING_SMS_FIELDS,
                    `Check sms fields, senderMsisdn: '${senderMsisdn}', time: '${time}', smsText '${smsText}'`
                )
            );
        }
    },
});

export default createSmsStore;
