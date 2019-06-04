export const existSomeWordInText = (words: string[], text: string) => {
    const textWords = text.split(' ');
    return !!words.find(word => textWords.includes(word));
};

export const compareNullableStrings = (stringA?: string | null, stringB?: string | null) => {
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
