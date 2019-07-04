'use strict';

Object.defineProperty(exports, '__esModule', {
    value: true,
});
exports.default = void 0;

var _apolloServerExpress = require('apollo-server-express');

var _default = [
    _apolloServerExpress.gql`

        enum PaymentType {
            Prepay
            Control
            Postpay
        }

        type Sim {
            phoneNumber: String
            brand: String
            country: String
            paymentType: PaymentType
            isOnline: Boolean
        }

        type Query {
            getSims(brand): [Sim!]!
        }
    `,
];
exports.default = _default;
