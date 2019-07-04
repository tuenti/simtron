"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

const createDataChunkReader = () => ({
  serialLineBuffer: '',

  read(dataChunk, onEndOfLineReceived) {
    const dataChunkLength = dataChunk.length;

    for (let i = 0; i < dataChunkLength; i++) {
      const charCode = dataChunk.charCodeAt(i);

      if (charCode != 10 && charCode != 13) {
        this.serialLineBuffer += dataChunk.charAt(i);
      } else {
        if (this.serialLineBuffer.length > 0) {
          onEndOfLineReceived(this.serialLineBuffer);
        }

        this.serialLineBuffer = '';
      }
    }
  },

  clear() {
    this.serialLineBuffer = '';
  }

});

var _default = createDataChunkReader;
exports.default = _default;