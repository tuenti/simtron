import {NOTIFY_BOOTING, NOTIFY_BOOT_DONE} from './message-type';

export const createBootingMessage = () => ({
    type: NOTIFY_BOOTING,
    text: 'Booting ...',
});

export const createBootDoneMessage = () => ({
    type: NOTIFY_BOOT_DONE,
    text: 'Ready',
});
