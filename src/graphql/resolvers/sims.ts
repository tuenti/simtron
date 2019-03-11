import {SimInUse} from '../../store/sim-catalog';
import {Store} from '../../store';
import {Sim} from '../types';

type AllSimsResolver = () => Sim[];

const createGetAllSimsResolver = (store: Store): AllSimsResolver => () =>
    store.sim.getAllSimsInUse(false).map((sim: SimInUse) => ({
        msisdn: sim.msisdn,
        brand: sim.brand,
        country: sim.country,
        environments: ['prod'],
        status: {
            id: sim.networkStatus.id.toString(),
            name: sim.networkStatus.name,
        },
        isOnline: sim.networkStatus.isWorking,
    }));

export default createGetAllSimsResolver;
