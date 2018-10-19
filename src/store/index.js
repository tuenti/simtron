import createSmsStore from './received-sms';
import createSimStore from './sim-catalog';
import createQuestionaryStore from './questionary';

const createStore = () => ({
    sim: createSimStore(),
    sms: createSmsStore(),
    questionary: createQuestionaryStore(),
});

export default createStore;
