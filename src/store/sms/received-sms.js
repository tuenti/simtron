import logger from '../../logger';
import Error, {MISSING_SMS_FIELDS} from '../../error';
import {getSmsMemoryMaxCount} from '../../config';

const createSms = (senderMsisdn, time, smsText) => {
    return {
        senderMsisdn,
        time,
        smsText,
    };
};

const createSmsStore = () => ({
    store: {},

    getAllSms(portId) {
        return this.store[portId];
    },

    addSms(senderMsisdn, time, smsText, portId) {
        if (senderMsisdn && time && smsText) {
            const sms = createSms(senderMsisdn, time, smsText);
            if (this.store[portId]) {
                this.store[portId].push(sms);
            } else {
                this.store[portId] = [sms];
            }
            if (this.store[portId].length > getSmsMemoryMaxCount()) {
                this.store[portId].shift();
            }
        } else {
            logger.error(
                Error(MISSING_SMS_FIELDS, `Check sms fields, senderMsisdn: '${senderMsisdn}', time: '${time}', smsText '${smsText}'`)
            );
        }
    },
});

export default createSmsStore;