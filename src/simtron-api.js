import express from 'express';
import logger from './util/logger';
import createApiServer from './graphql';
import createApiSlackBot from './bot/api';
import {getApiSlackBotToken} from './config';

const startApi = () => {
    const apiBot = createApiSlackBot(getApiSlackBotToken());
    apiBot.start();
    const {server, notificationsHandler} = createApiServer();
    server.listen(4000, notificationsHandler);
    logger.debug(
        'Api ready at http://localhost:4000/api, subscriptions ready at http://localhost:4000/subscriptions'
    );
};

export default startApi;
