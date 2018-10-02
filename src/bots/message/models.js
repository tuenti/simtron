import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE} from './message-type';

export const createBootingMessage = () => ({
    type: NOTIFY_BOOTING,
});

export const createBootDoneMessage = () => ({
    type: NOTIFY_BOOT_DONE,
});
