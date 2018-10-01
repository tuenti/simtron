let serialLineBuffer = '';
const readDataChunk = (dataChunk, onEndOfLineReceived) => {
    const dataChunkLength = dataChunk.length;

    for (let i = 0; i < dataChunkLength; i++) {
        const charCode = dataChunk.charCodeAt(i);
        if (charCode != 10 && charCode != 13) {
            serialLineBuffer += dataChunk.charAt(i);
        } else {
            if (serialLineBuffer !== '') {
                onEndOfLineReceived(serialLineBuffer);
            }
            serialLineBuffer = '';
        }
    }
};

export default readDataChunk;
