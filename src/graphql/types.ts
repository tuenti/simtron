export type Maybe<T> = T | null;

export enum PaymentType {
    Prepay = 'Prepay',
    Control = 'Control',
    Postpay = 'Postpay',
}

// ====================================================
// Types
// ====================================================

export interface Query {
    getSims: Sim[];
}

export interface Sim {
    phoneNumber?: Maybe<string>;

    brand?: Maybe<string>;

    country?: Maybe<string>;

    paymentType?: Maybe<PaymentType>;

    isOnline?: Maybe<boolean>;
}

// ====================================================
// Arguments
// ====================================================

export interface GetSimsQueryArgs {
    brand: string;
}
