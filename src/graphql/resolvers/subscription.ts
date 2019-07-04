import {PubSub} from 'graphql-subscriptions';
import {ApiBot} from '../../bot/api';

export const NEW_OTP = 'NEW_OTP';

export const createNewOtpSubscriptionResolver = (slackBot: ApiBot, graphqlPubSub: PubSub) => {
    const onNewSmsReceived = () => {
        graphqlPubSub.publish(NEW_OTP, {
            otpReceived: {code: 'HOLA CODE'},
        });
    };

    setInterval(() => {
        onNewSmsReceived();
    }, 1000);

    return () => graphqlPubSub.asyncIterator(NEW_OTP);
};
