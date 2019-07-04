import {PubSub} from 'graphql-subscriptions';

export const NEW_OTP = 'NEW_OTP';

export const createNewOtpSubscriptionResolver = (graphqlPubSub: PubSub) => {
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
