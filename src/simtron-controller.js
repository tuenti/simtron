const createSimtronController = (devicePortHandlers, simsCatalog, bots) => {
    const handlePortIncomingLine = (port, line) => {
        console.log(`${port.portId}: ${line}`);
    };

    return {
        devicePortHandlers,
        simsCatalog,
        bots,

        start() {
            devicePortHandlers.forEach(portHandler => {
                portHandler.addListener(handlePortIncomingLine);
            });
            bots.forEach(bot => {
                bot.start();
            });
        },
    };
};

export default createSimtronController;
