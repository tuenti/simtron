import express from 'express';
import createGraphqlServer from './graphql';
import logger from './util/logger';

const startApi = () => {
    const graphql = createGraphqlServer(store);
    const app = express();
    app.use(express.json());
    app.use(express.urlencoded({extended: true}));
    graphql.applyMiddleware({app, path: '/api'});
    app.listen({port: 4000}, () => logger.debug('Server ready at http://localhost:4000/api'));
};

export default startApi;
