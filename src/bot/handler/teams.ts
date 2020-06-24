import https from 'https';
import logger from '../../util/logger';
import Error, {MESSAGE_NOT_SEND_TO_TEAMS} from '../../util/error';
import {OutgoingMessage} from '../model/message';
import {IncomingMessageListener, Bot} from '..';
import adaptMessage, {TeamsMessage} from '../message-adapter/teams';

const createTeamsBot = (incomingWebhookHost: string, incomingWebhookPath: string): Bot => {
    const sendMessage = (message: TeamsMessage) => {
        const data = JSON.stringify(message);
        const options = {
            hostname: incomingWebhookHost,
            port: 443,
            path: incomingWebhookPath,
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
            },
        };
        const req = https.request(options, (res) => {
            logger.debug(`Response from teams ${res}`);
            res.on('data', (data) => {
                logger.debug(`Response from teams ${data}`);
            });
        });

        req.on('error', (error) => {
            logger.error(
                Error(MESSAGE_NOT_SEND_TO_TEAMS, `Sms received but not sent to MS Teams, error: ${error}`)
            );
        });

        req.write(data);
        req.end();
    };

    const bot = {
        listeners: <IncomingMessageListener[]>[],

        addListener(listener: IncomingMessageListener) {
            this.listeners.push(listener);
        },

        clearListeners() {
            this.listeners = [];
        },

        sendMessage(message: OutgoingMessage) {
            const teamsMessage = adaptMessage(message);
            if (teamsMessage) {
                sendMessage(teamsMessage);
            }
        },

        start() {
            logger.debug('Teams webhook based integration started');
        },
    };

    return bot;
};

export default createTeamsBot;
