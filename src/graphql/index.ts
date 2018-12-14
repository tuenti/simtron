import {ApolloServer} from 'apollo-server-express';
import {createSchema} from './schema';
import {Store} from '../store';

const createGraphqlServer = (store: Store) => {
    const schema = createSchema(store);
    return new ApolloServer({schema, playground: false});
};

export default createGraphqlServer;
