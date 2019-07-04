import {GetSimsQueryArgs, Sim} from '../types';

type AllSimsResolver = (_: any, args: GetSimsQueryArgs) => Promise<Sim[]>;

const createGetAllSimsResolver = (): AllSimsResolver => async (_: any, args: GetSimsQueryArgs) => {
    console.log(args.brand);
    return [];
};

export default createGetAllSimsResolver;
