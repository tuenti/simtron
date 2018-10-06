import decodePdu from '../encoding/pdu';

const createSmsReceivedNotification = () => ({
    id: '+CMT',
    notificationParser: notificationLines => {
        const [, ...smsLines] = notificationLines;
        const parsedSms = decodePdu(smsLines[0]);

        return {
            senderMsisdn: parsedSms.sender,
            time: parsedSms.time,
            smsText: parsedSms.text,
        };
    },
});

export default [createSmsReceivedNotification()];
