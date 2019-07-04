import createGetAllSimsResolver from './sims';
import {createNewOtpSubscriptionResolver} from './subscription';
import {PubSub} from 'graphql-subscriptions';

const createResolvers = () => {
    return [
        {
            Subscription: {
                otpReceived: {
                    subscribe: createNewOtpSubscriptionResolver(new PubSub()),
                },
            },
            Query: {
                getSims: createGetAllSimsResolver(),
            },
        },
    ];
};

export default createResolvers;
