import {Sim} from '../types';
import {ApiBot} from '../../bot/api';

type AllSimsResolver = () => Promise<Sim[]>;

const createGetAllSimsResolver = (slackBot: ApiBot): AllSimsResolver => async () => {
    return await slackBot.getSims();
};

export default createGetAllSimsResolver;
