import {gql} from 'apollo-server-express';

export default [
    gql`
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

        type Otp {
            code: String!
        }

        type Subscription {
            otpReceived: Otp!
        }

        type Query {
            getSims(brand: String!): [Sim!]!
        }
    `,
];
