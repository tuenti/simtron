const createSmsReceivedNotification = () => ({
    id: '+CMT',
    notificationParser: notificationLines => {
        const headerParts = notificationLines[0].split('"');
        const senderMsisdn = headerParts[1];
        const time = headerParts[5];
        const [, ...smsLines] = notificationLines;
        return {
            senderMsisdn,
            time,
            smsLines,
        };
    },
});

export default [createSmsReceivedNotification()];
