import createSimStore, {SimStore} from './sim-catalog';
import createQuestionaryStore, {QuestionaryStore} from './questionary';
import createSettingsStore, {SettingsStore} from './settings';
import createPortsStore, {PortsStore} from './ports';

export interface Store {
    sim: SimStore;
    ports: PortsStore;
    questionary: QuestionaryStore;
    settings: SettingsStore;
}

const createStore = (): Store => ({
    sim: createSimStore(),
    ports: createPortsStore(),
    questionary: createQuestionaryStore(),
    settings: createSettingsStore(),
});

export default createStore;
