import {Store} from '../../store';
import createGetAllSimsResolver from './sims';

const createResolvers = (store: Store) => {
    return [
        {
            Query: {
                getSims: createGetAllSimsResolver(store),
            },
        },
    ];
};

export default createResolvers;
