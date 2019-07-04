import typeDefs from './model/graphql';
import createResolvers from './resolvers';
import {makeExecutableSchema} from 'graphql-tools';

export const createSchema = () => {
    return makeExecutableSchema({typeDefs, resolvers: createResolvers()});
};

export default makeExecutableSchema({typeDefs});
