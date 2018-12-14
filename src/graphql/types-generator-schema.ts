import typeDefs from './model/graphql';
import {makeExecutableSchema} from 'graphql-tools';

export default makeExecutableSchema({typeDefs});
