import createSmsStore, {SmsStore} from './received-sms';
import createSimStore, {SimStore} from './sim-catalog';
import createQuestionaryStore, {QuestionaryStore} from './questionary';

export interface Store {
    sim: SimStore;
    sms: SmsStore;
    questionary: QuestionaryStore;
}

const createStore = (): Store => ({
    sim: createSimStore(),
    sms: createSmsStore(),
    questionary: createQuestionaryStore(),
});

export default createStore;
