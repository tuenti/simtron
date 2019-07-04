import express from 'express';
import {createSchema} from './schema';
import {ApolloServer} from 'apollo-server-express';
import {createServer} from 'http';
import {SubscriptionServer} from 'subscriptions-transport-ws';
import {execute, subscribe} from 'graphql';
import {ApiBot} from '../bot/api';

const createApiServer = (slackBot: ApiBot) => {
    const schema = createSchema(slackBot);
    const graphql = new ApolloServer({schema, playground: false});

    const api = express();
    api.use(express.json());
    api.use(express.urlencoded({extended: true}));
    graphql.applyMiddleware({app: api, path: '/api'});

    const server = createServer(api);

    return {
        api,
        server,
        notificationsHandler: () => {
            new SubscriptionServer(
                {
                    execute,
                    subscribe,
                    schema,
                },
                {
                    server,
                    path: '/subscriptions',
                }
            );
        },
    };
};

export default createApiServer;
