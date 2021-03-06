import {createLogger, format, transports} from 'winston';
import debugLoggerFactory from 'debug';

const debug = debugLoggerFactory('app');

const logger = createLogger({
    transports: new transports.Console({
        format: format.combine(
            format.timestamp({
                format: 'YYYY-MM-DD hh:mm:ss',
            }),
            format.json()
        ),
    }),
});

export default {
    error: (error: {reason: string; description: string}) => {
        logger.error(error);
        if (process.env.DEVELOPMENT) {
            throw error;
        }
    },

    warning: (message: string) => {
        logger.warn(message);
    },

    info: (message: string) => {
        logger.info(message);
    },

    debug: (message: string) => {
        debug(message);
    },
};
