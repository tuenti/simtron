import libPhoneNumber from 'google-libphonenumber';
import {NON_DIGITS} from './matcher';
import {getPhoneNumberCustomFormatters} from '../config';

type PhoneNumberFormat = 'national' | 'international';

const phoneUtil = libPhoneNumber.PhoneNumberUtil.getInstance();

const mapFormat = (format: PhoneNumberFormat) =>
    format === 'national'
        ? libPhoneNumber.PhoneNumberFormat.NATIONAL
        : libPhoneNumber.PhoneNumberFormat.INTERNATIONAL;

const applyCustomFormat = (phoneNumber: string, country: string, brand: string): string => {
    const customFormatter = getPhoneNumberCustomFormatters(country, brand);
    return customFormatter
        ? phoneNumber.replace(new RegExp(customFormatter.regexp, 'g'), customFormatter.replaceValue)
        : phoneNumber;
};

export const formatPhoneNumber = (
    phoneNumber: string,
    country: string,
    brand: string,
    format: PhoneNumberFormat
): string => {
    const number = phoneUtil.parseAndKeepRawInput(phoneNumber, country);
    const numberFormat = mapFormat(format);
    const formattedNumber = phoneUtil.format(number, numberFormat).replace(NON_DIGITS, '');
    return format === 'national' ? applyCustomFormat(formattedNumber, country, brand) : formattedNumber;
};
