export const existSomeWordInText = (words, text) => {
    const textWords = text.split(' ');
    return !!words.find(word => textWords.includes(word));
};
