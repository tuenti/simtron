import createSmsStore, {SmsStore} from './received-sms';
import createSimStore, {SimStore} from './sim-catalog';
import createQuestionaryStore, {QuestionaryStore} from './questionary';
import createSettingsStore, {SettingsStore} from './settings';
import createPortsStore, {PortsStore} from './ports';

export interface Store {
    sim: SimStore;
    ports: PortsStore;
    sms: SmsStore;
    questionary: QuestionaryStore;
    settings: SettingsStore;
}

const createStore = (): Store => ({
    sim: createSimStore(),
    ports: createPortsStore(),
    sms: createSmsStore(),
    questionary: createQuestionaryStore(),
    settings: createSettingsStore(),
});

export default createStore;
