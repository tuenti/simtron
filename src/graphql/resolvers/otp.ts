import {ListenToOtpsMutationArgs} from '../types';
import {OtpRequestStorageAddOperation, OtpGetterOperation} from './otp-request-storage';

type ListenToOtpsResolver = (_: any, args: ListenToOtpsMutationArgs) => Promise<boolean>;
type GetOtpsResolver = (_: any, args: ListenToOtpsMutationArgs) => Promise<string[]>;

export const createListenToOtpsResolver = (
    addOtpRequest: OtpRequestStorageAddOperation
): ListenToOtpsResolver => async (_: any, args: ListenToOtpsMutationArgs) => {
    addOtpRequest(args.apiToken, args.phoneNumber);
    return true;
};

export const createGetOtpsResolver = (readOtp: OtpGetterOperation): GetOtpsResolver => async (
    _: any,
    args: ListenToOtpsMutationArgs
) => {
    return readOtp(args.apiToken, args.phoneNumber);
};
