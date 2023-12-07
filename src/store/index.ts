import createSimStore, {SimStore} from './sim-catalog';
import createSettingsStore, {SettingsStore} from './settings';
import createPortsStore, {PortsStore} from './ports';

export interface Store {
    sim: SimStore;
    ports: PortsStore;
    settings: SettingsStore;
}

const createStore = (): Store => ({
    sim: createSimStore(),
    ports: createPortsStore(),
    settings: createSettingsStore(),
});

export default createStore;
