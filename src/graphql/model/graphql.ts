import {gql} from 'apollo-server-express';

export default [
    gql`
        type SimStatus {
            id: String
            name: String
        }

        type Sim {
            msisdn: String
            environments: [String]
            brand: String
            country: String
            status: SimStatus
            isOnline: Boolean
        }

        type Query {
            getSims: [Sim]
        }
    `,
];
