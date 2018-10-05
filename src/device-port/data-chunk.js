const createDataChunkReader = () => ({
    serialLineBuffer: '',

    read(dataChunk, onEndOfLineReceived) {
        const dataChunkLength = dataChunk.length;

        for (let i = 0; i < dataChunkLength; i++) {
            const charCode = dataChunk.charCodeAt(i);
            if (charCode != 10 && charCode != 13) {
                this.serialLineBuffer += dataChunk.charAt(i);
            } else {
                if (this.serialLineBuffer !== '') {
                    onEndOfLineReceived(this.serialLineBuffer);
                }
                this.serialLineBuffer = '';
            }
        }
    },

    clear() {
        this.serialLineBuffer = '';
    },
});

export default createDataChunkReader;
