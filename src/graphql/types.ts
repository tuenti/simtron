/* tslint:disable */

// ====================================================
// START: Typescript template
// ====================================================

// ====================================================
// Types
// ====================================================

export interface Query {
    getSims?: (Sim | null)[] | null;
}

export interface Sim {
    msisdn?: string | null;

    environments?: (string | null)[] | null;

    brand?: string | null;

    country?: string | null;

    status?: SimStatus | null;

    isOnline?: boolean | null;
}

export interface SimStatus {
    id?: string | null;

    name?: string | null;
}

// ====================================================
// Arguments
// ====================================================

// ====================================================
// END: Typescript template
// ====================================================
