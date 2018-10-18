const decodeUtf16 = text => {
    let result = [];
    for (let i = 0; i < text.length; i += 4) {
        result.push(parseInt(text.substring(i, i + 4), 16));
    }
    return String.fromCharCode(...result);
};

export default decodeUtf16;
