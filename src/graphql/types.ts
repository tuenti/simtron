export type Maybe<T> = T | null;

// ====================================================
// Types
// ====================================================

export interface Query {
    getSims: Sim[];

    getOtps: string[];
}

export interface Sim {
    phoneNumber: string;

    brand: string;

    country: string;

    lineType: string;

    isOnline: boolean;
}

export interface Mutation {
    listenToOtps?: Maybe<boolean>;
}

export interface Subscription {
    otpReceived: Otp;
}

export interface Otp {
    code: string;
}

// ====================================================
// Arguments
// ====================================================

export interface GetOtpsQueryArgs {
    apiToken: string;

    phoneNumber: string;
}
export interface ListenToOtpsMutationArgs {
    apiToken: string;

    phoneNumber: string;
}
