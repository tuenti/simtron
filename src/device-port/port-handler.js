import readDataChunk from './data-chunk';

const createPortHandler = ({port, portName, baudRate}) => {
    const portHandler = {
        listeners: [],
        addListener(listener) {
            this.listeners.push(listener);
        },
        clearListeners() {
            this.listeners = [];
        },
        port,
        portId: portName,
        baudRate,
    };
    port.on('data', data => {
        const decodedData = data.toString('utf8');
        readDataChunk(decodedData, line => {
            portHandler.listeners.forEach(listener => {
                listener(portHandler, line);
            });
        });
    });
    return portHandler;
};

export default createPortHandler;
