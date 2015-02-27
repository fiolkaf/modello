function deepClone(data) {
    return JSON.parse(JSON.stringify(data));
}

module.exports = {
    deepClone: deepClone
};
