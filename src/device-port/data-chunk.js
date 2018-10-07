
const allowedLinePrefixes = [
    'AT',
    'OK',
    'ERROR',
    '+CMS ERROR',
    '+CME ERROR',
    '+CMT',
    '+CREG:',
];

const SMS_PDU_MIN_LENGTH = 20;

const isValidLine = line => allowedLinePrefixes.some(prefix => line.startsWith(prefix)) || line.length >= SMS_PDU_MIN_LENGTH;

const createDataChunkReader = () => ({
    serialLineBuffer: '',

    read(dataChunk, onEndOfLineReceived) {
        const dataChunkLength = dataChunk.length;

        for (let i = 0; i < dataChunkLength; i++) {
            const charCode = dataChunk.charCodeAt(i);
            if (charCode != 10 && charCode != 13) {
                this.serialLineBuffer += dataChunk.charAt(i);
            } else {
                if (isValidLine(this.serialLineBuffer)) {
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
