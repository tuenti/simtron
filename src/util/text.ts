export const existSomeWordInText = (words: string[], text: string) => {
    const textWords = text.split(' ');
    return !!words.find(word => textWords.includes(word));
};
