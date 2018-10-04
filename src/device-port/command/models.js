const ICC_LINE_PREFIX = '+CCID:';

export const createSetEchoModeCommand = enable => ({
    command: `ATE${enable ? '1' : '0'}`,
});

export const createEnableNotificationsCommand = () => ({
    command: 'AT+CNMI=1,2,0,0,0',
});

export const createReadIccCommand = () => ({
    command: 'AT+CCID',
    responseParser: responseLines => {
        const iccLine = responseLines.find(line => {
            return line.startsWith(ICC_LINE_PREFIX);
        });
        if (iccLine) {
            return {
                icc: iccLine.replace(/\D/g, ''),
            };
        }
        return {};
    },
});
