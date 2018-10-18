export const NON_RESPONSIVE_PORTS = 'non-responsive-ports';
export const INVALID_ICC = 'invalid-icc';
export const MISSING_SMS_FIELDS = 'missing-sms-fields';
export const COMMAND_NOT_RESPONDING = 'command-not-responding';
export const SIM_NOT_PRESENT = 'sim-not-present';

const Error = (reason, description) => ({
    reason,
    description,
});

export default Error;
