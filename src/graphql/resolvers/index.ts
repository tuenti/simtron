import createGetAllSimsResolver from './sims';
import {PubSub, withFilter} from 'graphql-subscriptions';
import {ApiBot} from '../../bot/api';
import {createListenToOtpsResolver, createGetOtpsResolver} from './otp';
import {addOtpRequest, readOtp, storeOtp} from './otp-request-storage';
import createOtpMessageParser from '../../bot/api/otp-message-parser';
import {SlackMessage} from '../../bot/message-adapter/slack';

const NEW_OTP = 'NEW_OTP';
const graphqlPubSub = new PubSub();
const otpMessageParser = createOtpMessageParser();

const createResolvers = (slackBot: ApiBot) => {
    slackBot.addListener((message: SlackMessage) => {
        const parsedOtp = otpMessageParser(message);
        if (parsedOtp) {
            const {phoneNumber, otp} = parsedOtp;
            storeOtp(phoneNumber, otp);
            graphqlPubSub.publish(NEW_OTP, {
                otpReceived: {phoneNumber, otp},
            });
        }
    });

    return [
        {
            Subscription: {
                otpReceived: {
                    subscribe: withFilter(
                        () => graphqlPubSub.asyncIterator(NEW_OTP),
                        (payload, variables) =>
                            !variables.phoneNumber ||
                            payload.otpReceived.phoneNumber === variables.phoneNumber
                    ),
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
