import {SlackMessage} from '../message-adapter/slack';
import {LINE_INFO, OTP_CODE} from '../../util/matcher';
import {OtpStoreOperation} from '../../graphql/resolvers/otp-request-storage';

const createOtpMessageParser = (storeOtp: OtpStoreOperation) => (message: SlackMessage) => {
    const phoneNumberMatch = LINE_INFO.exec(message.text);
    LINE_INFO.lastIndex = 0;
    if (phoneNumberMatch) {
        const phoneNumber = phoneNumberMatch[2];
        if (message.attachments && message.attachments[0] && message.attachments[0].text) {
            const otpMatch = OTP_CODE.exec(message.attachments[0].text);
            OTP_CODE.lastIndex = 0;
            if (otpMatch) {
                storeOtp(phoneNumber, otpMatch[1]);
            }
        }
    }
};

export default createOtpMessageParser;
