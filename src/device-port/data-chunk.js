import logger from '../logger';

const allowedLinePrefixes = ['AT', 'OK', 'ERROR', '+CMS ERROR', '+CME ERROR', '+CMT', '+CREG:', '+CCID'];

const SMS_PDU_MIN_LENGTH = 50;

const isValidLine = line =>
    allowedLinePrefixes.some(prefix => line.startsWith(prefix)) || line.length >= SMS_PDU_MIN_LENGTH;

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
                } else if (this.serialLineBuffer.length > 0) {
                    logger.debug(`Receiving unsupported line: ${this.serialLineBuffer}`);
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
