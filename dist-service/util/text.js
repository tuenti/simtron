"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.compareNullableStrings = exports.existSomeWordInText = void 0;

const existSomeWordInText = (words, text) => {
  const textWords = text.split(' ');
  return !!words.find(word => textWords.includes(word));
};

exports.existSomeWordInText = existSomeWordInText;

const compareNullableStrings = (stringA, stringB) => {
  if (!stringA) {
    return -1;
  } else if (!stringB) {
    return 1;
  } else if (stringA < stringB) {
    return -1;
  } else if (stringA > stringB) {
    return 1;
  } else {
    return 0;
  }
};

exports.compareNullableStrings = compareNullableStrings;