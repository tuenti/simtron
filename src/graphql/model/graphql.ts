import {gql} from 'apollo-server-express';

export default [
    gql`
        type Sim {
            phoneNumber: String!
            brand: String!
            country: String!
            lineType: String!
            isOnline: Boolean!
        }

        type Otp {
            code: String!
        }

        type Subscription {
            otpReceived: Otp!
        }

        type Mutation {
            listenToOtps(apiToken: String!, phoneNumber: String!): Boolean
        }

        type Query {
            getSims: [Sim!]!
            getOtps(apiToken: String!, phoneNumber: String!): [String!]!
        }
    `,
];
