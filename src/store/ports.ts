let ports: any[] = [];

export interface PortsStore {
    registerPorts: (ports: any[]) => void;
    findPortByIndex: (index: number) => object | null;
    getAll: () => any[];
}

const createPortsStore = (): PortsStore => ({
    registerPorts: detectedPorts => (ports = detectedPorts),
    findPortByIndex: (index: number) => ports.find(port => port.portIndex === index),
    getAll: () => ports,
});

export default createPortsStore;
