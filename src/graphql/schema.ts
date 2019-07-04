import typeDefs from './model/graphql';
import createResolvers from './resolvers';
import {makeExecutableSchema} from 'graphql-tools';
import {ApiBot} from '../bot/api';

export const createSchema = (slackBot: ApiBot) => {
    return makeExecutableSchema({typeDefs, resolvers: createResolvers(slackBot)});
};

export default makeExecutableSchema({typeDefs});
