const delayed = (func: () => void, delayMs: number): Promise<void> =>
    new Promise(resolve => {
        setTimeout(() => {
            func();
            resolve();
        }, delayMs);
    });

export default delayed;
