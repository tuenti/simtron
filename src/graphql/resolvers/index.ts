import createGetAllSimsResolver from './sims';
import {createNewOtpSubscriptionResolver} from './subscription';
import {PubSub} from 'graphql-subscriptions';
import {ApiBot} from '../../bot/api';
import {createListenToOtpsResolver, createGetOtpsResolver} from './otp';
import {addOtpRequest, readOtp, storeOtp} from './otp-request-storage';
import createOtpMessageParser from '../../bot/api/otp-message-parser';

const createResolvers = (slackBot: ApiBot) => {
    slackBot.addListener(createOtpMessageParser(storeOtp));

    return [
        {
            Subscription: {
                otpReceived: {
                    subscribe: createNewOtpSubscriptionResolver(slackBot, new PubSub()),
                },
            },
            Mutation: {
                listenToOtps: createListenToOtpsResolver(addOtpRequest),
            },
            Query: {
                getSims: createGetAllSimsResolver(slackBot),
                getOtps: createGetOtpsResolver(readOtp),
            },
        },
    ];
};

export default createResolvers;
