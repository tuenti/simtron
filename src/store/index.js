import createSmsStore from "./sms/received-sms";
import createSimStore from "./sim-card/catalog";

const createStore = () => ({
    sim: createSimStore(),
    sms: createSmsStore(),
});

export default createStore;