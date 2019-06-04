import createSmsStore, {SmsStore} from './received-sms';
import createSimStore, {SimStore} from './sim-catalog';
import createQuestionaryStore, {QuestionaryStore} from './questionary';
import createSettingsStore, {SettingsStore} from './settings';

export interface Store {
    sim: SimStore;
    sms: SmsStore;
    questionary: QuestionaryStore;
    settings: SettingsStore;
}

const createStore = (): Store => ({
    sim: createSimStore(),
    sms: createSmsStore(),
    questionary: createQuestionaryStore(),
    settings: createSettingsStore(),
});

export default createStore;
