import typeDefs from './model/graphql';
import createResolvers from './resolvers';
import {makeExecutableSchema} from 'graphql-tools';
import {Store} from '../store';

export const createSchema = (store: Store) => {
    return makeExecutableSchema({typeDefs, resolvers: createResolvers(store)});
};

export default makeExecutableSchema({typeDefs});
