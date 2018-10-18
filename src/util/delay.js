const delayed = (func, delayMs) =>
    new Promise(resolve => {
        setTimeout(() => {
            func();
            resolve();
        }, delayMs);
    });

export default delayed;
