export const NULL_UNICODE_CHAR = /[\u0000]/g;
export const NON_DIGITS = /\D/g;
export const QUOTED_TEXTS = /\"([^"]*)\"/g;
export const QUOTES = /\"/g;
export const LAST_DIGITS = /\d+$/g;
export const PARENTHESIS_GROUP = /\(([^()]*)\)/g;
export const LINE_INFO = /:(.+):.*\*(~?\d\d+~?)\*\s(\w*)\s(.*\S)/gm;
export const OTP_CODE = /\D*(\d{4,})\D*/g;
