export const NON_RESPONSIVE_PORTS = 'non-responsive-ports';
export const INVALID_SIM_STATUS_DATA = 'invalid-sim-status-data';
export const PORT_NOT_FOUND = 'port-not-found';
export const MISSING_SMS_FIELDS = 'missing-sms-fields';
export const COMMAND_NOT_RESPONDING = 'command-not-responding';
export const SIM_NOT_PRESENT = 'sim-not-present';
export const NOTIFICATION_HANDLER_NOT_FOUND = 'notification-handler-not-found';
export const DEVICE_CONFIGURATION_ERROR = 'device-configuration-error';
export const FAILED_TO_SEND_OPT_BY_MAIL = 'failed-to-send-otp-by-mail';
export const MESSAGE_NOT_SEND_TO_TEAMS = 'message-not-sent-to-teams';

const Error = (reason: string, description: string): {reason: string; description: string} => ({
    reason,
    description,
});

export const throwableError = (reason: string, description: string) =>
    JSON.stringify(Error(reason, description));

export default Error;
