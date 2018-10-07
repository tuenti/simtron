export const NON_RESPONSIVE_PORTS = 'non-responsive-ports';
export const INVALID_ICC = 'invalid-icc';
export const MISSING_SMS_FIELDS = 'missing-sms-fields';

const Error = (reason, description) => ({
    reason,
    description,
});

export default Error;
